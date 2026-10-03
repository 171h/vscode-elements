import {VscodeTabPanel} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-tab-panel', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-tab-panel');
    expect(el).to.instanceOf(VscodeTabPanel);
  });
});
