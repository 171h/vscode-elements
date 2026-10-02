import {VscodeTabHeader} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-tab-header', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-tab-header');
    expect(el).to.instanceOf(VscodeTabHeader);
  });
});
