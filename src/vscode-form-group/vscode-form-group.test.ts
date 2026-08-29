import {VscodeFormGroup} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('vscode-form-group', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-form-group');
    expect(el).to.instanceOf(VscodeFormGroup);
  });

  it('uses medium size by default', async () => {
    const el = await fixture<VscodeFormGroup>(
      html`<vscode-form-group></vscode-form-group>`
    );

    expect(el.size).to.eq('medium');
    expect(el.getAttribute('size')).to.eq('medium');
  });

  it('sets the size attribute', async () => {
    const el = await fixture<VscodeFormGroup>(
      html`<vscode-form-group size="small"></vscode-form-group>`
    );

    expect(el.size).to.eq('small');
  });

  it('reflects the size property', async () => {
    const el = await fixture<VscodeFormGroup>(
      html`<vscode-form-group></vscode-form-group>`
    );

    el.size = 'large';
    await el.updateComplete;

    expect(el.getAttribute('size')).to.eq('large');
  });
});
