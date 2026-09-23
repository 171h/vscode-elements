import {VscodeOption} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('vscode-option', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-option');
    expect(el).to.instanceOf(VscodeOption);
  });

  it('has no abbreviation by default', () => {
    const el = document.createElement('vscode-option');

    expect(el.abbreviation).to.eq('');
  });

  it('reads the abbreviation from the attribute', async () => {
    const el = await fixture<VscodeOption>(
      html`<vscode-option abbreviation="DB">Database</vscode-option>`
    );

    expect(el.abbreviation).to.eq('DB');
  });
});
