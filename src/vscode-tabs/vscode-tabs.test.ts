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
    await waitUntil(
      () =>
        el.selectedIndex === 3 &&
        !headers[3].hasAttribute('data-vsc-overflow-hidden')
    );
    await elementUpdated(el);
    expect(selected).to.equal(3);
    expect(headers[3].active).to.equal(true);
    expect(headers[3].getBoundingClientRect().left).to.be.greaterThan(
      headers[0].getBoundingClientRect().left
    );
    expect(headers[1].hasAttribute('data-vsc-overflow-hidden')).to.equal(true);
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
    await waitUntil(() => !headers[2].hasAttribute('data-vsc-overflow-hidden'));
    expect(headers[2].active).to.equal(true);
    el.style.width = '500px';
    await waitUntil(() => button.hidden);
    expect(
      headers.every(
        (header) => !header.hasAttribute('data-vsc-overflow-hidden')
      )
    ).to.equal(true);
    el.style.width = '150px';
    await waitUntil(() => !button.hidden);
    el.overflow = 'wrap';
    await waitUntil(
      () =>
        button.hidden &&
        headers.every(
          (header) => !header.hasAttribute('data-vsc-overflow-hidden')
        )
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
    await waitUntil(() => !headers[2].hasAttribute('data-vsc-overflow-hidden'));
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
        !el
          .querySelectorAll('vscode-tab-header')[2]
          .hasAttribute('data-vsc-overflow-hidden')
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

describe('标题内交互控件的键盘事件', () => {
  it('保留按钮、链接、输入框和可编辑内容的原生按键行为', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs>
        <vscode-tab-header>第一项</vscode-tab-header
        ><vscode-tab-panel>内容</vscode-tab-panel>
        <vscode-tab-header
          >第二项
          <button slot="content-after">关闭</button>
          <a slot="content-after" href="#">链接</a>
          <input slot="content-after" />
          <span slot="content-after" contenteditable="true"
            ><span>编辑</span></span
          > </vscode-tab-header
        ><vscode-tab-panel>内容</vscode-tab-panel>
      </vscode-tabs>
    `);
    for (const control of el.querySelectorAll(
      'button, a, input, [contenteditable] span'
    )) {
      for (const key of [
        ' ',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ]) {
        const event = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        control.dispatchEvent(event);
        expect(event.defaultPrevented, `${control.tagName}: ${key}`).to.equal(
          false
        );
        expect(el.selectedIndex).to.equal(0);
      }
    }
  });
});

describe('溢出变化后的键盘焦点入口', () => {
  const createTabs = () =>
    fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 450px" overflow="menu">
        ${[1, 2, 3, 4].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
  const pressEnd = (header: Element) =>
    header.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'End', bubbles: true, composed: true})
    );
  it('缩小容器或标题变宽时，将被隐藏的焦点移回可见激活项', async () => {
    for (const action of ['resize', 'title']) {
      const el = await createTabs();
      const headers = el.querySelectorAll('vscode-tab-header');
      await waitUntil(
        () => !headers[3].hasAttribute('data-vsc-overflow-hidden')
      );
      headers[0].focus();
      pressEnd(headers[0]);
      expect(document.activeElement).to.equal(headers[3]);
      if (action === 'resize') {
        el.style.width = '180px';
      } else {
        headers[0].style.width = '350px';
      }
      await waitUntil(() =>
        headers[3].hasAttribute('data-vsc-overflow-hidden')
      );
      expect(document.activeElement, action).to.equal(headers[0]);
      expect(headers[0].tabIndex).to.equal(0);
      expect([...headers].filter((h) => h.tabIndex === 0)).to.have.length(1);
      expect(el.selectedIndex).to.equal(0);
    }
  });
  it('保留仍可见的焦点，并在外部获得焦点后仅修复 Tab 入口', async () => {
    const el = await createTabs();
    const headers = el.querySelectorAll('vscode-tab-header');
    await waitUntil(() => !headers[3].hasAttribute('data-vsc-overflow-hidden'));
    headers[0].focus();
    headers[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        composed: true,
      })
    );
    el.style.width = '350px';
    await waitUntil(() => headers[3].hasAttribute('data-vsc-overflow-hidden'));
    expect(document.activeElement).to.equal(headers[1]);
    expect(headers[1].tabIndex).to.equal(0);
    const outside = document.createElement('button');
    el.parentElement!.append(outside);
    outside.focus();
    el.style.width = '180px';
    await waitUntil(() => headers[1].hasAttribute('data-vsc-overflow-hidden'));
    expect(document.activeElement).to.equal(outside);
    expect(headers[0].tabIndex).to.equal(0);
    expect(
      [...headers].filter(
        (h) => !h.hasAttribute('data-vsc-overflow-hidden') && h.tabIndex === 0
      )
    ).to.have.length(1);
    outside.remove();
  });
});

describe('隐藏期间调用方更新 inert', () => {
  it('显示、模式切换和移除后保留动态启用及禁用状态', async () => {
    for (const action of ['resize', 'mode', 'remove']) {
      for (const initial of [false, true]) {
        const el = await fixture<VscodeTabs>(html`
          <vscode-tabs style="width: 180px" overflow="menu">
            <vscode-tab-header style="width: 100px">第一项</vscode-tab-header
            ><vscode-tab-panel>内容</vscode-tab-panel>
            <vscode-tab-header style="width: 100px" ?inert=${initial}>
              第二项<button slot="content-after">
                操作
              </button> </vscode-tab-header
            ><vscode-tab-panel>内容</vscode-tab-panel>
          </vscode-tabs>
        `);
        const header = el.querySelectorAll('vscode-tab-header')[1];
        await waitUntil(() => header.hasAttribute('data-vsc-overflow-hidden'));
        expect(header.inert).to.equal(initial);
        const button = header.querySelector('button')!;
        button.focus();
        expect(document.activeElement).not.to.equal(button);
        header.inert = !initial;
        if (action === 'resize') {
          el.style.width = '500px';
        } else if (action === 'mode') {
          el.overflow = 'wrap';
        } else {
          header.remove();
        }
        await waitUntil(() => !header.hasAttribute('data-vsc-overflow-hidden'));
        expect(header.inert, `${action}: ${initial}`).to.equal(!initial);
        expect(
          header.shadowRoot!.querySelector<HTMLElement>('.wrapper')!.inert
        ).to.equal(false);
        if (action !== 'remove') {
          button.focus();
          expect(document.activeElement === button).to.equal(initial);
        }
      }
    }
  });
});

describe('溢出菜单尊重调用方 inert', () => {
  it('动态禁用项从菜单移除，拒绝旧选择，重新启用后可键盘激活', async () => {
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
    const headers = el.querySelectorAll('vscode-tab-header');
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await waitUntil(() => menu.data.length === 2);
    el.shadowRoot!.querySelector<HTMLButtonElement>(
      '.overflow-button'
    )!.click();
    await elementUpdated(menu);
    headers[2].inert = true;
    menu.dispatchEvent(
      new CustomEvent('vsc-context-menu-select', {
        detail: {value: '2'},
        bubbles: true,
        composed: true,
      })
    );
    expect(el.selectedIndex).to.equal(0);
    await waitUntil(() => menu.data.length === 1);
    expect(menu.data.map((item) => item.value)).to.deep.equal(['1']);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      })
    );
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    await waitUntil(() => el.selectedIndex === 1);
    expect(headers[2].active).to.equal(false);
    headers[2].inert = false;
    await waitUntil(() => menu.data.some((item) => item.value === '2'));
    el.shadowRoot!.querySelector<HTMLButtonElement>(
      '.overflow-button'
    )!.click();
    await elementUpdated(menu);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      })
    );
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    await waitUntil(() => el.selectedIndex === 2);
    expect(el.querySelectorAll('vscode-tab-panel')[2].hidden).to.equal(false);
  });
});

describe('打开菜单的动态定位', () => {
  it('父容器滚动、移动及标题栏宽度变化后继续对齐按钮', async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div style="height: 240px; overflow: auto; width: 600px">
        <div style="height: 50px"></div>
        <vscode-tabs style="width: 280px" overflow="menu">
          ${[1, 2, 3, 4].map(
            (i) =>
              html`<vscode-tab-header style="width: 100px"
                  >标题 ${i}</vscode-tab-header
                ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
          )}
        </vscode-tabs>
        <div style="height: 800px"></div>
      </div>
    `);
    const el = container.querySelector('vscode-tabs')!;
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    const layer = el.shadowRoot!.querySelector<HTMLElement>('.menu-layer')!;
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await waitUntil(() => !button.hidden);
    button.click();
    const aligned = () => {
      const anchor = button.getBoundingClientRect();
      const rect = menu.getBoundingClientRect();
      const expectedLeft = Math.max(
        0,
        Math.min(anchor.right - rect.width, innerWidth - rect.width)
      );
      const expectedTop =
        anchor.bottom + rect.height > innerHeight
          ? Math.max(0, anchor.top - rect.height)
          : anchor.bottom;
      return (
        Math.abs(layer.getBoundingClientRect().left - expectedLeft) < 1 &&
        Math.abs(layer.getBoundingClientRect().top - expectedTop) < 1
      );
    };
    await waitUntil(aligned);
    container.scrollTop = 30;
    await waitUntil(aligned);
    el.style.marginLeft = '80px';
    await waitUntil(aligned);
    el.style.width = '180px';
    await waitUntil(aligned);
    expect(menu.show).to.equal(true);
    expect(layer.matches(':popover-open')).to.equal(true);
    button.click();
    await elementUpdated(menu);
    expect(menu.show).to.equal(false);
  });
});

describe('同数量隐藏集合替换', () => {
  it('程序激活其他标签后，旧高亮不能误激活新集合中的标签', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 280px" overflow="menu">
        ${[1, 2, 3, 4].map(
          (i) =>
            html`<vscode-tab-header style="width: 100px"
                >标题 ${i}</vscode-tab-header
              ><vscode-tab-panel>内容 ${i}</vscode-tab-panel>`
        )}
      </vscode-tabs>
    `);
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    await waitUntil(() => menu.data.length === 2);
    el.shadowRoot!.querySelector<HTMLButtonElement>(
      '.overflow-button'
    )!.click();
    await elementUpdated(menu);
    const press = (key: string) =>
      menu.dispatchEvent(
        new KeyboardEvent('keydown', {key, bubbles: true, composed: true})
      );
    press('ArrowDown');
    el.selectedIndex = 2;
    await waitUntil(() => menu.data[0].value === '1');
    press('Enter');
    expect(el.selectedIndex).to.equal(2);
    expect(menu.show).to.equal(true);
    press('ArrowDown');
    press('Enter');
    await waitUntil(() => el.selectedIndex === 1);
  });
});

