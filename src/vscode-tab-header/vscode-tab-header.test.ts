import '../vscode-tabs/index.js';
import '../vscode-tab-panel/index.js';
import {VscodeTabHeader} from './index.js';
import {
  expect,
  fixture,
  html,
  elementUpdated,
  waitUntil,
} from '@open-wc/testing';

describe('vscode-tab-header', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-tab-header');
    expect(el).to.instanceOf(VscodeTabHeader);
  });
});

describe('标题图标', () => {
  it('支持 SVG 插槽、左右位置和三种显示模式', async () => {
    const el = await fixture<VscodeTabHeader>(html`
      <vscode-tab-header>
        <svg slot="icon" viewBox="0 0 16 16">
          <path d="M2 2h12v12H2z"></path>
        </svg>
        设置
      </vscode-tab-header>
    `);
    await elementUpdated(el);
    const icon = el.shadowRoot!.querySelector<HTMLElement>('.icon')!;
    const main = el.shadowRoot!.querySelector<HTMLElement>('.main')!;
    expect(icon.hidden).to.equal(false);
    expect(icon.getBoundingClientRect().left).to.be.lessThan(
      main.getBoundingClientRect().left
    );
    el.iconPosition = 'end';
    await elementUpdated(el);
    expect(icon.getBoundingClientRect().left).to.be.greaterThan(
      main.getBoundingClientRect().left
    );
    el.iconDisplay = 'text';
    await elementUpdated(el);
    expect(icon.hidden).to.equal(true);
    el.iconDisplay = 'icon';
    await elementUpdated(el);
    expect(icon.hidden).to.equal(false);
    expect(getComputedStyle(main).clipPath).to.equal('inset(50%)');
    expect(el.textContent).to.include('设置');
  });

  it('字体图标随标题内容高度变化并支持动态切换', async () => {
    const el = await fixture<VscodeTabHeader>(
      html`<vscode-tab-header icon="gear">设置</vscode-tab-header>`
    );
    const icon = el.shadowRoot!.querySelector<HTMLElement>('.icon')!;
    await waitUntil(() => icon.getBoundingClientRect().height === 16);
    expect(icon.querySelector('vscode-icon')!.name).to.equal('gear');
    el.style.setProperty('--vsc-tab-header-height', '40px');
    await waitUntil(() => icon.getBoundingClientRect().height === 32);
    el.icon = 'home';
    await elementUpdated(el);
    expect(icon.querySelector('vscode-icon')!.name).to.equal('home');
    el.icon = '';
    await elementUpdated(el);
    expect(icon.hidden).to.equal(true);
  });

  it('纯图标标题保留可访问名称', async () => {
    const el = await fixture(html`
      <vscode-tabs style="background: #1f1f1f; color: #cccccc">
        <vscode-tab-header icon-display="icon">
          <svg slot="icon" viewBox="0 0 16 16">
            <path d="M2 2h12v12H2z"></path></svg
          >设置
        </vscode-tab-header>
        <vscode-tab-panel>设置内容</vscode-tab-panel>
      </vscode-tabs>
    `);
    await elementUpdated(el);
    await expect(el).to.be.accessible();
  });
});

describe('自定义字体图标尺寸', () => {
  it('覆盖字体图标样式中的固定字号以适应标题高度', async () => {
    const el = await fixture<VscodeTabHeader>(html`
      <vscode-tab-header style="--vsc-tab-header-height: 40px">
        <span slot="icon" style="font-size: 12px">★</span>收藏
      </vscode-tab-header>
    `);
    const icon = el.querySelector('span')!;
    await waitUntil(() => getComputedStyle(icon).fontSize === '32px');
    expect(icon.getBoundingClientRect().height).to.equal(32);
  });
});
