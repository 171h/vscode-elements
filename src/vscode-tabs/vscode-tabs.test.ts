import '../vscode-tabs/vscode-tabs.js';
import '../vscode-tab-header/vscode-tab-header.js';
import '../vscode-tab-panel/vscode-tab-panel.js';
import {VscodeContextMenu} from '../vscode-context-menu/index.js';
import {VscodeTabs} from './index.js';
import {
  expect,
  fixture,
  html,
  elementUpdated,
  waitUntil,
} from '@open-wc/testing';

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

describe('标题水平滚动', () => {
  it('使用覆盖滚动条且选中末项时自动滚入视口', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 200px" overflow="scroll">
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 120px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    await elementUpdated(el);
    const list = el.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    const scrollbar = el.shadowRoot!.querySelector<HTMLElement>('.scrollbar')!;
    const height = el.getBoundingClientRect().height;
    expect(getComputedStyle(scrollbar).position).to.equal('absolute');
    expect(getComputedStyle(scrollbar).opacity).to.equal('0');
    el.selectedIndex = 2;
    await elementUpdated(el);
    expect(list.scrollLeft).to.be.greaterThan(0);
    expect(el.getBoundingClientRect().height).to.equal(height);
    expect(
      el.querySelectorAll('vscode-tab-header')[2].getBoundingClientRect().right
    ).to.be.at.most(list.getBoundingClientRect().right + 1);
  });
});

describe('标题溢出菜单', () => {
  async function createTabs() {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs
        style="width: 280px; background: #1f1f1f; color: #cccccc"
        overflow="menu"
      >
        ${[1, 2, 3, 4].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    await waitUntil(() => !button.hidden);
    await elementUpdated(el);
    return {
      el,
      button,
      headers: Array.from(el.querySelectorAll('vscode-tab-header')),
      menu: el.shadowRoot!.querySelector<VscodeContextMenu>(
        'vscode-context-menu'
      )!,
    };
  }

  it('菜单激活隐藏标题并放到末位，保留索引和面板对应关系', async () => {
    const {el, button, headers, menu} = await createTabs();
    let selected = -1;
    el.addEventListener(
      'vsc-tabs-select',
      (event) => (selected = event.detail.selectedIndex)
    );
    expect(menu.data.map((item) => item.value)).to.deep.equal(['2', '3']);
    button.click();
    await elementUpdated(menu);
    menu
      .shadowRoot!.querySelectorAll('vscode-context-menu-item')[1]
      .shadowRoot!.querySelector('a')!
      .click();
    await waitUntil(() => el.selectedIndex === 3 && !headers[3].inert);
    await elementUpdated(el);
    expect(selected).to.equal(3);
    expect(headers[3].active).to.equal(true);
    expect(headers[3].getBoundingClientRect().left).to.be.greaterThan(
      headers[0].getBoundingClientRect().left
    );
    expect(headers[1].inert).to.equal(true);
    expect(menu.data.map((item) => item.value)).to.deep.equal(['1', '2']);
    expect(Array.from(el.querySelectorAll('vscode-tab-header'))).to.deep.equal(
      headers
    );
    expect(el.querySelectorAll('vscode-tab-panel')[3].hidden).to.equal(false);
    expect(document.activeElement).to.equal(headers[3]);
    expect(menu.show).to.equal(false);
  });

  it('缩放及切换模式后刷新可见项，程序选中隐藏标题也会显示', async () => {
    const {el, button, headers} = await createTabs();
    el.selectedIndex = 2;
    await waitUntil(() => !headers[2].inert);
    expect(headers[2].active).to.equal(true);
    el.style.width = '500px';
    await waitUntil(() => button.hidden);
    expect(headers.every((header) => !header.inert)).to.equal(true);
    el.style.width = '150px';
    await waitUntil(() => !button.hidden);
    el.overflow = 'wrap';
    await waitUntil(
      () => button.hidden && headers.every((header) => !header.inert)
    );
  });

  it('菜单按 Escape 关闭并恢复按钮焦点，不误触发标签选择', async () => {
    const {el, button, menu} = await createTabs();
    button.click();
    await elementUpdated(menu);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      })
    );
    await elementUpdated(el);
    expect(menu.show).to.equal(false);
    expect(el.selectedIndex).to.equal(0);
    expect(el.shadowRoot!.activeElement).to.equal(button);
  });

  it('包含菜单的组件可访问', async () => {
    const {el} = await createTabs();
    await expect(el).to.be.accessible();
  });
});

