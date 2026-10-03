import {expect, fixture, html, aTimeout} from '@open-wc/testing';
import {VscodeTooltip, TooltipPlacement} from './index.js';
import '../vscode-textfield/index.js';
import '../vscode-radio-group/index.js';
import '../vscode-radio/index.js';

const panel = (el: VscodeTooltip) =>
  el.shadowRoot!.querySelector<HTMLElement>('.tooltip')!;
const setup = () =>
  fixture<VscodeTooltip>(html`
    <vscode-tooltip
      text="搜索 (Ctrl+Shift+F)"
      delay="0"
      style="position:fixed;left:250px;top:150px"
    >
      <button aria-describedby="existing">搜索</button>
    </vscode-tooltip>
  `);

describe('vscode-tooltip', () => {
  it('通过外部 id 关联，替换和延迟创建目标时重新关联，不改变控件层级', async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <vscode-radio-group
          ><vscode-radio id="tooltip-choice"
            >选择</vscode-radio
          ></vscode-radio-group
        >
        <vscode-tooltip
          for="tooltip-choice"
          text="选择说明"
          delay="0"
        ></vscode-tooltip>
      </div>
    `);
    const el = root.querySelector('vscode-tooltip')!;
    const radio = root.querySelector('vscode-radio')!;
    await el.updateComplete;
    expect(radio.parentElement!.localName).to.equal('vscode-radio-group');
    radio.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    expect(panel(el).getBoundingClientRect().height).to.be.at.most(26);
    const replacement = document.createElement('button');
    replacement.id = radio.id;
    radio.remove();
    await aTimeout(20);
    expect(radio.hasAttribute('aria-describedby')).to.equal(false);
    root.append(replacement);
    await aTimeout(20);
    replacement.focus();
    await el.updateComplete;
    expect(replacement.getAttribute('aria-describedby')).to.include(
      'vscode-tooltip-'
    );
    expect(panel(el).matches(':popover-open')).to.equal(true);
  });

  it('元素引用优先于 id，并保持数字输入框的 slot 与内部无障碍描述', async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <button id="other-tooltip-target">其他</button>
        <vscode-textfield id="tooltip-field" label="数值"
          ><span slot="content-after">单位</span></vscode-textfield
        >
        <vscode-tooltip
          for="other-tooltip-target"
          text="请输入有效数值"
        ></vscode-tooltip>
      </div>
    `);
    const el = root.querySelector('vscode-tooltip')!;
    const field = root.querySelector('vscode-textfield')!;
    await field.updateComplete;
    el.target = field;
    await el.updateComplete;
    expect(
      root.querySelector('button')!.hasAttribute('aria-describedby')
    ).to.equal(false);
    expect(
      field.querySelector('[slot="content-after"]')!.parentElement
    ).to.equal(field);
    const input = field.shadowRoot!.querySelector('input')!;
    input.setAttribute('aria-describedby', 'field-error');
    input.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    expect(input.ariaDescribedByElements).to.include(
      el.querySelector('[role="tooltip"]')
    );
    input.blur();
    await el.updateComplete;
    expect(input.ariaDescribedByElements).not.to.include(
      el.querySelector('[role="tooltip"]')
    );
    expect(input.getAttribute('aria-describedby')).to.equal('field-error');
  });

  it('受控持续显示多行字段提示，关闭、禁用、Escape 和重新打开生效', async () => {
    const el = await setup();
    el.text = '错误：数值无效\n说明：请输入正数';
    el.open = true;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    expect(el.querySelector('[role="tooltip"]')!.textContent).to.include(
      '\n说明'
    );
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(120);
    expect(panel(el).matches(':popover-open')).to.equal(true);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.text += '。';
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.open = false;
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    el.disabled = true;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.disabled = false;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    el.open = false;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  it('视口边缘回退并重新定向箭头，允许字段提示按右、下、上的顺序回退', async () => {
    const el = await setup();
    el.style.left = `${innerWidth - 65}px`;
    el.style.top = `${innerHeight - 30}px`;
    el.placement = 'right';
    el.fallbacks = ['bottom', 'top'];
    el.open = true;
    await el.updateComplete;
    expect(panel(el).dataset.placement).to.equal('top');
    const rect = panel(el).getBoundingClientRect();
    expect(rect.left).to.be.at.least(8);
    expect(rect.right).to.be.at.most(innerWidth - 7);
    expect(rect.bottom).to.be.lessThan(
      el.querySelector('button')!.getBoundingClientRect().top
    );
    expect(getComputedStyle(panel(el), '::before').bottom).to.equal('-5px');
    el.fallbacks = null;
    await el.updateComplete;
    expect(panel(el).dataset.placement).to.equal('left');
  });

  it('滚动容器裁剪、hidden 与 inert 时隐藏持续提示，恢复后重新显示', async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div style="position:fixed;left:100px;top:50px">
        <div id="tooltip-scroll" style="height:60px;overflow:auto">
          <button id="tooltip-scroll-target">字段</button>
          <div style="height:300px"></div>
        </div>
        <vscode-tooltip
          for="tooltip-scroll-target"
          text="字段说明"
          open
        ></vscode-tooltip>
      </div>
    `);
    const el = root.querySelector('vscode-tooltip')!;
    const scroll = root.querySelector<HTMLDivElement>('#tooltip-scroll')!;
    await aTimeout(60);
    expect(getComputedStyle(panel(el)).visibility).to.equal('visible');
    scroll.scrollTop = 150;
    await aTimeout(60);
    expect(getComputedStyle(panel(el)).visibility).to.equal('hidden');
    scroll.scrollTop = 0;
    await aTimeout(60);
    expect(getComputedStyle(panel(el)).visibility).to.equal('visible');
    scroll.inert = true;
    await aTimeout(40);
    expect(getComputedStyle(panel(el)).visibility).to.equal('hidden');
    scroll.inert = false;
    scroll.hidden = true;
    await aTimeout(40);
    expect(getComputedStyle(panel(el)).visibility).to.equal('hidden');
    scroll.hidden = false;
    await aTimeout(60);
    expect(getComputedStyle(panel(el)).visibility).to.equal('visible');
  });

  it('鼠标可移入提示，Escape 后内容更新不重新打开', async () => {
    const el = await setup();
    const button = el.querySelector('button')!;
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(20);
    button.dispatchEvent(new MouseEvent('mouseleave'));
    panel(el).dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(120);
    expect(panel(el).matches(':popover-open')).to.equal(true);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    el.text = '更新后的提示';
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(20);
    expect(panel(el).matches(':popover-open')).to.equal(true);
    panel(el).dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(120);
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  it('同一 ShadowRoot 中可按 id 关联目标', async () => {
    const root = await fixture<HTMLDivElement>(html`<div></div>`);
    const shadow = root.attachShadow({mode: 'open'});
    shadow.innerHTML =
      '<button id="shadow-target">操作</button><vscode-tooltip for="shadow-target" text="说明"></vscode-tooltip>';
    const el = shadow.querySelector('vscode-tooltip')!;
    await el.updateComplete;
    shadow.querySelector('button')!.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    const id = shadow
      .querySelector('button')!
      .getAttribute('aria-describedby')!;
    expect(shadow.getElementById(id)?.textContent).to.equal('说明');
  });
  it('注册自定义元素', () => {
    expect(document.createElement('vscode-tooltip')).to.be.instanceOf(
      VscodeTooltip
    );
  });
  it('悬停显示，离开后关闭，空内容和禁用时不显示', async () => {
    const el = await setup();
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(20);
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(120);
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.disabled = true;
    await el.updateComplete;
    el.querySelector('button')!.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.disabled = false;
    el.text = '';
    await el.updateComplete;
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(20);
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  it('等待悬停延迟，离开时取消待显示的提示', async () => {
    const el = await setup();
    el.delay = 80;
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(20);
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseleave'));
    await aTimeout(100);
    expect(panel(el).matches(':popover-open')).to.equal(false);
    el.querySelector('button')!.dispatchEvent(new MouseEvent('mouseenter'));
    await aTimeout(100);
    expect(panel(el).matches(':popover-open')).to.equal(true);
  });

  it('聚焦立即显示，Escape 关闭并保持焦点，失焦关闭', async () => {
    const el = await setup();
    const button = el.querySelector('button')!;
    button.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    button.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})
    );
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    expect(document.activeElement).to.equal(button);
    button.blur();
    button.focus();
    await el.updateComplete;
    button.blur();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  for (const placement of [
    'top',
    'bottom',
    'left',
    'right',
  ] as TooltipPlacement[]) {
    it(`${placement} 方向定位并显示箭头`, async () => {
      const el = await setup();
      el.placement = placement;
      const button = el.querySelector('button')!;
      button.focus();
      await el.updateComplete;
      const anchor = button.getBoundingClientRect();
      const rect = panel(el).getBoundingClientRect();
      if (placement === 'top') {
        expect(rect.bottom).to.be.lessThan(anchor.top);
      } else if (placement === 'bottom') {
        expect(rect.top).to.be.greaterThan(anchor.bottom);
      } else if (placement === 'left') {
        expect(rect.right).to.be.lessThan(anchor.left);
      } else {
        expect(rect.left).to.be.greaterThan(anchor.right);
      }
      expect(getComputedStyle(panel(el), '::before').content).to.equal('""');
    });
  }

  it('保留原有无障碍描述，更新纯文本，替换目标和移除时清理关联', async () => {
    const el = await setup();
    const button = el.querySelector('button')!;
    const id = button.getAttribute('aria-describedby')!.split(' ')[1];
    expect(el.querySelector(`#${id}`)?.getAttribute('role')).to.equal(
      'tooltip'
    );
    button.focus();
    el.text = '<b>提示</b>';
    await el.updateComplete;
    expect(el.querySelector(`#${id}`)!.textContent).to.equal('<b>提示</b>');
    expect(el.querySelector(`#${id}`)!.children.length).to.equal(0);
    const replacement = document.createElement('button');
    button.replaceWith(replacement);
    await aTimeout(20);
    expect(button.getAttribute('aria-describedby')).to.equal('existing');
    expect(replacement.getAttribute('aria-describedby')).to.equal(id);
    replacement.focus();
    await el.updateComplete;
    el.remove();
    expect(replacement.hasAttribute('aria-describedby')).to.equal(false);
    expect(panel(el).matches(':popover-open')).to.equal(false);
    document.body.append(el);
    await aTimeout(20);
    replacement.focus();
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
  });

  it('显示期间响应主题变量和禁用状态', async () => {
    const el = await setup();
    el.querySelector('button')!.focus();
    await el.updateComplete;
    el.style.setProperty('--vscode-editorHoverWidget-background', '#ffffff');
    el.style.setProperty('--vscode-editorHoverWidget-foreground', '#222222');
    el.style.setProperty('--vscode-editorHoverWidget-border', '#123456');
    const style = getComputedStyle(panel(el));
    expect(style.backgroundColor).to.equal('rgb(255, 255, 255)');
    expect(style.color).to.equal('rgb(34, 34, 34)');
    expect(style.borderTopColor).to.equal('rgb(18, 52, 86)');
    expect(getComputedStyle(panel(el), '::before').backgroundColor).to.equal(
      style.backgroundColor
    );
    el.disabled = true;
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(false);
    expect(el.querySelector('button')!.disabled).to.equal(false);
  });
});
