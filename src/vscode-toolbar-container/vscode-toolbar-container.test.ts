import {VscodeToolbarContainer} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-toolbar-container', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-toolbar-container');
    expect(el).to.instanceOf(VscodeToolbarContainer);
  });
});