describe('溢出边界与键盘操作', () => {
  it('超长标题在换行模式下折行，图标不会挤压文字', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 120px" overflow="wrap">
        <vscode-tab-header icon="gear"
          >这是一个需要完整显示的很长的标签页标题这是一个需要完整显示的很长的标签页标题</vscode-tab-header
        >
        <vscode-tab-panel>内容</vscode-tab-panel>
      </vscode-tabs>
    `);
    const header = el.querySelector('vscode-tab-header')!;
    await elementUpdated(header);
    const main = header.shadowRoot!.querySelector<HTMLElement>('.main')!;
    await waitUntil(() => main.getBoundingClientRect().height > 40);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    expect(header.getBoundingClientRect().width).to.be.at.most(120);
    expect(main.scrollWidth).to.be.at.most(main.clientWidth + 1);
    expect(
      header.shadowRoot!.querySelector('.icon')!.getBoundingClientRect().height
    ).to.be.at.most(20);
  });

  it('无溢出时隐藏滚动条，带附加操作时覆盖滚动条与标题视口等宽', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 500px" overflow="scroll">
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
        <button slot="addons" style="width: 60px">操作</button>
      </vscode-tabs>
    `);
    const scrollbar = el.shadowRoot!.querySelector<HTMLElement>('.scrollbar')!;
    await elementUpdated(el);
    expect(scrollbar.hidden).to.equal(true);
    el.style.width = '200px';
    await waitUntil(() => !scrollbar.hidden);
    const list = el.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    expect(scrollbar.clientWidth).to.equal(list.clientWidth);
    scrollbar.scrollLeft = 50;
    scrollbar.dispatchEvent(new Event('scroll'));
    expect(list.scrollLeft).to.equal(50);
    const first = el.querySelector('vscode-tab-header')!;
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'End', bubbles: true, composed: true})
    );
    const last = el.querySelectorAll('vscode-tab-header')[2];
    expect(document.activeElement).to.equal(last);
    last.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    await elementUpdated(el);
    expect(el.selectedIndex).to.equal(2);
  });

  it('菜单打开时具备可访问菜单语义，并可通过键盘选中隐藏标题', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs
        style="width: 180px; background: #1f1f1f; color: #cccccc"
        overflow="menu"
      >
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    await waitUntil(() => !button.hidden);
    button.click();
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await waitUntil(
      () => !!menu.shadowRoot?.querySelector('[role="menuitem"]')
    );
    await expect(el).to.be.accessible();
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      })
    );
    await waitUntil(
      () =>
        !!menu
          .shadowRoot!.querySelector('.context-menu')!
          .getAttribute('aria-activedescendant')
    );
    const activeId = menu
      .shadowRoot!.querySelector('.context-menu')!
      .getAttribute('aria-activedescendant')!;
    expect(
      menu.shadowRoot!.getElementById(activeId)!.hasAttribute('selected')
    ).to.equal(true);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    await waitUntil(() => el.selectedIndex === 1);
  });

  it('模式切换和移除标题时恢复调用方的 inert，并在重连后继续响应缩放', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 180px" overflow="menu">
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px" ?inert=${i === 2}
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const headers = el.querySelectorAll('vscode-tab-header');
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    await waitUntil(() => !button.hidden);
    headers[2].remove();
    await waitUntil(() => !headers[2].inert);
    el.overflow = 'wrap';
    await waitUntil(() => button.hidden);
    expect(headers[1].inert).to.equal(true);
    const parent = el.parentElement!;
    el.remove();
    el.overflow = 'menu';
    parent.append(el);
    await waitUntil(() => !button.hidden);
    el.style.width = '500px';
    await waitUntil(() => button.hidden);
    expect(headers[1].inert).to.equal(true);
  });
});

describe('溢出菜单首次向上导航', () => {
  it('首次按向上键和 Enter 激活最后一个隐藏标签', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 180px" overflow="menu">
        ${[1, 2, 3].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    await waitUntil(() => !button.hidden);
    button.click();
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await elementUpdated(menu);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      })
    );
    await elementUpdated(menu);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    await waitUntil(
      () =>
        el.selectedIndex === 2 &&
        !el.querySelectorAll('vscode-tab-header')[2].inert
    );
    expect(el.querySelectorAll('vscode-tab-panel')[2].hidden).to.equal(false);
    expect(menu.show).to.equal(false);
  });
});

describe('打开菜单时缩放容器', () => {
  it('隐藏项减少后忽略失效高亮，重新导航仍能激活标签', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 180px" overflow="menu">
        ${[1, 2, 3, 4].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    await waitUntil(() => !button.hidden);
    button.click();
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await elementUpdated(menu);
    const press = (key: string) =>
      menu.dispatchEvent(
        new KeyboardEvent('keydown', {key, bubbles: true, composed: true})
      );
    press('ArrowUp');
    await elementUpdated(menu);
    el.style.width = '280px';
    await waitUntil(() => menu.data.length === 2);
    await elementUpdated(menu);
    press('Enter');
    expect(el.selectedIndex).to.equal(0);
    expect(menu.show).to.equal(true);
    press('ArrowDown');
    await elementUpdated(menu);
    press('Enter');
    await waitUntil(() => el.selectedIndex === 2);
    expect(el.querySelectorAll('vscode-tab-panel')[2].hidden).to.equal(false);
  });
});

describe('程序关闭溢出菜单后的重新打开', () => {
  it('容器变宽、切换模式和重连后，菜单与 Popover 保持同步', async () => {
    for (const action of ['resize', 'mode', 'reconnect']) {
      const el = await fixture<VscodeTabs>(html`
        <vscode-tabs style="width: 180px" overflow="menu">
          ${[1, 2, 3].map(
            (i) =>
              html`<vscode-tab-header style="width: 100px"
                  >标题 ${i}</vscode-tab-header
                ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
          )}
        </vscode-tabs>
      `);
      const button =
        el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
      const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
        'vscode-context-menu'
      )!;
      await waitUntil(() => !button.hidden);
      button.click();
      await elementUpdated(menu);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
      if (action === 'resize') {
        el.style.width = '500px';
        await waitUntil(() => !menu.show);
        el.style.width = '180px';
      } else if (action === 'mode') {
        el.overflow = 'wrap';
        await waitUntil(() => !menu.show);
        el.overflow = 'menu';
      } else {
        const parent = el.parentElement!;
        el.remove();
        parent.append(el);
      }
      await waitUntil(() => !button.hidden);
      button.click();
      await elementUpdated(menu);
      expect(menu.show, action).to.equal(true);
      expect(button.getAttribute('aria-expanded'), action).to.equal('true');
      expect(
        el.shadowRoot!.querySelector('.menu-layer')!.matches(':popover-open'),
        action
      ).to.equal(true);
      expect(
        menu.shadowRoot!.querySelector('vscode-context-menu-item'),
        action
      ).not.to.equal(null);
      button.click();
      await elementUpdated(menu);
    }
  });
});
