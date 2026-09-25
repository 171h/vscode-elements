/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect, fixture, html} from '@open-wc/testing';
import {sendKeys} from '@web/test-runner-commands';
import {literal, unsafeStatic} from 'lit/static-html.js';
import sinon from 'sinon';
import {toCssTime, toMilliseconds} from '../includes/form-mark-duration.js';
import {clickOnElement} from '../includes/test-helpers.js';
import '../vscode-checkbox/index.js';
import '../vscode-multi-select/index.js';
import '../vscode-option/index.js';
import '../vscode-single-select/index.js';
import '../vscode-textfield/index.js';
import {VscodeFormContainer} from './index.js';

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The keyframes of the fading animation of a surface. The browser resolves the
 * custom properties, so the keyframes show the colors of the active theme.
 */
const getFadeKeyframes = (surface: Element): Keyframe[] => {
  const animation = (
    surface.getAnimations() as unknown as Array<{
      animationName?: string;
      effect?: {getKeyframes: () => Keyframe[]};
    }>
  ).find((item) =>
    (item.animationName ?? '').includes('vsc-form-control-dirty-fade')
  );

  if (!animation?.effect) {
    throw new Error('the fading animation of the surface is not running');
  }

  return animation.effect.getKeyframes();
};

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Waits until the predicate is true, so the tests are not time sensitive. */
const waitFor = async (
  predicate: () => boolean,
  timeout = 3000
): Promise<void> => {
  const deadline = performance.now() + timeout;

  while (!predicate()) {
    if (performance.now() > deadline) {
      throw new Error('Timed out while waiting for the form state to change');
    }

    await delay(10);
  }
};

let formIndex = 0;

/** A unique id, so the states of the other tests can be filtered out. */
const nextFormId = (prefix: string) => `${prefix}-${formIndex++}`;

const getState = (id: string) =>
  VscodeFormContainer.getFormStates().find((state) => state.id === id);

const getStates = (...ids: string[]) =>
  VscodeFormContainer.getFormStates().filter((state) => ids.includes(state.id));

/**
 * Creates a form with attributes that are parsed as real attributes. The
 * attributes cannot be interpolated into the template, Lit does not create an
 * attribute part for a binding that is surrounded by whitespace.
 */
const createForm = async (id: string, attributes = '') => {
  const declaration = attributes
    ? `<vscode-form-container id="${id}" ${attributes}>`
    : `<vscode-form-container id="${id}">`;

  const element = await fixture<VscodeFormContainer>(html`
    ${literal`${unsafeStatic(declaration)}`}
    <vscode-form-group variant="vertical">
      <vscode-textfield></vscode-textfield>
      <vscode-checkbox label="Checkbox"></vscode-checkbox>
    </vscode-form-group>
    </vscode-form-container>
  `);

  await element.updateComplete;

  return element;
};

/**
 * Types into the native input of the first textfield. The input event is
 * dispatched by the component itself, like a real keystroke does.
 */
const typeIntoTextfield = (form: VscodeFormContainer, text: string) => {
  const textfield = form.querySelector('vscode-textfield')!;
  const input = textfield.shadowRoot!.querySelector('input')!;

  input.value = text;
  input.dispatchEvent(new InputEvent('input', {data: text, composed: true}));
  input.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
};

