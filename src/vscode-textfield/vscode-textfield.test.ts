/* eslint-disable @typescript-eslint/no-unused-expressions */
import sinon from 'sinon';
import {aTimeout, expect, fixture, html} from '@open-wc/testing';
import {sendKeys, sendMouse} from '@web/test-runner-commands';
import '../vscode-icon/vscode-icon.js';
import '../vscode-label/vscode-label.js';
import {VscodeTextfield} from './index.js';

describe('vscode-textfield', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-textfield');
    expect(el).to.instanceOf(VscodeTextfield);
  });

  it('is accessible', async () => {
    const container = await fixture(
      html`<div>
        <vscode-label for="textfield">Test label</vscode-label>
        <vscode-textfield id="textfield"></vscode-textfield>
      </div>`
    );
    await aTimeout(10);
    const el = container.querySelector('#textfield');

    await expect(el).to.be.accessible();
  });

  it('renders with default values', async () => {
    const el = await fixture<VscodeTextfield>(
      html`<vscode-textfield></vscode-textfield>`
    );
    expect(el).shadowDom.to.equal(
      `
      <div class="root">
        <slot name="content-before"></slot>
        <input aria-label="" id="input" type="text">
        <slot name="content-after"></slot>
      </div>
      `
    );
  });

  it('when the type attribute is unknown, it should be set to text', async () => {
    const el = await fixture<VscodeTextfield>(
      html`<vscode-textfield></vscode-textfield>`
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    el.type = 'invalid';

    expect(el.type).to.eq('text');
  });

  it('uses medium size by default', async () => {
    const el = await fixture<VscodeTextfield>(
      html`<vscode-textfield></vscode-textfield>`
    );

    expect(el.size).to.eq('medium');
    expect(el.getAttribute('size')).to.eq('medium');
  });

  it('reflects the size property', async () => {
    const el = await fixture<VscodeTextfield>(
      html`<vscode-textfield></vscode-textfield>`
    );
    el.size = 'small';
    await el.updateComplete;

    expect(el.getAttribute('size')).to.eq('small');
  });

  it('adjusts the corner radius with the component size', async () => {
    for (const [size, expectedRadius] of [
      ['small', '1px'],
      ['medium', '4px'],
      ['large', '6px'],
    ] as const) {
      const el = await fixture<VscodeTextfield>(html`
        <vscode-textfield .size=${size}></vscode-textfield>
      `);
      const root = el.shadowRoot!.querySelector<HTMLElement>('.root')!;

      expect(getComputedStyle(root).borderRadius).to.eq(expectedRadius);
    }
  });

  it('uses a 16px height at the small size with slotted icons', async () => {
    const el = await fixture<VscodeTextfield>(html`
      <vscode-textfield size="small">
        <vscode-icon name="calendar" slot="content-before"></vscode-icon>
        <vscode-icon
          name="search"
          slot="content-after"
          action-icon
          label="Search"
        ></vscode-icon>
      </vscode-textfield>
    `);

    expect(el.getBoundingClientRect().height).to.eq(16);
  });

  it('does not allow the text to scroll vertically at the small size', async () => {
    const el = await fixture<VscodeTextfield>(html`
      <vscode-textfield size="small" value="Test value"></vscode-textfield>
    `);
    const input = el.wrappedElement;

    expect(input.scrollHeight).to.eq(input.clientHeight);

    input.scrollTop = 1;

    expect(input.scrollTop).to.eq(0);
  });

  it('resizes file inputs with the component', async () => {
    for (const [size, expectedHeight, expectedFontSize] of [
      ['small', 16, '11px'],
      ['medium', 26, '13px'],
      ['large', 30, '15px'],
    ] as const) {
      const el = await fixture<VscodeTextfield>(html`
        <vscode-textfield type="file" .size=${size}></vscode-textfield>
      `);
      const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;

      expect(el.getBoundingClientRect().height).to.eq(expectedHeight);
      expect(getComputedStyle(input).fontSize).to.eq(expectedFontSize);
      expect(getComputedStyle(input, '::file-selector-button').fontSize).to.eq(
        expectedFontSize
      );
    }
  });

  it('resizes color and date inputs with the component', async () => {
    for (const type of [
      'color',
      'date',
      'datetime-local',
      'month',
      'time',
      'week',
    ] as const) {
      for (const [size, expectedHeight, expectedFontSize] of [
        ['small', 16, '11px'],
        ['medium', 26, '13px'],
        ['large', 30, '15px'],
      ] as const) {
        const el = await fixture<VscodeTextfield>(html`
          <vscode-textfield .type=${type} .size=${size}></vscode-textfield>
        `);
        const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;

        expect(el.getBoundingClientRect().height).to.eq(expectedHeight);
        expect(getComputedStyle(input).fontSize).to.eq(expectedFontSize);
      }
    }
  });

  it('should be participated in the form', async () => {
    const form = document.createElement('form');
    await fixture(
      html`<vscode-textfield
        name="test"
        value="Test value"
      ></vscode-textfield>`,
      {parentNode: form}
    );

    const data = new FormData(form);
    const value = data.get('test');

    expect(value).to.eq('Test value');
  });

  it('should return the initial value', async () => {
    const el = await fixture<VscodeTextfield>(
      html`<vscode-textfield name="test" value="Test value"></vscode-textfield>`
    );

    expect(el.value).to.eq('Test value');
  });

  it('should return the form in which participated', () => {
    const form = document.createElement('form');
    const el = document.createElement('vscode-textfield');
    form.appendChild(el);

    expect(el.form).to.instanceOf(HTMLFormElement);
  });

  it('should return the validity object', () => {
    const el = document.createElement('vscode-textfield') as VscodeTextfield;

    expect(el.validity).to.instanceOf(ValidityState);
  });

  it('should return the validation message', async () => {
    const nativeInput = document.createElement('input');
    nativeInput.setAttribute('required', '');

    const form = document.createElement('form');
    const el = document.createElement('vscode-textfield');
    el.setAttribute('required', '');
    form.appendChild(el);
    document.body.appendChild(form);

    await el.updateComplete;

    expect(el.validationMessage).to.not.empty;
    expect(el.validationMessage).to.eq(nativeInput.validationMessage);
  });

  it('should willValidate property be true if the element is candidate for constraint validation', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );

    expect(el.willValidate).to.be.true;
  });

  it('should willValidate property be false if the element is not candidate for constraint validation', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield disabled></vscode-textfield>'
    );

    expect(el.willValidate).to.be.false;
  });

  it('should check validity when checkValidity is called', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield required></vscode-textfield>'
    );
    const fn = sinon.spy();
    el.addEventListener('invalid', fn);

    const result = el.checkValidity();

    expect(result).to.be.false;
    expect(fn.called).to.be.true;
  });

  it('reportValidity should be called', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield required></vscode-textfield>'
    );
    const fn = sinon.spy();
    el.addEventListener('invalid', fn);

    const result = el.reportValidity();

    expect(result).to.be.false;
    expect(fn.called).to.be.true;
  });

  it('wrappedElement property should point to inner native input', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );

    expect(el.wrappedElement).to.instanceOf(HTMLInputElement);
  });

  it('reset callback should restore the default value', async () => {
    const form = document.createElement('form');
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield value="Test value" default-value="Default value"></vscode-textfield>',
      {
        parentNode: form,
      }
    );
    const initialValue = el.value;

    form.reset();
    await el.updateComplete;

    expect(initialValue).to.eq('Test value');
    expect(el.value).to.eq('Default value');
  });

  it('restore callback should restore the previous state', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield value="Test value"></vscode-textfield>'
    );
    const initialValue = el.value;

    el.formStateRestoreCallback('Restored value', 'restore');
    await el.updateComplete;

    expect(initialValue).to.eq('Test value');
    expect(el.value).to.eq('Restored value');
  });

  it('should be revalidated when a validation related attribute is changed', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );
    const initialValidity = el.checkValidity();

    el.required = true;
    await el.updateComplete;

    expect(initialValidity).to.be.true;
    expect(el.checkValidity()).to.be.false;
  });

  it('should submit the associated form when the "Enter" button is pressed', async () => {
    const form = document.createElement('form');
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>',
      {
        parentNode: form,
      }
    );
    const spy = sinon.spy((ev: SubmitEvent) => {
      ev.preventDefault();
    });
    form.addEventListener('submit', spy);

    el.focus();
    await sendKeys({
      press: 'Enter',
    });

    expect(spy.called).to.be.true;
  });

  it('"input" event should be dispatched when a text typed', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );
    const spy = sinon.spy();
    el.addEventListener('input', spy);

    el.focus();
    await sendKeys({
      press: 'a',
    });

    expect(spy.called).to.be.true;
    expect(spy.calledWithMatch({data: 'a'})).to.be.true;
  });

  it('"change" event should be dispatched when a text typed and the focus is lost', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );
    const spy = sinon.spy();
    el.addEventListener('change', spy);

    el.focus();
    await sendKeys({
      press: 'a',
    });
    await sendMouse({type: 'click', position: [1000, 1000]});

    expect(spy.called).to.be.true;
  });

  it('minlength alias should point to minLength property', () => {
    const el = document.createElement('vscode-textfield');
    el.minlength = 100;

    expect(el.minLength).to.eq(100);
  });

  it('maxlength alias should point to maxLength property', () => {
    const el = document.createElement('vscode-textfield');
    el.maxlength = 100;

    expect(el.maxLength).to.eq(100);
  });

  it('should update validity state when value is changed programmatically', async () => {
    const el = document.createElement('vscode-textfield');
    el.pattern = '^(/.*)?$';
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.checkValidity()).to.eq(true);

    el.value = 'a';
    await el.updateComplete;

    expect(el.checkValidity()).to.eq(false);
  });

  it('should reflect invalid property to the invalid attribute', async () => {
    const el = await fixture<VscodeTextfield>(
      '<vscode-textfield></vscode-textfield>'
    );

    expect(el.hasAttribute('invalid')).to.be.false;

    el.invalid = true;
    await el.updateComplete;

    expect(el.hasAttribute('invalid')).to.be.true;

    el.invalid = false;
    await el.updateComplete;

    expect(el.hasAttribute('invalid')).to.be.false;
  });

  describe('percentage mode', () => {
    const typeText = async (el: VscodeTextfield, text: string) => {
      el.focus();
      await sendKeys({type: text});
      await el.updateComplete;
    };

    it('shows the percent sign of a programmatically set value', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage value="0.01"></vscode-textfield>`
      );

      expect(el.value).to.eq('0.01');
      expect(el.wrappedElement.value).to.eq('1%');
    });

    it('displays a typed number as a percentage and reports the fraction', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      await typeText(el, '1');

      expect(el.wrappedElement.value).to.eq('1%');
      expect(el.value).to.eq('0.01');
    });

    it('keeps typing after the masked number', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      el.focus();

      for (const digit of ['1', '2', '.', '5']) {
        await sendKeys({type: digit});
        await el.updateComplete;
      }

      expect(el.wrappedElement.value).to.eq('12.5%');
      expect(el.value).to.eq('0.125');
    });

    it('keeps the percent sign when digits are deleted', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      await typeText(el, '12');
      await sendKeys({press: 'Backspace'});
      await el.updateComplete;

      expect(el.wrappedElement.value).to.eq('1%');
      expect(el.value).to.eq('0.01');
    });

    it('keeps the order of the digits and the caret when typing is fast', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );
      // Emulates the keystrokes without waiting for the update in between, like
      // a user who types faster than the component re-renders.
      const pressKey = (char: string) => {
        const input = el.wrappedElement;
        const caret = input.selectionStart ?? input.value.length;

        input.setRangeText(char, caret, caret, 'end');
        input.dispatchEvent(new InputEvent('input', {data: char}));
      };

      el.focus();

      for (const char of ['1', 'a', '2', ',', '5']) {
        pressKey(char);
      }

      await el.updateComplete;

      expect(el.wrappedElement.value).to.eq('12.5%');
      expect(el.value).to.eq('0.125');
      expect(el.wrappedElement.selectionStart).to.eq(4);
    });

    it('ignores characters which are not part of a number', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      await typeText(el, '1a2');

      expect(el.wrappedElement.value).to.eq('12%');
      expect(el.value).to.eq('0.12');
    });

    it('does not show the percent sign in an empty field', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      expect(el.wrappedElement.value).to.eq('');
      expect(el.value).to.eq('');
    });

    it('normalizes the text when the editing is finished', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      await typeText(el, '05');
      await sendMouse({type: 'click', position: [1000, 1000]});
      await el.updateComplete;

      expect(el.wrappedElement.value).to.eq('5%');
      expect(el.value).to.eq('0.05');
    });

    it('uses the fraction form in the value property', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      el.value = '0.5';
      await el.updateComplete;

      expect(el.value).to.eq('0.5');
      expect(el.wrappedElement.value).to.eq('50%');
    });

    it('clears the value when it is not a number', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage value="1"></vscode-textfield>`
      );

      el.value = 'not a number';
      await el.updateComplete;

      expect(el.value).to.eq('');
      expect(el.wrappedElement.value).to.eq('');
    });

    it('reflects the percentage property to the attribute', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield></vscode-textfield>`
      );

      expect(el.percentage).to.be.false;

      el.percentage = true;
      await el.updateComplete;

      expect(el.hasAttribute('percentage')).to.be.true;
    });

    it('converts the value when the mode is changed at runtime', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield value="0.25"></vscode-textfield>`
      );

      expect(el.wrappedElement.value).to.eq('0.25');

      el.percentage = true;
      await el.updateComplete;

      expect(el.value).to.eq('0.25');
      expect(el.wrappedElement.value).to.eq('25%');

      el.percentage = false;
      await el.updateComplete;

      expect(el.value).to.eq('0.25');
      expect(el.wrappedElement.value).to.eq('0.25');
    });

    it('renders a text input regardless of the type property', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage type="number"></vscode-textfield>`
      );

      expect(el.type).to.eq('number');
      expect(el.wrappedElement.type).to.eq('text');
    });

    it('submits the fraction form with the form', async () => {
      const form = document.createElement('form');
      await fixture(
        html`<vscode-textfield
          percentage
          name="ratio"
          value="0.01"
        ></vscode-textfield>`,
        {parentNode: form}
      );

      const data = new FormData(form);

      expect(data.get('ratio')).to.eq('0.01');
    });

    it('validates the fraction value against the min and max constraints', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield
          percentage
          min="0"
          max="1"
          value="1.5"
        ></vscode-textfield>`
      );

      expect(el.wrappedElement.value).to.eq('150%');
      expect(el.checkValidity()).to.be.false;
      expect(el.validity.rangeOverflow).to.be.true;

      el.value = '0.5';
      await el.updateComplete;

      expect(el.checkValidity()).to.be.true;
    });

    it('restores the default value on reset', async () => {
      const form = document.createElement('form');
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield
          percentage
          value="0.5"
          default-value="0.2"
        ></vscode-textfield>`,
        {parentNode: form}
      );

      expect(el.wrappedElement.value).to.eq('50%');

      form.reset();
      await el.updateComplete;

      expect(el.value).to.eq('0.2');
      expect(el.wrappedElement.value).to.eq('20%');
    });

    it('restores the fraction form of a submitted state', async () => {
      const el = await fixture<VscodeTextfield>(
        html`<vscode-textfield percentage></vscode-textfield>`
      );

      el.formStateRestoreCallback('0.01', 'restore');
      await el.updateComplete;

      expect(el.value).to.eq('0.01');
      expect(el.wrappedElement.value).to.eq('1%');
    });
  });
});
