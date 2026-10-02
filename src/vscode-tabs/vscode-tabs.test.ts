import '../vscode-tabs/vscode-tabs.js';
import '../vscode-tab-header/vscode-tab-header.js';
import '../vscode-tab-panel/vscode-tab-panel.js';
import {VscodeTabs} from './index.js';
import {expect, fixture, html, elementUpdated} from '@open-wc/testing';

describe('vscode-tabs', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-tabs');
    expect(el).to.instanceOf(VscodeTabs);
  });

  it('is accessible', async () => {
    const el = await fixture(html`
      <div style="background-color: #1f1f1f">
        <vscode-tabs>
          <vscode-tab-header>Tab header 1</vscode-tab-header>
          <vscode-tab-panel
            ><p style="color: #cccccc;">Tab panel 1</p></vscode-tab-panel
          >
          <vscode-tab-header>Tab header 2</vscode-tab-header>
          <vscode-tab-panel
            ><p style="color: #cccccc;">Tab panel 2</p></vscode-tab-panel
          >
        </vscode-tabs>
      </div>
    `);

    await expect(el).to.be.accessible({});
  });
});

describe('标题换行', () => {
  it('按内容增加高度并支持居中对齐', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 200px" overflow="wrap">
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 120px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    await elementUpdated(el);
    const headers = el.querySelectorAll('vscode-tab-header');
    const bar = el.shadowRoot!.querySelector('.header')!;
    expect(bar.getBoundingClientRect().height).to.be.greaterThan(
      headers[0].getBoundingClientRect().height * 2
    );
    el.wrapAlignment = 'center';
    await elementUpdated(el);
    expect(
      Math.round(
        headers[0].getBoundingClientRect().left -
          el.getBoundingClientRect().left
      )
    ).to.equal(40);
    headers[2].click();
    await elementUpdated(el);
    expect(el.selectedIndex).to.equal(2);
    expect(el.querySelectorAll('vscode-tab-panel')[2].hidden).to.equal(false);
  });
});
