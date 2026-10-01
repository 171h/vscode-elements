import {expect, fixture, html} from '@open-wc/testing';
import './vscode-tabs-group.js';
import '../vscode-tabs/index.js';
import '../vscode-fieldset/index.js';
import type {VscodeTabs} from '../vscode-tabs/index.js';
import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import type {
  VscTabsGroupLayoutChangeEvent,
  VscodeTabsGroup,
} from './vscode-tabs-group.js';

function tabsOf(group: VscodeTabsGroup): VscodeTabs[] {
  return Array.from(group.children).filter(
    (el): el is VscodeTabs => el.localName === 'vscode-tabs'
  ) as VscodeTabs[];
}

function bar(tabs: VscodeTabs): HTMLElement {
  return tabs.shadowRoot!.querySelector<HTMLElement>('.header')!;
}

function panelOf(tabs: VscodeTabs): HTMLElement {
  return tabs.querySelector('vscode-tab-panel')!;
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

function dragAt(el: Element, transfer: DataTransfer, type: string, y: number) {
  const rect = el.getBoundingClientRect();

  el.dispatchEvent(
    new DragEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer: transfer,
      clientX: rect.left + rect.width / 2,
      clientY: y,
    })
  );
}

function end() {
  document.dispatchEvent(new DragEvent('dragend'));
}

async function setup() {
  const root = await fixture<HTMLDivElement>(
    html` <div style="width: 640px">
      <vscode-tabs-group id="left">
        <vscode-tabs>
          <vscode-tab-header>One</vscode-tab-header>
          <vscode-tab-panel style="min-height: 120px">
            <vscode-fieldset
              ><fieldset>
                <legend>Files</legend>
                <input value="kept" /></fieldset
            ></vscode-fieldset>
          </vscode-tab-panel>
          <vscode-tab-header>Two</vscode-tab-header>
          <vscode-tab-panel style="min-height: 120px"></vscode-tab-panel>
        </vscode-tabs>
        <vscode-tabs>
          <vscode-tab-header>Other</vscode-tab-header>
          <vscode-tab-panel style="min-height: 120px"></vscode-tab-panel>
        </vscode-tabs>
      </vscode-tabs-group>
      <vscode-tabs-group id="right"></vscode-tabs-group>
    </div>`
  );

  await new Promise((resolve) => setTimeout(resolve, 30));
  return {
    left: root.querySelector<VscodeTabsGroup>('#left')!,
    right: root.querySelector<VscodeTabsGroup>('#right')!,
  };
}

