/* eslint-disable @typescript-eslint/no-unused-expressions */
import {$, dragElement} from '../includes/test-helpers.js';
import {VscodeTable} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';
import '../vscode-table-body/vscode-table-body.js';
import '../vscode-table-cell/vscode-table-cell.js';
import '../vscode-table-header/vscode-table-header.js';
import '../vscode-table-header-cell/vscode-table-header-cell.js';
import '../vscode-table-row/vscode-table-row.js';

describe('vscode-table', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-table');
    expect(el).to.instanceOf(VscodeTable);
  });

  it('uses medium size by default', () => {
    const el = document.createElement('vscode-table') as VscodeTable;

    expect(el.size).to.eq('medium');
  });

  it('resizes rows and headers with the component', async () => {
    for (const [size, expectedRowHeight, expectedHeaderHeight, fontSize] of [
      ['small', 18, 24, '11px'],
      ['medium', 24, 30, '13px'],
      ['large', 30, 36, '15px'],
    ] as const) {
      const el = await fixture<VscodeTable>(html`
        <vscode-table .size=${size}>
          <vscode-table-header>
            <vscode-table-header-cell>Header</vscode-table-header-cell>
          </vscode-table-header>
          <vscode-table-body>
            <vscode-table-row>
              <vscode-table-cell>Cell</vscode-table-cell>
            </vscode-table-row>
          </vscode-table-body>
        </vscode-table>
      `);
      const header = el.querySelector<HTMLElement>('vscode-table-header-cell')!;
      const cell = el.querySelector<HTMLElement>('vscode-table-cell')!;

      expect(el.getAttribute('size')).to.eq(size);
      expect(header.getBoundingClientRect().height).to.eq(expectedHeaderHeight);
      expect(cell.getBoundingClientRect().height).to.eq(expectedRowHeight);
      expect(getComputedStyle(cell).fontSize).to.eq(fontSize);
    }
  });

  it('should not throw when removed from the DOM', () => {
    const el = document.createElement('vscode-table');
    document.body.append(el);

    expect(() => el.remove()).not.to.throw();
  });

  it('should not throw on resize when no rows are present', async () => {
    const el = await fixture(html`
      <vscode-table resizable style="width: 500px">
        <vscode-table-header>
          <vscode-table-header-cell>Col 1</vscode-table-header-cell>
          <vscode-table-header-cell>Col 2</vscode-table-header-cell>
        </vscode-table-header>
        <vscode-table-body>
          <vscode-table-row>no data</vscode-table-row>
        </vscode-table-body>
      </vscode-table>
    `);

    async function testDrag() {
      await dragElement($(el.shadowRoot!, '.sash-clickable'), 20);
    }

    expect(await testDrag()).not.to.throw;
  });
});
