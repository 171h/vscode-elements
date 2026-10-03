import {VscodeTableBody} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-table-body', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-table-body');
    expect(el).to.instanceOf(VscodeTableBody);
  });
});
