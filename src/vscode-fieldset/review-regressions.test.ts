import {expect, fixture, html} from '@open-wc/testing';
import {sendKeys} from '@web/test-runner-commands';
import './index.js';
import '../vscode-textfield/index.js';
import '../vscode-button/index.js';
import type {VscodeFieldset, FieldsetUncheckedMode} from './index.js';
import type {VscodeTextfield} from '../vscode-textfield/index.js';
import type {VscodeButton} from '../vscode-button/index.js';

async function settle(element: VscodeFieldset) {
  await element.updateComplete;
  await Promise.all(
    element
      .getAnimations({subtree: true})
      .map((animation) => animation.finished)
  );
}

describe('fieldset 审查问题回归', () => {
  it('未勾选时跳过自定义输入框，重新勾选后可用键盘编辑', async () => {
    const root = await fixture<HTMLDivElement>(html`
      <div>
        <button id="before">前一个控件</button>
        <vscode-fieldset checkbox checkbox-label="启用">
          <fieldset>
            <legend>设置</legend>
            <vscode-textfield value="原值"></vscode-textfield>
            <vscode-button disabled>保持禁用</vscode-button>
          </fieldset>
        </vscode-fieldset>
        <button id="after">后一个控件</button>
      </div>
    `);
    const fieldset = root.querySelector<VscodeFieldset>('vscode-fieldset')!;
    const textfield = root.querySelector<VscodeTextfield>('vscode-textfield')!;
    const button = root.querySelector<VscodeButton>('vscode-button')!;
    await settle(fieldset);
    expect(textfield.shadowRoot!.querySelector('input')!.disabled).to.equal(
      true
    );
    root.querySelector<HTMLButtonElement>('#before')!.focus();
    await sendKeys({press: 'Tab'});
    await sendKeys({press: 'Tab'});
    expect(document.activeElement).to.equal(root.querySelector('#after'));
    expect(textfield.value).to.equal('原值');

    fieldset.checked = true;
    await settle(fieldset);
    expect(textfield.disabled).to.equal(false);
    expect(button.disabled).to.equal(true);
    textfield.shadowRoot!.querySelector('input')!.focus();
    await sendKeys({type: '编辑'});
    expect(textfield.value).to.contain('编辑');

    fieldset.checked = false;
    await settle(fieldset);
    fieldset.checkbox = false;
    await settle(fieldset);
    expect(textfield.disabled).to.equal(false);
    expect(button.disabled).to.equal(true);
  });

  it('同步动态加入的控件，并在控件移出禁用区域后恢复状态', async () => {
    const fieldset = await fixture<VscodeFieldset>(html`
      <vscode-fieldset checkbox>
        <fieldset><legend>动态内容</legend></fieldset>
      </vscode-fieldset>
    `);
    const control = document.createElement('vscode-textfield');
    fieldset.fieldsetElement!.append(control);
    await settle(fieldset);
    expect(control.disabled).to.equal(true);
    control.remove();
    await settle(fieldset);
    expect(control.disabled).to.equal(false);
  });

  it('保留初始禁用的 fieldset 中自定义控件的禁用状态', async () => {
    const fieldset = await fixture<VscodeFieldset>(html`
      <vscode-fieldset checkbox checked>
        <fieldset disabled>
          <legend>锁定</legend>
          <vscode-textfield></vscode-textfield>
        </fieldset>
      </vscode-fieldset>
    `);
    await settle(fieldset);
    const control =
      fieldset.querySelector<VscodeTextfield>('vscode-textfield')!;
    expect(control.shadowRoot!.querySelector('input')!.disabled).to.equal(true);
  });

  it('不带 checkbox 时保留宿主及原生 fieldset 的内联布局样式', async () => {
    const fieldset = await fixture<VscodeFieldset>(html`
      <vscode-fieldset
        style="height: 200px !important; overflow: auto !important"
      >
        <fieldset style="height: 120px !important; overflow: auto !important">
          <legend>固定布局</legend>
          <input />
        </fieldset>
      </vscode-fieldset>
    `);
    await settle(fieldset);
    expect(fieldset.style.height).to.equal('200px');
    expect(fieldset.fieldsetElement!.style.height).to.equal('120px');
    for (const element of [fieldset, fieldset.fieldsetElement!]) {
      expect(element.style.overflow).to.equal('auto');
      expect(element.style.getPropertyPriority('height')).to.equal('important');
      expect(element.style.getPropertyPriority('overflow')).to.equal(
        'important'
      );
    }
  });

  for (const mode of ['collapsed', 'minimal'] as FieldsetUncheckedMode[]) {
    it(`${mode} 折叠、展开及中断动画后恢复布局样式与优先级`, async () => {
      const fieldset = await fixture<VscodeFieldset>(html`
        <vscode-fieldset
          checkbox
          checked
          unchecked-mode=${mode}
          style="height: 200px !important; overflow: auto !important"
        >
          <fieldset style="height: 120px !important; overflow: auto !important">
            <legend>动画布局</legend>
            <input />
          </fieldset>
        </vscode-fieldset>
      `);
      const verify = () => {
        expect(fieldset.style.height).to.equal('200px');
        expect(fieldset.fieldsetElement!.style.height).to.equal('120px');
        for (const element of [fieldset, fieldset.fieldsetElement!]) {
          expect(element.style.overflow).to.equal('auto');
          expect(element.style.getPropertyPriority('height')).to.equal(
            'important'
          );
          expect(element.style.getPropertyPriority('overflow')).to.equal(
            'important'
          );
        }
      };
      fieldset.checked = false;
      await settle(fieldset);
      verify();
      fieldset.checked = true;
      await settle(fieldset);
      verify();
      fieldset.checked = false;
      await fieldset.updateComplete;
      fieldset.checked = true;
      await settle(fieldset);
      verify();
    });
  }
});
