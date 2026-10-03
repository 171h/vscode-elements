import {expect, fixture, html} from '../includes/testing.js';
import './vscode-tabs.js';
import '../vscode-fieldset/index.js';
import type {VscodeTabs} from './vscode-tabs.js';
import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import {VscodeTabPanel} from '../vscode-tab-panel/index.js';

const headers = (tabs: VscodeTabs) =>
  Array.from(tabs.children).filter(
    (el): el is VscodeTabHeader => el instanceof VscodeTabHeader
  );
const panels = (tabs: VscodeTabs) =>
  Array.from(tabs.children).filter(
    (el): el is VscodeTabPanel => el instanceof VscodeTabPanel
  );
async function setup() {
  const root = await fixture<HTMLDivElement>(
    html` <div style="width: 600px">
      <vscode-tabs>
        <vscode-tab-header>One</vscode-tab-header>
        <vscode-tab-panel style="min-height: 160px">
          <vscode-fieldset
            ><fieldset style="height: 60px">
              <legend>Alpha</legend>
              <input value="kept" /></fieldset
          ></vscode-fieldset>
          <fieldset style="height: 60px">
            <legend>Beta</legend>
            <input />
          </fieldset>
        </vscode-tab-panel>
        <vscode-tab-header>Two</vscode-tab-header>
        <vscode-tab-panel style="min-height: 160px"
          ><fieldset style="height: 60px">
            <legend>Gamma</legend>
          </fieldset></vscode-tab-panel
        >
      </vscode-tabs>
      <vscode-tabs>
        <vscode-tab-header>Other</vscode-tab-header>
        <vscode-tab-panel style="min-height: 160px"></vscode-tab-panel>
      </vscode-tabs>
    </div>`
  );
  await new Promise((resolve) => setTimeout(resolve, 30));
  return Array.from(root.querySelectorAll('vscode-tabs'));
}
function start(el: Element) {
  const transfer = new DataTransfer();
  el.dispatchEvent(
    new DragEvent('dragstart', {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer: transfer,
    })
  );
  return transfer;
}
function drag(
  el: Element,
  transfer: DataTransfer,
  type = 'drop',
  x = 0.5,
  y = 0.5
) {
  const rect = el.getBoundingClientRect();
  el.dispatchEvent(
    new DragEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer: transfer,
      clientX: rect.left + rect.width * x,
      clientY: rect.top + rect.height * y,
    })
  );
}
function end() {
  document.dispatchEvent(new DragEvent('dragend'));
}

