import {VscodeTableRow} from './index.js';
import {expect} from '../includes/testing.js';

describe('vscode-table-row', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-table-row');
    expect(el).to.instanceOf(VscodeTableRow);
  });
});
