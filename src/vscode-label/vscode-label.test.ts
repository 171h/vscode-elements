import {VscodeLabel} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('vscode-label', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-label');
    expect(el).to.instanceOf(VscodeLabel);
  });

  it('uses medium size by default', async () => {
    const el = await fixture<VscodeLabel>(html`<vscode-label></vscode-label>`);

    expect(el.size).to.eq('medium');
    expect(el.getAttribute('size')).to.eq('medium');
  });

  it('reflects the size property', async () => {
    const el = await fixture<VscodeLabel>(html`<vscode-label></vscode-label>`);
    el.size = 'small';
    await el.updateComplete;

    expect(el.getAttribute('size')).to.eq('small');
  });

  it('uses a 16px height at the small size', async () => {
    const el = await fixture<VscodeLabel>(
      html`<vscode-label size="small">Label</vscode-label>`
    );

    expect(el.getBoundingClientRect().height).to.eq(16);
  });
});
