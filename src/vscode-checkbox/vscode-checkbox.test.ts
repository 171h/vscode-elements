/* eslint-disable @typescript-eslint/no-unused-expressions */
import {VscodeCheckbox} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';
import {sendKeys} from '@web/test-runner-commands';
import sinon from 'sinon';

describe('vscode-checkbox', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-checkbox');
    expect(el).to.instanceOf(VscodeCheckbox);
  });

  it('is accessible', async () => {
    document.body.style.backgroundColor = '#1f1f1f';
    const el = await fixture(
      html`<vscode-checkbox>Test checkbox</vscode-checkbox>`
    );

    await expect(el).to.be.accessible();
  });

  it('should type attribute return "checkbox"', () => {
    const el = document.createElement('vscode-checkbox');
    expect(el.type).to.eq('checkbox');
  });

  it('uses medium size by default', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox>Test checkbox</vscode-checkbox>`
    );

    expect(el.size).to.eq('medium');
    expect(el.getAttribute('size')).to.eq('medium');
  });

  it('reflects the size property', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox>Test checkbox</vscode-checkbox>`
    );
    el.size = 'small';
    await el.updateComplete;

    expect(el.getAttribute('size')).to.eq('small');
  });

  it('adjusts the corner radius with the component size', async () => {
    for (const [size, expectedRadius] of [
      ['small', '1px'],
      ['medium', '3px'],
      ['large', '3px'],
    ] as const) {
      const el = await fixture<VscodeCheckbox>(html`
        <vscode-checkbox .size=${size}>Checkbox</vscode-checkbox>
      `);
      const icon = el.shadowRoot!.querySelector<HTMLElement>('.icon')!;

      expect(getComputedStyle(icon).borderRadius).to.eq(expectedRadius);
    }
  });

  it('uses a 16px height at the small size', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox size="small">Checkbox</vscode-checkbox>`
    );

    expect(el.getBoundingClientRect().height).to.eq(16);
  });

  it('resizes checkbox indicators with the component', async () => {
    for (const [
      size,
      expectedControlHeight,
      expectedWrapperHeight,
      expectedIconSize,
      expectedFontSize,
    ] of [
      ['small', 16, 16, 14, '11px'],
      ['medium', 26, 18, 18, '13px'],
      ['large', 30, 20, 20, '15px'],
    ] as const) {
      const el = await fixture<VscodeCheckbox>(html`
        <vscode-checkbox .size=${size} checked>Checkbox</vscode-checkbox>
      `);
      const icon = el.shadowRoot!.querySelector<HTMLElement>('.icon')!;
      const checkIcon =
        el.shadowRoot!.querySelector<SVGElement>('.check-icon')!;
      const wrapper = el.shadowRoot!.querySelector<HTMLElement>('.wrapper')!;

      expect(el.getBoundingClientRect().height).to.eq(expectedControlHeight);
      expect(wrapper.getBoundingClientRect().height).to.eq(
        expectedWrapperHeight
      );
      expect(icon.getBoundingClientRect().height).to.eq(expectedIconSize);
      expect(checkIcon.getBoundingClientRect().height).to.eq(
        expectedIconSize - 2
      );
      expect(getComputedStyle(wrapper).fontSize).to.eq(expectedFontSize);
    }
  });

  it('resizes toggle indicators with the component', async () => {
    for (const [size, expectedControlHeight, expectedWidth, expectedHeight] of [
      ['small', 16, 28, 14],
      ['medium', 26, 36, 18],
      ['large', 30, 40, 20],
    ] as const) {
      const el = await fixture<VscodeCheckbox>(html`
        <vscode-checkbox .size=${size} toggle checked>Toggle</vscode-checkbox>
      `);
      const icon = el.shadowRoot!.querySelector<HTMLElement>('.icon')!;

      expect(el.getBoundingClientRect().height).to.eq(expectedControlHeight);
      expect(icon.getBoundingClientRect().width).to.eq(expectedWidth);
      expect(icon.getBoundingClientRect().height).to.eq(expectedHeight);
    }
  });

  it('should be participated in the form', async () => {
    const form = document.createElement('form');
    await fixture(
      html`<vscode-checkbox
        name="test"
        value="Test value"
        checked
      ></vscode-checkbox>`,
      {parentNode: form}
    );

    const data = new FormData(form);
    const value = data.get('test');

    expect(value).to.eq('Test value');
  });

  it('should not be participated in the form when unchecked', async () => {
    const form = document.createElement('form');
    await fixture(
      html`<vscode-checkbox name="test" value="Test value"></vscode-checkbox>`,
      {parentNode: form}
    );

    const data = new FormData(form);
    const value = data.get('test');

    expect(value).to.be.null;
  });

  it('should set "on" as form value when value is not set', async () => {
    const form = document.createElement('form');
    await fixture(
      html`<vscode-checkbox name="test" checked></vscode-checkbox>`,
      {
        parentNode: form,
      }
    );

    const data = new FormData(form);
    const value = data.get('test');

    expect(value).to.eq('on');
  });

  it('should return the form in which participated', () => {
    const form = document.createElement('form');
    const el = document.createElement('vscode-checkbox') as VscodeCheckbox;
    form.appendChild(el);

    expect(el.form).to.instanceOf(HTMLFormElement);
  });

  it('should return the validity object', () => {
    const el = document.createElement('vscode-checkbox') as VscodeCheckbox;

    expect(el.validity).to.instanceOf(ValidityState);
  });

  it('should return the validation message', async () => {
    const form = document.createElement('form');
    const el = document.createElement('vscode-checkbox');
    el.setAttribute('required', '');
    form.appendChild(el);
    document.body.appendChild(form);

    await el.updateComplete;

    expect(el.validationMessage).to.not.empty;
    expect(el.validationMessage).to.eq(
      'Please check this box if you want to proceed.'
    );
  });

  it('should willValidate property be true if the element is candidate for constraint validation', async () => {
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox></vscode-checkbox>'
    );

    expect(el.willValidate).to.be.true;
  });

  it('should willValidate property be false if the element is not candidate for constraint validation', async () => {
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox disabled></vscode-checkbox>'
    );

    expect(el.willValidate).to.be.false;
  });

  it('should check validity when checkValidity is called', async () => {
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox required></vscode-checkbox>'
    );
    const fn = sinon.spy();
    el.addEventListener('invalid', fn);

    const result = el.checkValidity();

    expect(result).to.be.false;
    expect(fn.called).to.be.true;
  });

  it('reportValidity should be called', async () => {
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox required></vscode-checkbox>'
    );
    const fn = sinon.spy();
    el.addEventListener('invalid', fn);

    const result = el.reportValidity();

    expect(result).to.be.false;
    expect(fn.called).to.be.true;
  });

  it('the autofocus attribute should be passed', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox name="test" autofocus></vscode-checkbox>`
    );

    const input = el.shadowRoot?.querySelector('input');

    expect(input?.hasAttribute('autofocus')).to.be.true;
  });

  it('defaultChecked should be applied when the reset function of the parent form is called', async () => {
    const form = document.createElement('form');
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox name="test" default-checked></vscode-checkbox>`,
      {
        parentNode: form,
      }
    );
    const initialChecked = el.checked;

    form.reset();
    await el.updateComplete;

    expect(initialChecked).to.be.false;
    expect(el.checked).to.be.true;
  });

  it('restore callback should restore the previous state', async () => {
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox value="test"></vscode-checkbox>'
    );
    const initialChecked = el.checked;

    el.formStateRestoreCallback('test', 'restore');
    await el.updateComplete;

    expect(initialChecked).to.be.false;
    expect(el.checked).to.be.true;
  });

  it('checked state should be applied', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox checked></vscode-checkbox>`
    );

    const input = el.shadowRoot?.querySelector('input');

    expect(input?.checked).to.be.true;
    expect(el.shadowRoot?.querySelector('.check-icon')).to.be.ok;
  });

  it('indeterminate state should be applied', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox indeterminate></vscode-checkbox>`
    );

    const icon = el.shadowRoot?.querySelector('.indeterminate-icon');

    expect(icon).to.be.ok;
  });

  it('should show only the indeterminate icon when indeterminate and checked at the same time', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox indeterminate checked></vscode-checkbox>`
    );

    const iconIndeterminate = el.shadowRoot?.querySelector(
      '.indeterminate-icon'
    );
    const iconCheck = el.shadowRoot?.querySelector('.check-icon');

    expect(iconIndeterminate).to.be.ok;
    expect(iconCheck).to.be.null;
  });

  it('should set label through slotted content', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox><b>Test</b> <i>Label</i></vscode-checkbox>`
    );

    expect(el.ariaLabel).to.eq('Test Label');
  });

  it('should toggle checked state when clicked', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox>Checkbox test</vscode-checkbox>`
    );

    const label = el.shadowRoot?.querySelector('label');
    label?.click();
    await el.updateComplete;

    expect(el.checked).to.be.true;
  });

  it('should not toggle checked state when clicked but it is disabled', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox disabled>Checkbox test</vscode-checkbox>`
    );

    const label = el.shadowRoot?.querySelector('label');
    label?.click();
    await el.updateComplete;

    expect(el.checked).to.be.false;
  });

  it('should toggle checked state when the space key is pressed', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox>Checkbox test</vscode-checkbox>`
    );

    el.focus();
    await sendKeys({
      down: ' ',
    });

    expect(el.checked).to.be.true;
  });

  it('should not toggle checked state when the space key is pressed but it is disabled', async () => {
    const el = await fixture<VscodeCheckbox>(
      html`<vscode-checkbox disabled>Checkbox test</vscode-checkbox>`
    );

    el.focus();
    await sendKeys({
      down: ' ',
    });

    expect(el.checked).to.be.false;
  });

  it('should submit the associated form when the "Enter" button is pressed', async () => {
    const form = document.createElement('form');
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox></vscode-checkbox>',
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
      down: 'Enter',
    });

    expect(spy.called).to.be.true;
  });

  it('should not submit the associated form when the "Enter" button is pressed but it is disabled', async () => {
    const form = document.createElement('form');
    const el = await fixture<VscodeCheckbox>(
      '<vscode-checkbox disabled></vscode-checkbox>',
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
      down: 'Enter',
    });

    expect(spy.called).to.be.false;
  });

  it('should update validity state when checked state is changed', () => {
    const el = document.createElement('vscode-checkbox');
    el.required = true;
    el.checked = false;
    document.body.appendChild(el);

    expect(el.checkValidity()).to.eq(false);

    el.checked = true;

    expect(el.checkValidity()).to.eq(true);
  });

  it('should update validity state when required property is changed', () => {
    const el = document.createElement('vscode-checkbox');
    el.checked = false;
    document.body.appendChild(el);

    expect(el.checkValidity()).to.eq(true);

    el.required = true;

    expect(el.checkValidity()).to.eq(false);
  });

  it('should dispatch change event', async () => {
    const el = await fixture(html`<vscode-checkbox></vscode-checkbox>`);
    const lb = el.shadowRoot?.querySelector('label');
    const spy = sinon.spy();
    el.addEventListener('change', spy);

    lb?.click();

    expect(spy).to.have.been.calledOnce;
  });

  describe('toggle mode', () => {
    it('renders a toggle thumb instead of a check icon', async () => {
      const el = await fixture<VscodeCheckbox>(
        html`<vscode-checkbox toggle></vscode-checkbox>`
      );

      const thumb = el.shadowRoot?.querySelector('.thumb');
      const checkIcon = el.shadowRoot?.querySelector('.check-icon');

      expect(thumb).to.exist;
      expect(checkIcon).to.not.exist;
    });

    it('toggles checked state on click', async () => {
      const el = await fixture<VscodeCheckbox>(
        html`<vscode-checkbox toggle>Toggle me</vscode-checkbox>`
      );

      const label = el.shadowRoot?.querySelector('label');
      label?.click();
      await el.updateComplete;

      expect(el.checked).to.be.true;
    });

    it('sets role="switch" for accessibility', async () => {
      const el = await fixture<VscodeCheckbox>(
        html`<vscode-checkbox toggle></vscode-checkbox>`
      );

      const input = el.shadowRoot?.querySelector('input');
      expect(input?.getAttribute('role')).to.eq('switch');
      expect(input?.getAttribute('aria-checked')).to.be.oneOf([
        'true',
        'false',
      ]);
    });
  });
});
