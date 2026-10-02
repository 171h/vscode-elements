import {VscodeDivider} from './index.js';
import {expect, fixture, html} from '../includes/testing.js';

describe('vscode-divider', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-divider');
    expect(el).to.instanceOf(VscodeDivider);
  });

  it('is accessible', async () => {
    const el = await fixture<VscodeDivider>(
      html`<vscode-divider></vscode-divider>`
    );

    await expect(el).toBeAccessible();
  });
});
