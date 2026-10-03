import {VscodeTableCell} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-table-cell', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-table-cell');
    expect(el).to.instanceOf(VscodeTableCell);
  });
});
