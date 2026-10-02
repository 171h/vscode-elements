import {expect, fixture, html} from '../includes/testing.js';
import './index.js';
import '../vscode-tabs/index.js';
import '../vscode-textfield/index.js';
import type {VscodeFieldset} from './index.js';
import type {VscodeTextfield} from '../vscode-textfield/index.js';

const settle = async (element: VscodeFieldset) => {
  await element.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 240));
};

function toggle(element: VscodeFieldset) {
  element
    .shadowRoot!.querySelector('vscode-checkbox')!
    .shadowRoot!.querySelector<HTMLElement>('label')!
    .click();
}

function move(view: VscodeFieldset, target: HTMLElement) {
  const transfer = new DataTransfer();
  view.querySelector('legend')!.dispatchEvent(
    new DragEvent('dragstart', {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer: transfer,
    })
  );
  const bounds = target.getBoundingClientRect();
  target.dispatchEvent(
    new DragEvent('drop', {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer: transfer,
      clientX: bounds.left + 10,
      clientY: bounds.top + 10,
    })
  );
}

describe('fieldset 自定义状态与嵌套禁用回归', () => {
  for (const method of ['事件取消', '回调取消']) {
    it(`${method}后跨面板拖拽保留内容状态，后续代码修改仍应用默认行为`, async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <vscode-tabs>
            <vscode-tab-header>来源</vscode-tab-header>
            <vscode-tab-panel>
              <vscode-fieldset checkbox checked unchecked-mode="collapsed">
                <fieldset>
                  <legend>自定义状态</legend>
                  <vscode-textfield value="保留"></vscode-textfield>
                </fieldset>
              </vscode-fieldset>
            </vscode-tab-panel>
          </vscode-tabs>
          <vscode-tabs>
            <vscode-tab-header>目标</vscode-tab-header>
            <vscode-tab-panel style="min-height: 80px"></vscode-tab-panel>
          </vscode-tabs>
        </div>
      `);
      const view = root.querySelector<VscodeFieldset>('vscode-fieldset')!;
      const control = view.querySelector<VscodeTextfield>('vscode-textfield')!;
      if (method === '事件取消') {
        view.addEventListener('vsc-fieldset-checked-change', (event) =>
          event.preventDefault()
        );
      } else {
        view.checkedChange = () => false;
      }
      toggle(view);
      await settle(view);
      expect(view.checked).to.equal(false);
      expect(view.fieldsetElement!.disabled).to.equal(false);
      const target = root.querySelectorAll<HTMLElement>('vscode-tab-panel')[1];
      move(view, target);
      await settle(view);
      expect(view.parentElement).to.equal(target);
      expect(view.fieldsetElement!.disabled).to.equal(false);
      expect(view.hasAttribute('data-vsc-collapsed')).to.equal(false);
      expect(control.disabled).to.equal(false);
      expect(control.value).to.equal('保留');
      view.checked = true;
      await settle(view);
      view.checked = false;
      await settle(view);
      expect(view.fieldsetElement!.disabled).to.equal(true);
      expect(view.hasAttribute('data-vsc-collapsed')).to.equal(true);
    });
  }

  for (const order of ['先启用外层', '先启用内层']) {
    it(`${order}时，所有层启用后才恢复控件的原有禁用状态`, async () => {
      const outer = await fixture<VscodeFieldset>(html`
        <vscode-fieldset checkbox>
          <fieldset>
            <legend>外层</legend>
            <vscode-fieldset checkbox checked>
              <fieldset>
                <legend>内层</legend>
                <vscode-textfield value="可编辑"></vscode-textfield>
                <vscode-textfield disabled value="保持禁用"></vscode-textfield>
              </fieldset>
            </vscode-fieldset>
          </fieldset>
        </vscode-fieldset>
      `);
      const inner = outer.querySelector<VscodeFieldset>('vscode-fieldset')!;
      const [editable, locked] =
        inner.querySelectorAll<VscodeTextfield>('vscode-textfield');
      await settle(outer);
      inner.checked = false;
      await settle(inner);
      const first = order === '先启用外层' ? outer : inner;
      const second = first === outer ? inner : outer;
      first.checked = true;
      await settle(first);
      expect(editable.disabled).to.equal(true);
      expect(editable.shadowRoot!.querySelector('input')!.disabled).to.equal(
        true
      );
      second.checked = true;
      await settle(second);
      expect(editable.disabled).to.equal(false);
      expect(editable.shadowRoot!.querySelector('input')!.disabled).to.equal(
        false
      );
      expect(locked.disabled).to.equal(true);
    });
  }
  it('内层视图移出禁用父级后，保留自己的禁用状态并可正常恢复', async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <vscode-fieldset checkbox>
          <fieldset>
            <legend>外层</legend>
            <vscode-fieldset checkbox>
              <fieldset>
                <legend>内层</legend>
                <vscode-textfield value="保留"></vscode-textfield>
              </fieldset>
            </vscode-fieldset>
          </fieldset>
        </vscode-fieldset>
      </div>
    `);
    const outer = root.querySelector<VscodeFieldset>('vscode-fieldset')!;
    const inner = outer.querySelector<VscodeFieldset>('vscode-fieldset')!;
    const control = inner.querySelector<VscodeTextfield>('vscode-textfield')!;
    await settle(outer);
    root.append(inner);
    await settle(inner);
    expect(control.disabled).to.equal(true);
    inner.checked = true;
    await settle(inner);
    expect(control.disabled).to.equal(false);
    expect(control.value).to.equal('保留');
    expect(outer.checked).to.equal(false);
  });
});
