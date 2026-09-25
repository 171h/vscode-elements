/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect, fixture, html} from '@open-wc/testing';
import {literal, unsafeStatic} from 'lit/static-html.js';
import '../vscode-checkbox/index.js';
import '../vscode-multi-select/index.js';
import '../vscode-option/index.js';
import '../vscode-radio/index.js';
import '../vscode-single-select/index.js';
import '../vscode-textarea/index.js';
import '../vscode-textfield/index.js';
import '../vscode-form-container/index.js';
import {VscodeFormContainer} from '../vscode-form-container/index.js';

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The keyframes of the fading animation of a surface. The browser resolves
 * the custom properties, so the colors of the keyframes show what the control
 * actually paints.
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

interface ControlCase {
  tagName: string;
  markup: string;
  /** The element of the shadow root which draws the background. */
  surface: string;
  /** The background of the surface of the theme of the test runner. */
  background: string;
  /** Whether the control draws the background on a small box. */
  box?: boolean;
}

const CASES: ControlCase[] = [
  {
    tagName: 'vscode-textfield',
    markup: `<vscode-textfield></vscode-textfield>`,
    surface: '.root',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-textarea',
    markup: `<vscode-textarea></vscode-textarea>`,
    surface: 'textarea',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-single-select',
    markup: `<vscode-single-select></vscode-single-select>`,
    surface: '.select-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-multi-select',
    markup: `<vscode-multi-select>
        <vscode-option value="one" selected>One</vscode-option>
      </vscode-multi-select>`,
    surface: '.select-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-checkbox',
    markup: `<vscode-checkbox>Checkbox</vscode-checkbox>`,
    surface: '.icon',
    background: 'rgb(49, 49, 49)',
    box: true,
  },
  {
    tagName: 'vscode-radio',
    markup: `<vscode-radio>Radio</vscode-radio>`,
    surface: '.icon',
    background: 'rgb(49, 49, 49)',
    box: true,
  },
];

let formIndex = 0;

/**
 * Creates a form with a single control. The declaration is parsed as a static
 * string, because Lit does not create an attribute part for a binding that is
 * surrounded by whitespace.
 */
const createForm = async (controlMarkup: string, duration = '10000') => {
  const id = `control-case-${formIndex++}`;
  const declaration = `<vscode-form-container id="${id}" mark-duration="${duration}">`;

  const form = await fixture<VscodeFormContainer>(html`
    ${literal`${unsafeStatic(declaration)}`}
    <vscode-form-group variant="vertical">
      ${literal`${unsafeStatic(controlMarkup)}`}
    </vscode-form-group>
    </vscode-form-container>
  `);

  await form.updateComplete;

  return form;
};

type TestControl = HTMLElement & {
  dirty: boolean;
  updateComplete: Promise<unknown>;
};

describe('modified state of the form controls', () => {
  for (const testCase of CASES) {
    it(`shows the state on ${testCase.tagName}`, async () => {
      const form = await createForm(testCase.markup);
      const control = form.querySelector(testCase.tagName) as TestControl;
      const surface = () =>
        control.shadowRoot!.querySelector(testCase.surface)!;

      await control.updateComplete;

      expect(control.dirty, 'the control is not modified initially').to.be
        .false;
      expect(getComputedStyle(surface()).backgroundColor).to.eq(
        testCase.background
      );

      form.mark();
      await form.updateComplete;
      await control.updateComplete;
      await nextFrame();

      expect(control.dirty, 'the control is marked').to.be.true;
      expect(control.hasAttribute('dirty'), 'the attribute is reflected').to.be
        .true;

      const style = getComputedStyle(surface());
      const background = style.backgroundColor.match(/[\d.]+/g)!.map(Number);

      expect(style.animationName).to.contain('vsc-form-control-dirty-fade');
      expect(
        style.animationDuration.split(',').map((part) => part.trim())
      ).to.deep.eq(testCase.box ? ['10s', '10s'] : ['10s']);
      // A translucent green: the green channel is the strongest one.
      expect(background[1]).to.be.greaterThan(background[0]);
      expect(background[1]).to.be.greaterThan(background[2]);
      expect(background[3]).to.be.greaterThan(0);

      if (testCase.box) {
        expect(style.boxShadow, 'the box has a ring').to.not.eq('none');
        expect(style.animationName).to.contain('vsc-form-control-dirty-ring');
      }

      form.reset();
      await form.updateComplete;
      await control.updateComplete;
      await nextFrame();

      expect(control.dirty, 'the state is removed').to.be.false;
      expect(getComputedStyle(surface()).backgroundColor).to.eq(
        testCase.background
      );
    });
  }

  it('fades from the peak color to the resting color', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    form.mark();
    await form.updateComplete;
    await nextFrame();

    const keyframes = getFadeKeyframes(surface);

    expect(keyframes).to.have.lengthOf(2);
    expect(keyframes[0].backgroundColor).to.eq('rgba(46, 160, 67, 0.55)');
    expect(keyframes[1].backgroundColor).to.eq('rgba(46, 160, 67, 0.3)');
  });

  it('takes the colors from the custom properties of the container', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    form.style.setProperty(
      '--vsc-form-control-dirty-background',
      'rgb(1, 2, 3)'
    );
    form.style.setProperty(
      '--vsc-form-control-dirty-background-peak',
      'rgb(9, 9, 9)'
    );

    form.mark();
    await form.updateComplete;
    await nextFrame();

    const keyframes = getFadeKeyframes(surface);

    expect(
      keyframes[0].backgroundColor,
      'the peak color of the container is used'
    ).to.eq('rgb(9, 9, 9)');
    expect(
      keyframes[1].backgroundColor,
      'the resting color of the container is used'
    ).to.eq('rgb(1, 2, 3)');
  });

  it('marks every control of the form', async () => {
    const form = await createForm(`
      <vscode-textfield></vscode-textfield>
      <vscode-textarea></vscode-textarea>
      <vscode-single-select></vscode-single-select>
      <vscode-checkbox>Checkbox</vscode-checkbox>
      <vscode-radio>Radio</vscode-radio>
    `);

    form.mark();
    await form.updateComplete;

    for (const {tagName} of CASES) {
      const control = form.querySelector(tagName) as TestControl | null;

      if (control) {
        expect(control.dirty, `${tagName} is marked`).to.be.true;
      }
    }
  });

  it('does not mark a control which is not part of the form', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const host = document.createElement('div');

    host.innerHTML = `<vscode-textfield id="loose-field"></vscode-textfield>`;
    document.body.appendChild(host);

    const loose = host.querySelector('#loose-field') as TestControl;

    try {
      form.mark();
      await form.updateComplete;
      await delay(20);

      expect(form.querySelector('vscode-textfield')!.dirty).to.be.true;
      expect(loose.dirty, 'the loose control is untouched').to.be.false;
      expect(loose.hasAttribute('dirty')).to.be.false;
    } finally {
      host.remove();
    }
  });
});
