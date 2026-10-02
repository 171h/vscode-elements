import {VscodeFormHelper} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-form-helper', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-form-helper');
    expect(el).to.instanceOf(VscodeFormHelper);
  });
});