describe('无可操作隐藏项时的菜单入口', () => {
  it('全禁用时阻止打开，动态禁用最后一项关闭菜单并恢复可见焦点', async () => {
    const el = await fixture<VscodeTabs>(html`
      <vscode-tabs style="width: 180px" overflow="menu">
        <vscode-tab-header style="width: 100px">第一项</vscode-tab-header
        ><vscode-tab-panel>内容</vscode-tab-panel>
        <vscode-tab-header style="width: 100px" inert>第二项</vscode-tab-header
        ><vscode-tab-panel>内容</vscode-tab-panel>
      </vscode-tabs>
    `);
    const headers = el.querySelectorAll('vscode-tab-header');
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    const menu = el.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    const layer = el.shadowRoot!.querySelector('.menu-layer')!;
    await waitUntil(() => !button.hidden && button.disabled);
    button.click();
    button.dispatchEvent(
      new MouseEvent('click', {bubbles: true, composed: true})
    );
    await elementUpdated(el);
    expect(menu.show).to.equal(false);
    expect(layer.matches(':popover-open')).to.equal(false);
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    headers[1].inert = false;
    await waitUntil(() => !button.disabled);
    button.click();
    await elementUpdated(menu);
    await waitUntil(() => menu.matches(':focus-within'));
    headers[1].inert = true;
    await waitUntil(() => button.disabled && !menu.show);
    expect(layer.matches(':popover-open')).to.equal(false);
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(document.activeElement).to.equal(headers[0]);
    headers[1].inert = false;
    await waitUntil(() => !button.disabled);
    button.click();
    await elementUpdated(menu);
    expect(menu.show).to.equal(true);
    expect(menu.data.map((item) => item.value)).to.deep.equal(['1']);
    button.click();
  });
});