describe('vscode-form-container', () => {
  describe('mark duration', () => {
    it('interprets a number as milliseconds', () => {
      expect(toMilliseconds(5000)).to.eq(5000);
      expect(toMilliseconds(0)).to.eq(0);
      expect(toMilliseconds(-1000), 'a negative value').to.eq(0);
    });

    it('interprets a string as CSS time', () => {
      expect(toMilliseconds('2.5s')).to.eq(2500);
      expect(toMilliseconds('500ms')).to.eq(500);
      expect(toMilliseconds('0s')).to.eq(0);
      expect(toMilliseconds('-2.5s'), 'a negative value').to.eq(0);
      expect(toMilliseconds('-2500'), 'a negative value').to.eq(0);
    });

    it('converts a duration to a CSS time value', () => {
      expect(toCssTime(5000)).to.eq('5000ms');
      expect(toCssTime('1.5s')).to.eq('1500ms');
      expect(toCssTime('forever')).to.be.null;
      expect(toCssTime('-1000')).to.eq('0ms');
    });
  });

  describe('modified state', () => {
    it('is defined', () => {
      const el = document.createElement('vscode-form-container');
      expect(el).to.instanceOf(VscodeFormContainer);
    });

    it('is not modified by default', async () => {
      const id = nextFormId('default');
      const el = await createForm(id);

      expect(el.dirty).to.be.false;
      expect(el.hasAttribute('dirty')).to.be.false;
      expect(getState(id)!.dirty).to.be.false;
    });

    it('uses 5 seconds as the default duration', async () => {
      const id = nextFormId('default-duration');
      const el = await createForm(id);

      expect(VscodeFormContainer.defaultMarkDuration).to.eq(5000);
      expect(el.markDuration).to.eq(5000);
      expect(
        el.style.getPropertyValue('--vsc-form-control-dirty-duration')
      ).to.eq('5000ms');
    });

    it('is marked when a form control is modified', async () => {
      const id = nextFormId('mark');
      const el = await createForm(id);

      typeIntoTextfield(el, 'a');
      await el.updateComplete;

      expect(el.dirty).to.be.true;
      expect(getState(id)!.dirty).to.be.true;
    });

    it('is marked when a checkbox is toggled', async () => {
      const id = nextFormId('checkbox');
      const el = await createForm(id);
      const checkbox = el.querySelector('vscode-checkbox')!;

      checkbox.shadowRoot!.querySelector('input')!.click();
      await el.updateComplete;

      expect(el.dirty).to.be.true;
    });

    it('is not marked by a programmatic value change', async () => {
      const id = nextFormId('programmatic');
      const el = await createForm(id);
      const textfield = el.querySelector('vscode-textfield')!;

      textfield.setAttribute('value', 'programmatic');
      await el.updateComplete;

      expect(el.dirty).to.be.false;
    });

    it('marks every form control of the modified form', async () => {
      const id = nextFormId('controls');
      const el = await createForm(id);

      typeIntoTextfield(el, 'a');
      await el.updateComplete;

      expect(el.querySelector('vscode-textfield')!.dirty).to.be.true;
      expect(el.querySelector('vscode-checkbox')!.dirty).to.be.true;
    });

    it('marks the control which was modified by the user', async () => {
      const id = nextFormId('keystroke');
      const el = await createForm(id, 'mark-duration="600"');
      const textfield = el.querySelector('vscode-textfield')!;

      textfield.focus();
      await sendKeys({type: 'hello'});
      await textfield.updateComplete;
      await el.updateComplete;

      expect(textfield.value).to.eq('hello');
      expect(el.dirty).to.be.true;
      expect(textfield.dirty).to.be.true;
      expect(textfield.hasAttribute('dirty')).to.be.true;

      await waitFor(() => !el.dirty);

      expect(el.dirty).to.be.false;
      expect(textfield.dirty).to.be.false;
      expect(textfield.hasAttribute('dirty')).to.be.false;
    });
  });

  describe('modified state of the form controls', () => {
    it('shows the light theme background on the textfield', async () => {
      const id = nextFormId('control-background');
      const el = await createForm(id);
      const textfield = el.querySelector('vscode-textfield')!;
      const surface = () =>
        getComputedStyle(textfield.shadowRoot!.querySelector('.root')!);

      expect(surface().backgroundColor).to.eq('rgb(49, 49, 49)');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await nextFrame();

      const style = surface();
      // The animation paints the color of the state, the resolved keyframes
      // show the colors of the theme.
      const keyframes = getFadeKeyframes(
        textfield.shadowRoot!.querySelector('.root')!
      );

      expect(style.animationName).to.eq('vsc-form-control-dirty-fade');
      expect(style.animationDuration).to.eq('5s');
      expect(
        keyframes[0].backgroundColor,
        'the peak color of the light theme'
      ).to.eq('rgb(219, 228, 255)');
      expect(
        keyframes[1].backgroundColor,
        'the resting color of the light theme'
      ).to.eq('rgb(239, 243, 255)');
    });

    it('animates the state change of the control, not only the color', async () => {
      const id = nextFormId('control-transition');
      const el = await createForm(id);
      const textfield = el.querySelector('vscode-textfield')!;
      const surface = textfield.shadowRoot!.querySelector('.root')!;

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await nextFrame();

      const style = getComputedStyle(surface);

      expect(style.transitionProperty).to.contain('background-color');
      expect(style.transitionDuration).to.not.eq('0s');
      expect(style.animationDuration).to.eq('5s');
    });

    it('marks the box of the checkbox and the radio button', async () => {
      const id = nextFormId('control-box');
      const el = await createForm(id);
      const checkbox = el.querySelector('vscode-checkbox')!;

      checkbox.shadowRoot!.querySelector('input')!.click();
      await el.updateComplete;
      await nextFrame();

      const box = getComputedStyle(
        checkbox.shadowRoot!.querySelector('.icon')!
      );

      expect(box.animationName).to.contain('vsc-form-control-dirty-fade');
      expect(box.animationName).to.contain('vsc-form-control-dirty-ring');
      expect(box.boxShadow).to.not.eq('none');
    });

    it('does not change the background of the container', async () => {
      const id = nextFormId('container-background');
      const el = await createForm(id);

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await nextFrame();

      expect(getComputedStyle(el).backgroundColor).to.eq('rgba(0, 0, 0, 0)');
    });

    it('restores the controls when the duration has passed', async () => {
      const id = nextFormId('control-expire');
      const el = await createForm(id, 'mark-duration="100"');
      const textfield = el.querySelector('vscode-textfield')!;

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      expect(textfield.dirty).to.be.true;

      await waitFor(() => !textfield.dirty);
      await nextFrame();

      const surface = getComputedStyle(
        textfield.shadowRoot!.querySelector('.root')!
      );

      expect(surface.backgroundColor).to.eq('rgb(49, 49, 49)');
      expect(surface.animationName).to.eq('none');
    });

    it('restores the normal state when the duration has passed', async () => {
      const id = nextFormId('expire');
      const el = await createForm(id, 'mark-duration="100"');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      expect(el.dirty).to.be.true;

      await waitFor(() => !el.dirty);

      expect(el.querySelector('vscode-textfield')!.dirty).to.be.false;
      expect(getState(id)!.dirty).to.be.false;
    });

    it('uses the duration from the mark-duration attribute', async () => {
      const id = nextFormId('attribute');
      const el = await createForm(id, 'mark-duration="150ms"');

      expect(el.markDuration).to.eq('150ms');
      expect(
        el.style.getPropertyValue('--vsc-form-control-dirty-duration')
      ).to.eq('150ms');
      expect(el.getAttribute('mark-duration')).to.eq('150ms');
    });

    it('uses the duration from the property', async function () {
      // The duration is long on purpose, the default test timeout is not
      // enough for it.
      this.timeout(6000);

      const id = nextFormId('property');
      const el = await createForm(id);
      const textfield = el.querySelector('vscode-textfield')!;

      el.markDuration = '2.5s';
      await el.updateComplete;

      expect(
        el.style.getPropertyValue('--vsc-form-control-dirty-duration')
      ).to.eq('2500ms');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await nextFrame();

      expect(
        getComputedStyle(textfield.shadowRoot!.querySelector('.root')!)
          .animationDuration
      ).to.eq('2.5s');

      // The countdown is not over after 1.5 seconds, but it is after the
      // remaining second.
      await delay(1500);
      expect(el.dirty).to.be.true;
      await waitFor(() => !el.dirty);
      expect(el.dirty).to.be.false;
    });

    it('keeps the modified state with the forever duration', async () => {
      const id = nextFormId('forever');
      const el = await createForm(id, 'mark-duration="forever"');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await delay(300);

      expect(el.dirty).to.be.true;
      expect(
        el.style.getPropertyValue('--vsc-form-control-dirty-duration')
      ).to.eq('86400000ms');
    });

    it('keeps the modified state when the duration cannot be interpreted', async () => {
      const id = nextFormId('invalid-duration');
      const el = await createForm(id, 'mark-duration="slow"');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      await delay(300);

      expect(el.dirty).to.be.true;
    });

    it('removes the highlight immediately with a negative duration', async () => {
      const id = nextFormId('negative-duration');
      const el = await createForm(id, 'mark-duration="-1000"');

      expect(el.markDuration).to.eq('-1000');
      expect(
        el.style.getPropertyValue('--vsc-form-control-dirty-duration'),
        'the negative duration is not used as an animation length'
      ).to.eq('0ms');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;

      await waitFor(() => !el.dirty);
      expect(el.dirty).to.be.false;
      expect(el.querySelector('vscode-textfield')!.dirty).to.be.false;
    });
  });

  describe('mark and reset', () => {
    it('can be marked and reset manually', async () => {
      const id = nextFormId('manual');
      const el = await createForm(id);

      el.mark();
      await el.updateComplete;
      expect(el.dirty).to.be.true;

      el.reset();
      await el.updateComplete;
      expect(el.dirty).to.be.false;
      expect(el.querySelector('vscode-checkbox')!.dirty).to.be.false;
    });

    it('dispatches the vsc-dirty-change event', async () => {
      const id = nextFormId('event');
      const el = await createForm(id);
      const spy = sinon.spy();

      el.addEventListener('vsc-dirty-change', spy);
      el.mark();
      await el.updateComplete;
      await el.updateComplete;

      expect(spy).to.have.been.calledOnce;
      expect(spy.firstCall.args[0].detail.dirty).to.be.true;
      expect(spy.firstCall.args[0].detail.form).to.eq(el);

      el.reset();
      await el.updateComplete;
      await el.updateComplete;

      expect(spy).to.have.been.calledTwice;
      expect(spy.secondCall.args[0].detail.dirty).to.be.false;
    });

    it('restarts the countdown on a new modification', async () => {
      const id = nextFormId('restart');
      const el = await createForm(id, 'mark-duration="250"');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      // The guard ignores the modifications that follow each other quickly.
      await delay(600);

      typeIntoTextfield(el, 'ab');
      await el.updateComplete;
      await delay(150);

      expect(el.dirty).to.be.true;

      await waitFor(() => !el.dirty);
    });

    it('does not restart the countdown on the repeated events of a keystroke', async () => {
      const id = nextFormId('repeated-events');
      const el = await createForm(id, 'mark-duration="300"');

      typeIntoTextfield(el, 'a');
      await el.updateComplete;
      // The input and the change event of the same keystroke, then the next
      // keystroke of a user who types fast.
      await delay(50);
      typeIntoTextfield(el, 'ab');
      await el.updateComplete;
      await delay(50);
      typeIntoTextfield(el, 'abc');
      await el.updateComplete;

      await waitFor(() => !el.dirty);
    });

    it('does not mark a form when markable is false', async () => {
      const id = nextFormId('not-markable');
      const el = await createForm(id, 'markable="false"');

      expect(el.markable).to.be.false;

      typeIntoTextfield(el, 'a');
      await el.updateComplete;

      expect(el.dirty).to.be.false;

      el.mark();
      await el.updateComplete;
      expect(el.dirty).to.be.true;
    });

    it('is markable by default', async () => {
      const id = nextFormId('markable');
      const el = await createForm(id);

      expect(el.markable).to.be.true;
      expect(
        el.hasAttribute('markable'),
        'the default is not written to the DOM'
      ).to.be.false;
      expect(el.matches('[markable]'), 'the attribute is not reflected').to.be
        .false;
    });

    it('does not write the default duration to the DOM', async () => {
      const id = nextFormId('default-duration-attribute');
      const el = await createForm(id);

      expect(el.markDuration).to.eq(5000);
      expect(el.hasAttribute('mark-duration')).to.be.false;
    });

    it('restarts the countdown when it is marked again', async () => {
      const id = nextFormId('mark-again');
      const el = await createForm(id, 'mark-duration="400"');

      el.mark();
      await el.updateComplete;
      await delay(250);

      // The second call is inside the delay which ignores the events of the
      // automatic marking, but a direct call is never ignored.
      el.mark();
      await el.updateComplete;
      await delay(250);

      expect(el.dirty).to.be.true;

      await waitFor(() => !el.dirty);
    });

    it('marks the form when an option of a select is clicked', async () => {
      const id = nextFormId('select-click');
      const el = await createForm(id, 'mark-duration="600"');

      const select = document.createElement('vscode-single-select');
      select.innerHTML = `
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
      `;
      el.querySelector('vscode-form-group')!.appendChild(select);
      await select.updateComplete;
      await el.updateComplete;

      const events: string[] = [];
      el.addEventListener('change', () => events.push('change'));

      await clickOnElement(
        select.shadowRoot!.querySelector('.select-face') as HTMLElement
      );
      await select.updateComplete;

      await clickOnElement(
        select.shadowRoot!.querySelector(
          '.options li:nth-of-type(2)'
        ) as HTMLElement
      );
      await select.updateComplete;
      await el.updateComplete;

      expect(select.value).to.eq('Ipsum');
      expect(events, 'the change event reaches the form container').to.deep.eq([
        'change',
      ]);
      expect(el.dirty).to.be.true;
      expect(el.querySelector('vscode-single-select')!.dirty).to.be.true;
    });

    it('marks the form when an option of a multi-select is clicked', async () => {
      const id = nextFormId('multi-select-click');
      const el = await createForm(id, 'mark-duration="600"');

      const select = document.createElement('vscode-multi-select');
      select.innerHTML = `
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
      `;
      el.querySelector('vscode-form-group')!.appendChild(select);
      await select.updateComplete;
      await el.updateComplete;

      await clickOnElement(
        select.shadowRoot!.querySelector('.select-face') as HTMLElement
      );
      await select.updateComplete;

      await clickOnElement(
        select.shadowRoot!.querySelector(
          '.options li:nth-of-type(1)'
        ) as HTMLElement
      );
      await select.updateComplete;
      await el.updateComplete;

      expect(el.dirty).to.be.true;
      expect(el.querySelector('vscode-multi-select')!.dirty).to.be.true;
    });

    it('does not mark the form when a native control is modified', async () => {
      const id = nextFormId('native-control');
      const el = await createForm(id, 'mark-duration="600"');

      const native = document.createElement('input');
      el.querySelector('vscode-form-group')!.appendChild(native);
      await el.updateComplete;

      native.focus();
      await sendKeys({type: 'a'});
      await el.updateComplete;
      await delay(50);

      expect(native.value, 'the native control was modified').to.eq('a');
      expect(el.dirty, 'only the form controls of the container mark it').to.be
        .false;
    });
  });

  describe('form states of the page', () => {
    it('lists the id, the name and the state of every form', async () => {
      const firstId = nextFormId('list-first');
      const secondId = nextFormId('list-second');

      await createForm(firstId);
      const second = await createForm(secondId, 'name="second-form"');

      const states = getStates(firstId, secondId);

      expect(states).to.have.lengthOf(2);
      expect(states[0].element).to.instanceOf(VscodeFormContainer);
      expect(states[0].name).to.eq('');
      expect(states[1].name).to.eq('second-form');
      expect(states[0].markDuration).to.eq(5000);

      second.mark();
      await second.updateComplete;

      const updatedStates = getStates(firstId, secondId);
      expect(updatedStates[0].dirty).to.be.false;
      expect(updatedStates[1].dirty).to.be.true;
    });

    it('restores the previously modified form immediately', async () => {
      const firstId = nextFormId('exclusive-first');
      const secondId = nextFormId('exclusive-second');

      const first = await createForm(firstId, 'mark-duration="10000"');
      const second = await createForm(secondId, 'mark-duration="10000"');

      typeIntoTextfield(first, 'a');
      await first.updateComplete;
      expect(first.dirty).to.be.true;

      typeIntoTextfield(second, 'b');
      await second.updateComplete;

      expect(second.dirty).to.be.true;
      expect(first.dirty).to.be.false;
      expect(first.querySelector('vscode-textfield')!.dirty).to.be.false;
      expect(first.querySelector('vscode-checkbox')!.dirty).to.be.false;
    });

    it('keeps only one form highlighted when a third one is modified', async () => {
      const ids = ['third-a', 'third-b', 'third-c'].map(nextFormId);

      const forms = await Promise.all(
        ids.map((id) => createForm(id, 'mark-duration="10000"'))
      );

      typeIntoTextfield(forms[0], 'a');
      await forms[0].updateComplete;

      typeIntoTextfield(forms[1], 'b');
      await forms[1].updateComplete;

      typeIntoTextfield(forms[2], 'c');
      await forms[2].updateComplete;

      expect(getStates(...ids).map((state) => state.dirty)).to.deep.eq([
        false,
        false,
        true,
      ]);
    });

    it('marks the inner form only when the form containers are nested', async () => {
      const innerId = nextFormId('nested-inner');

      const outer = await fixture<VscodeFormContainer>(html`
        <vscode-form-container mark-duration="10000">
          <vscode-form-group variant="vertical">
            <vscode-form-container id=${innerId} mark-duration="10000">
              <vscode-form-group variant="vertical">
                <vscode-textfield></vscode-textfield>
              </vscode-form-group>
            </vscode-form-container>
          </vscode-form-group>
        </vscode-form-container>
      `);

      const inner = outer.querySelector<VscodeFormContainer>(`#${innerId}`)!;
      const textfield = inner.querySelector('vscode-textfield')!;

      await outer.updateComplete;
      await inner.updateComplete;

      textfield.focus();
      await sendKeys({type: 'a'});
      await textfield.updateComplete;
      await inner.updateComplete;
      await outer.updateComplete;

      expect(textfield.value, 'the control was modified').to.eq('a');
      expect(inner.dirty, 'the form of the modified control is marked').to.be
        .true;
      expect(textfield.dirty, 'the modified control is marked').to.be.true;
      expect(
        outer.dirty,
        'the form which contains the other form is not marked'
      ).to.be.false;
    });

    it('does not restore a form of another root', async () => {
      const innerId = nextFormId('shadow-inner');
      const outerId = nextFormId('shadow-outer');

      const host = await fixture<HTMLElement>(html`<div></div>`);
      const shadowRoot = host.attachShadow({mode: 'open'});

      shadowRoot.innerHTML = `
        <vscode-form-container id="${innerId}" mark-duration="10000">
          <vscode-form-group variant="vertical">
            <vscode-textfield></vscode-textfield>
          </vscode-form-group>
        </vscode-form-container>
      `;

      const inner = shadowRoot.querySelector<VscodeFormContainer>(
        `#${innerId}`
      )!;
      const outer = await createForm(outerId, 'mark-duration="10000"');

      await inner.updateComplete;

      inner.mark();
      await inner.updateComplete;

      typeIntoTextfield(outer, 'a');
      await outer.updateComplete;

      expect(outer.dirty).to.be.true;
      expect(inner.dirty).to.be.true;
    });

    it('finds the forms of a shadow root', async () => {
      const hostId = nextFormId('root-host');
      const innerId = nextFormId('root-inner');

      const host = await fixture<HTMLElement>(html`<div id=${hostId}></div>`);
      const shadowRoot = host.attachShadow({mode: 'open'});

      shadowRoot.innerHTML = `
        <vscode-form-container id="${innerId}">
          <vscode-form-group variant="vertical">
            <vscode-textfield></vscode-textfield>
          </vscode-form-group>
        </vscode-form-container>
      `;

      const states = VscodeFormContainer.getFormStates(shadowRoot);

      expect(states.map((state) => state.id)).to.deep.eq([innerId]);
    });
  });
});
