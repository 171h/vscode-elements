/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import {clickOnElement} from '../includes/test-helpers.js';
import type {VscodeContextMenuItem} from '../main.js';
import {VscodeContextMenu} from './index.js';
import {expect, fixture, html} from '@open-wc/testing';

describe('vscode-context-menu', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-context-menu');
    expect(el).to.instanceOf(VscodeContextMenu);
  });

  it('is accessible', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu show></vscode-context-menu>`
    );
    el.data = [
      {label: 'Menu Item 1', value: 'menuitem1'},
      {label: 'Menu Item 2', value: 'menuitem2'},
    ];
    await el.updateComplete;

    await expect(el).to.be.accessible();
  });

  it('should synchronize visibility state', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu show></vscode-context-menu>`
    );
    el.data = [
      {label: 'Menu Item 1', value: 'menuitem1'},
      {label: 'Menu Item 2', value: 'menuitem2'},
    ];
    await el.updateComplete;

    const items = el.shadowRoot?.querySelectorAll<VscodeContextMenuItem>(
      'vscode-context-menu-item'
    )!;
    await clickOnElement(items[0]);
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('vscode-context-menu-item')).to.be.null;
    expect(el.hasAttribute('show')).to.be.false;
  });
});

describe('菜单键盘索引', () => {
  const press = (el: VscodeContextMenu, key: string) =>
    el.dispatchEvent(
      new KeyboardEvent('keydown', {key, bubbles: true, composed: true})
    );

  it('首次向上选择末项并跳过分隔线，支持循环导航和 Enter', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu
        show
        .data=${[
          {label: '首项', value: 'first'},
          {separator: true},
          {label: '末项', value: 'last'},
        ]}
      ></vscode-context-menu>`
    );
    let selected = '';
    el.addEventListener(
      'vsc-context-menu-select',
      (event) => (selected = event.detail.value)
    );
    press(el, 'ArrowUp');
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('[selected]')!.getAttribute('value')
    ).to.equal('last');
    press(el, 'ArrowDown');
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('[selected]')!.getAttribute('value')
    ).to.equal('first');
    press(el, 'ArrowUp');
    await el.updateComplete;
    press(el, 'Enter');
    await el.updateComplete;
    expect(selected).to.equal('last');
    expect(el.show).to.equal(false);
  });

  it('空菜单及仅含分隔线的菜单不会选择无效项', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu show></vscode-context-menu>`
    );
    let count = 0;
    el.addEventListener('vsc-context-menu-select', () => count++);
    for (const data of [[], [{separator: true}]]) {
      el.data = data;
      await el.updateComplete;
      press(el, 'ArrowUp');
      press(el, 'Enter');
      press(el, 'ArrowDown');
      press(el, 'Enter');
      await el.updateComplete;
    }
    expect(count).to.equal(0);
    expect(el.show).to.equal(true);
  });

  it('数据缩短后清除失效选择，仍可重新导航', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu
        show
        .data=${[1, 2, 3].map((i) => ({label: `选项 ${i}`, value: String(i)}))}
      ></vscode-context-menu>`
    );
    const selected: string[] = [];
    el.addEventListener('vsc-context-menu-select', (event) =>
      selected.push(event.detail.value)
    );
    press(el, 'ArrowUp');
    await el.updateComplete;
    el.data = [{label: '选项 1', value: '1'}];
    await el.updateComplete;
    press(el, 'Enter');
    expect(selected).to.deep.equal([]);
    press(el, 'ArrowUp');
    await el.updateComplete;
    press(el, 'Enter');
    expect(selected).to.deep.equal(['1']);
  });
});
