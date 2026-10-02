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

describe('菜单外部点击监听器生命周期', () => {
  const frame = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const createMenu = () =>
    fixture<VscodeContextMenu>(
      html`<vscode-context-menu
        .data=${[{label: '菜单项', value: 'item'}]}
      ></vscode-context-menu>`
    );

  it('程序关闭后可通过外部按钮重新打开', async () => {
    const el = await createMenu();
    el.show = true;
    await el.updateComplete;
    await frame();
    el.show = false;
    await el.updateComplete;
    const trigger = document.createElement('button');
    el.parentElement!.append(trigger);
    trigger.addEventListener('click', () => (el.show = true));
    trigger.click();
    await el.updateComplete;
    expect(el.show).to.equal(true);
    expect(
      el.shadowRoot!.querySelector('vscode-context-menu-item')
    ).not.to.equal(null);
  });

  it('打开后立即关闭不会延迟注册过期监听器', async () => {
    const el = await createMenu();
    el.show = true;
    await el.updateComplete;
    el.show = false;
    await frame();
    const trigger = document.createElement('button');
    el.parentElement!.append(trigger);
    trigger.addEventListener('click', () => (el.show = true));
    trigger.click();
    await el.updateComplete;
    expect(el.show).to.equal(true);
  });

  it('断开连接后清理监听器，重连仍能正常打开', async () => {
    const el = await createMenu();
    const parent = el.parentElement!;
    el.show = true;
    await el.updateComplete;
    await frame();
    el.remove();
    const trigger = document.createElement('button');
    parent.append(trigger);
    trigger.addEventListener('click', () => parent.append(el));
    trigger.click();
    await el.updateComplete;
    expect(el.show).to.equal(true);
    await frame();
    document.body.click();
    await el.updateComplete;
    expect(el.show).to.equal(false);
  });

  it('点击内部空白后，外部点击仍能关闭菜单', async () => {
    const el = await createMenu();
    el.show = true;
    await el.updateComplete;
    await frame();
    el.shadowRoot!.querySelector<HTMLElement>('.context-menu')!.click();
    expect(el.show).to.equal(true);
    document.body.click();
    await el.updateComplete;
    expect(el.show).to.equal(false);
  });
});

describe('菜单数据身份变化', () => {
  it('等价数据保留高亮，同长度替换或分隔项变化清除高亮', async () => {
    const el = await fixture<VscodeContextMenu>(
      html`<vscode-context-menu show></vscode-context-menu>`
    );
    const press = (key: string) =>
      el.dispatchEvent(
        new KeyboardEvent('keydown', {key, bubbles: true, composed: true})
      );
    let selected = '';
    el.addEventListener('vsc-context-menu-select', (event) => {
      selected = event.detail.value;
    });
    el.data = [
      {label: '甲', value: 'a'},
      {label: '乙', value: 'b'},
    ];
    await el.updateComplete;
    press('ArrowDown');
    el.data = el.data.map((item) => ({...item}));
    await el.updateComplete;
    press('Enter');
    expect(selected).to.equal('a');
    selected = '';
    el.show = true;
    await el.updateComplete;
    press('ArrowDown');
    el.data = [
      {label: '丙', value: 'c'},
      {label: '乙', value: 'b'},
    ];
    await el.updateComplete;
    press('Enter');
    expect(selected).to.equal('');
    await el.updateComplete;
    press('ArrowDown');
    const mutated = el.data;
    mutated[0].value = 'd';
    el.data = mutated;
    await el.updateComplete;
    press('Enter');
    expect(selected).to.equal('');
    await el.updateComplete;
    press('ArrowDown');
    el.data = [{separator: true}, {label: '乙', value: 'b'}];
    await el.updateComplete;
    press('Enter');
    expect(selected).to.equal('');
    await el.updateComplete;
    press('ArrowDown');
    await el.updateComplete;
    press('Enter');
    expect(selected).to.equal('b');
  });
});
