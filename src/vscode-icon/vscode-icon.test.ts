import {VscodeIcon} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('vscode-icon', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-icon');
    expect(el).to.instanceOf(VscodeIcon);
  });

  it('uses medium size (16px) by default', () => {
    const el = document.createElement('vscode-icon');
    expect(el.size).to.eq(16);
  });

  it('accepts a numeric size', () => {
    const el = document.createElement('vscode-icon');
    el.size = 24;
    expect(el.size).to.eq(24);
  });

  it('preserves numeric size attributes', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size="24"></vscode-icon>`
    );

    expect(el.size).to.eq(24);
  });

  it('maps the small preset to 14px', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size="small"></vscode-icon>`
    );

    expect(el.size).to.eq(14);
  });

  it('maps the large preset to 20px', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size="large"></vscode-icon>`
    );

    expect(el.size).to.eq(20);
  });

  it('applies the preset size to the icon element', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size="large"></vscode-icon>`
    );
    const icon = el.shadowRoot?.querySelector('.codicon') as HTMLElement;
    const computedStyle = getComputedStyle(icon);

    expect(computedStyle.height).to.eq('20px');
    expect(computedStyle.width).to.eq('20px');
    expect(computedStyle.fontSize).to.eq('20px');
  });

  it('allows a containing component to override the rendered size', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon
        name="account"
        style="--vsc-icon-size: 12px"
      ></vscode-icon>`
    );
    const icon = el.shadowRoot?.querySelector('.codicon') as HTMLElement;
    const computedStyle = getComputedStyle(icon);

    expect(computedStyle.height).to.eq('12px');
    expect(computedStyle.width).to.eq('12px');
    expect(computedStyle.fontSize).to.eq('12px');
  });

  it('rejects non-numeric size attributes', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size="24px"></vscode-icon>`
    );

    expect(el.size).to.eq(16);
  });

  it('rejects empty size attributes', async () => {
    const el = await fixture<VscodeIcon>(
      html`<vscode-icon name="account" size=""></vscode-icon>`
    );

    expect(el.size).to.eq(16);
  });

  it('rejects NaN size values', () => {
    const el = document.createElement('vscode-icon');
    el.size = NaN;

    expect(el.size).to.eq(16);
  });
});