describe('tabs group drag and drop', () => {
  afterEach(end);

  it('shows the empty hint until a tabs group is assigned', async () => {
    const {left, right} = await setup();
    const leftHint = left.shadowRoot!.querySelector<HTMLElement>('.empty')!;
    const rightHint = right.shadowRoot!.querySelector<HTMLElement>('.empty')!;

    expect(leftHint.hidden).to.equal(true);
    expect(rightHint.hidden).to.equal(false);
    expect(rightHint.textContent).to.contain('Drag a tabs group here');
  });

  it('reorders tabs groups when the tab strip background is dragged', async () => {
    const {left} = await setup();
    const [first, second] = tabsOf(left);
    const transfer = start(bar(first));
    const bounds = second.getBoundingClientRect();

    dragAt(left, transfer, 'dragover', bounds.bottom - 4);
    const placeholder = left.querySelector<HTMLElement>(
      '[data-vsc-group-placeholder]'
    )!;

    expect(placeholder).to.not.equal(null);
    expect(placeholder.textContent).to.contain('One');
    expect(placeholder.textContent).to.contain('Two');
    dragAt(left, transfer, 'drop', bounds.bottom - 4);
    expect(tabsOf(left)).to.deep.equal([second, first]);
    expect(left.querySelector('[data-vsc-group-placeholder]')).to.equal(null);
  });

  it('moves a tabs group into another container and emits layout details', async () => {
    const {left, right} = await setup();
    const [first] = tabsOf(left);
    let detail: VscTabsGroupLayoutChangeEvent['detail'] | undefined;

    right.addEventListener('vsc-tabs-group-layout-change', (event) => {
      detail = (event as VscTabsGroupLayoutChangeEvent).detail;
    });
    const transfer = start(bar(first));
    const bounds = right.getBoundingClientRect();

    dragAt(right, transfer, 'dragover', bounds.top + 4);
    expect(right.querySelector('[data-vsc-group-placeholder]')).to.not.equal(
      null
    );
    dragAt(right, transfer, 'drop', bounds.top + 4);
    expect(first.parentElement).to.equal(right);
    expect(tabsOf(left)).to.have.length(1);
    expect(detail?.source).to.equal(left);
    expect(detail?.destination).to.equal(right);
    expect(detail?.tabs).to.equal(first);
  });

  it('promotes a dragged tab to a new tabs group', async () => {
    const {left, right} = await setup();
    const source = tabsOf(left)[0];
    const header = source.querySelector<VscodeTabHeader>('vscode-tab-header')!;
    const transfer = start(header);
    const bounds = right.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    dragAt(right, transfer, 'dragover', y);
    const placeholder = right.querySelector<HTMLElement>(
      '[data-vsc-group-placeholder]'
    )!;

    expect(placeholder.textContent).to.contain('One');
    expect(placeholder.textContent).to.contain('New tabs group');
    dragAt(right, transfer, 'drop', y);
    const created = tabsOf(right);

    expect(created).to.have.length(1);
    expect(
      Array.from(created[0].children).map((el) => el.localName)
    ).to.deep.equal(['vscode-tab-header', 'vscode-tab-panel']);
    expect(created[0].textContent).to.contain('One');
    expect(tabsOf(left)).to.have.length(2);
    expect(tabsOf(left)[0].textContent).to.not.contain('One');
    expect(tabsOf(left)[0].textContent).to.contain('Two');
  });

  it('promotes a dragged view into a new group with a generated tab', async () => {
    const {left, right} = await setup();
    const source = tabsOf(left)[0];
    const view = source.querySelector('vscode-fieldset')!;
    const input = view.querySelector('input')!;

    input.value = 'edited';
    const transfer = start(view.querySelector('legend')!);
    const bounds = right.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    dragAt(right, transfer, 'dragover', y);
    expect(
      right.querySelector('[data-vsc-group-placeholder]')!.textContent
    ).to.contain('Files');
    dragAt(right, transfer, 'drop', y);
    const created = tabsOf(right)[0];

    expect(created.querySelector('vscode-tab-header')!.textContent).to.equal(
      'Files'
    );
    expect(created.querySelector('vscode-fieldset')).to.equal(view);
    expect(input.value).to.equal('edited');
  });

  it('clears the placeholder when the drag is cancelled', async () => {
    const {left} = await setup();
    const [first, second] = tabsOf(left);
    const transfer = start(bar(first));
    const bounds = second.getBoundingClientRect();

    dragAt(left, transfer, 'dragover', bounds.bottom - 4);
    expect(left.querySelector('[data-vsc-group-placeholder]')).to.not.equal(
      null
    );
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(left.querySelector('[data-vsc-group-placeholder]')).to.equal(null);
    expect(first.parentElement).to.equal(left);
  });

  it('defers to the tabs component while the pointer is over it', async () => {
    const {left} = await setup();
    const [source, target] = tabsOf(left);
    const view = source.querySelector('vscode-fieldset')!;
    const header = target.querySelector<VscodeTabHeader>('vscode-tab-header')!;
    const transfer = start(view.querySelector('legend')!);
    const bounds = header.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    dragAt(header, transfer, 'dragover', y);
    expect(left.querySelector('[data-vsc-group-placeholder]')).to.equal(null);
    dragAt(header, transfer, 'drop', y);
    expect(view.parentElement).to.equal(panelOf(target));
  });

  it('removes the source tabs group when its last tab is dragged out', async () => {
    const {left, right} = await setup();
    const source = tabsOf(left)[1];
    const header = source.querySelector<VscodeTabHeader>('vscode-tab-header')!;
    const transfer = start(header);
    const bounds = right.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    dragAt(right, transfer, 'dragover', y);
    dragAt(right, transfer, 'drop', y);
    expect(source.isConnected).to.equal(false);
    expect(tabsOf(left)).to.have.length(1);
    expect(tabsOf(right)).to.have.length(1);
  });

  it('removes a generated group after its last view is dragged back out', async () => {
    const {left, right} = await setup();
    const source = tabsOf(left)[0];
    const view = source.querySelector('vscode-fieldset')!;
    const sourcePanel = view.parentElement as HTMLElement;
    const transfer = start(view.querySelector('legend')!);
    const bounds = right.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    dragAt(right, transfer, 'dragover', y);
    dragAt(right, transfer, 'drop', y);
    const generated = tabsOf(right)[0];

    expect(generated).to.not.equal(undefined);
    expect(view.parentElement).to.not.equal(sourcePanel);
    // Move the view back into the panel it came from.
    const back = start(view.querySelector('legend')!);
    const panelBounds = sourcePanel.getBoundingClientRect();
    const panelY = panelBounds.top + panelBounds.height - 4;

    dragAt(sourcePanel, back, 'dragover', panelY);
    dragAt(sourcePanel, back, 'drop', panelY);
    expect(view.parentElement).to.equal(sourcePanel);
    expect(generated.isConnected).to.equal(false);
    expect(
      right.shadowRoot!.querySelector<HTMLElement>('.empty')!.hidden
    ).to.equal(false);
  });
});