describe('标签页侧栏拖拽', () => {
  afterEach(end);

  it('对标题和面板成对排序，保留选中面板及 ARIA 关联', async () => {
    const [tabs] = await setup();
    const [first, second] = headers(tabs);
    const original = panels(tabs)[0];
    drag(second, start(first), 'drop', 0.9);
    await tabs.updateComplete;
    expect(headers(tabs)).to.deep.equal([second, first]);
    expect(panels(tabs)[1]).to.equal(original);
    expect(tabs.selectedIndex).to.equal(1);
    expect(original.hidden).to.equal(false);
    expect(first.ariaControls).to.equal(original.id);
    expect(original.ariaLabelledby).to.equal(first.id);
  });

  it('将视图移至另一视图之后并保留输入值及监听器', async () => {
    const [tabs] = await setup();
    const panel = panels(tabs)[0];
    const view = panel.firstElementChild!;
    const input = view.querySelector('input')!;
    input.value = 'edited';
    let fired = false;
    input.addEventListener('change', () => {
      fired = true;
    });
    drag(
      panel.lastElementChild!,
      start(view.querySelector('legend')!),
      'drop',
      0.5,
      0.9
    );
    expect(panel.lastElementChild).to.equal(view);
    expect(input.value).to.equal('edited');
    input.dispatchEvent(new Event('change'));
    expect(fired).to.equal(true);
  });

  it('显示半视图遮罩并在取消时清除', async () => {
    const [tabs] = await setup();
    const panel = panels(tabs)[0];
    drag(
      panel.lastElementChild!,
      start(panel.querySelector('legend')!),
      'dragover',
      0.5,
      0.1
    );
    const overlay = tabs.shadowRoot!.querySelector<HTMLElement>(
      '[data-vsc-drop-indicator]'
    )!;
    expect(parseFloat(overlay.style.height)).to.be.closeTo(
      panel.lastElementChild!.getBoundingClientRect().height / 2,
      1
    );
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(
      tabs.shadowRoot!.querySelector('[data-vsc-drop-indicator]')
    ).to.equal(null);
    expect(panel.querySelector('legend')!.textContent).to.equal('Alpha');
  });

  it('激活悬停标题并将视图移入其面板', async () => {
    const [tabs] = await setup();
    const view = panels(tabs)[0].firstElementChild!;
    const target = headers(tabs)[1];
    const transfer = start(view.querySelector('legend')!);
    drag(target, transfer, 'dragover');
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(tabs.selectedIndex).to.equal(1);
    expect(panels(tabs)[1].hidden).to.equal(false);
    drag(target, transfer);
    expect(view.parentElement).to.equal(panels(tabs)[1]);
  });

  it('将 fieldset 提升为标签页，并在移回后移除生成的标签页', async () => {
    const [tabs] = await setup();
    const original = panels(tabs)[0];
    const view = original.firstElementChild!;
    drag(headers(tabs)[1], start(view.querySelector('legend')!), 'drop', 0.95);
    expect(headers(tabs)).to.have.length(3);
    expect(headers(tabs)[2].textContent).to.equal('Alpha');
    expect(panels(tabs)[2].firstElementChild).to.equal(view);
    tabs.selectedIndex = 0;
    await tabs.updateComplete;
    drag(original, start(view.querySelector('legend')!));
    expect(headers(tabs)).to.have.length(2);
    expect(view.parentElement).to.equal(original);
  });

  it('跨组件将视图移入空面板并派发布局详情', async () => {
    const [source, destination] = await setup();
    const view = panels(source)[0].firstElementChild!;
    let detail: {source: VscodeTabs; destination: VscodeTabs} | undefined;
    destination.addEventListener('vsc-tabs-layout-change', (event) => {
      detail = (event as CustomEvent).detail;
    });
    drag(panels(destination)[0], start(view.querySelector('legend')!));
    expect(view.parentElement).to.equal(panels(destination)[0]);
    expect(detail?.source).to.equal(source);
    expect(detail?.destination).to.equal(destination);
  });

  it('将拖拽标题的全部视图合并到另一面板', async () => {
    const [source, destination] = await setup();
    const original = panels(source)[0];
    const views = Array.from(original.children);
    drag(panels(destination)[0], start(headers(source)[0]));
    expect(Array.from(panels(destination)[0].children)).to.deep.equal(views);
    expect(headers(source)).to.have.length(1);
    expect(panels(source)[0].hidden).to.equal(false);
  });

  it('跨组件移动整对标题和面板', async () => {
    const [source, destination] = await setup();
    const header = headers(source)[0];
    const panel = panels(source)[0];
    drag(headers(destination)[0], start(header), 'drop', 0.9);
    expect(headers(destination)[1]).to.equal(header);
    expect(panels(destination)[1]).to.equal(panel);
    expect(headers(source)).to.have.length(1);
  });

  it('显示同组另一面板以合并拖拽标题的视图', async () => {
    const [tabs] = await setup();
    const source = panels(tabs)[0];
    const target = panels(tabs)[1];
    const views = Array.from(source.children);
    const transfer = start(headers(tabs)[0]);
    drag(headers(tabs)[1], transfer, 'dragover');
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(target.hidden).to.equal(false);
    drag(target, transfer);
    expect(Array.from(target.children).slice(1)).to.deep.equal(views);
    expect(headers(tabs)).to.have.length(1);
    expect(target.hidden).to.equal(false);
  });

  it('合并视图时保留面板无关文本', async () => {
    const [source, destination] = await setup();
    const original = panels(source)[0];
    original.append('Keep this panel content');
    drag(panels(destination)[0], start(headers(source)[0]));
    expect(headers(source)).to.have.length(2);
    expect(original.textContent).to.contain('Keep this panel content');
  });

  it('离开目标或断开源组件时取消待执行的悬停激活', async () => {
    const [tabs] = await setup();
    const transfer = start(panels(tabs)[0].querySelector('legend')!);
    drag(headers(tabs)[1], transfer, 'dragover');
    tabs.dispatchEvent(
      new DragEvent('dragleave', {relatedTarget: document.body})
    );
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(tabs.selectedIndex).to.equal(0);
    drag(headers(tabs)[1], transfer, 'dragover');
    tabs.remove();
    await new Promise((resolve) => setTimeout(resolve, 550));
    expect(tabs.selectedIndex).to.equal(0);
    expect(
      tabs.shadowRoot!.querySelector('[data-vsc-drop-indicator]')
    ).to.equal(null);
  });

  it('忽略外部拖拽和交互控件', async () => {
    const [tabs] = await setup();
    drag(headers(tabs)[1], new DataTransfer(), 'dragover');
    expect(
      tabs.shadowRoot!.querySelector('[data-vsc-drop-indicator]')
    ).to.equal(null);
    const button = document.createElement('button');
    headers(tabs)[0].append(button);
    drag(headers(tabs)[1], start(button));
    expect(headers(tabs)[0].textContent).to.equal('One');
  });

  it('嵌套表单 fieldset 不作为可拖拽侧栏视图', async () => {
    const [tabs] = await setup();
    const nested = document.createElement('fieldset');
    nested.innerHTML = '<legend>Nested form group</legend><input>';
    panels(tabs)[0].querySelector('fieldset')!.append(nested);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(nested.querySelector('legend')!.draggable).to.equal(false);
  });
});
