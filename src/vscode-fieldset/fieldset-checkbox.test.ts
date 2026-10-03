import {expect, fixture, html} from '../includes/testing.js';
import {emulateMedia} from '../includes/browser-commands.js';
import './index.js';
import type {FieldsetUncheckedMode} from './index.js';
import type {VscFieldsetCheckedChangeEvent, VscodeFieldset} from './index.js';
import type {VscodeCheckbox} from '../vscode-checkbox/index.js';

const checkboxOf = (el: VscodeFieldset) =>
  el.shadowRoot!.querySelector<VscodeCheckbox>('vscode-checkbox')!;
const fieldsetOf = (el: VscodeFieldset) => el.querySelector('fieldset')!;
const legendOf = (el: VscodeFieldset) => el.querySelector('legend')!;
const contentOf = (el: VscodeFieldset) => el.querySelector('label')!;

async function makeFieldset(options?: {
  checked?: boolean;
  mode?: FieldsetUncheckedMode;
  label?: string;
}) {
  const el = await fixture<VscodeFieldset>(html`
    <vscode-fieldset checkbox>
      <fieldset style="min-height: 0">
        <legend>Section</legend>
        <label>Value <input value="kept" /></label>
      </fieldset>
    </vscode-fieldset>
  `);

  if (options?.label !== undefined) {
    el.checkboxLabel = options.label;
  }
  if (options?.mode !== undefined) {
    el.uncheckedMode = options.mode;
  }
  el.checked = options?.checked ?? false;
  await el.updateComplete;
  return el;
}

/** 点击复选框 shadow root 中的标签。 */
function toggle(el: VscodeFieldset) {
  checkboxOf(el).shadowRoot!.querySelector<HTMLElement>('label')!.click();
}

/** 等待折叠或展开动画结束。 */
async function settle(el: VscodeFieldset) {
  await el.updateComplete;
  await Promise.all(
    el.getAnimations({subtree: true}).map((animation) => animation.finished)
  );
}

describe('fieldset 复选框', () => {
  it('在边框上放置带标签且与标题对齐的复选框', async () => {
    const el = await makeFieldset({label: 'Enable section'});
    const checkbox = checkboxOf(el);

    expect(checkbox.label).to.equal('Enable section');
    const checkboxRect = checkbox.getBoundingClientRect();
    const legendRect = legendOf(el).getBoundingClientRect();
    const hostRect = el.getBoundingClientRect();
    const fieldsetRect = fieldsetOf(el).getBoundingClientRect();

    expect(checkboxRect.top + checkboxRect.height / 2).to.be.closeTo(
      legendRect.top + legendRect.height / 2,
      1
    );
    expect(fieldsetRect.right - checkboxRect.right).to.be.closeTo(10, 1);
    expect(checkboxRect.right).to.be.lessThan(hostRect.right);
  });

  for (const size of ['small', 'medium', 'large'] as const) {
    it(`${size} 尺寸下标签与标题同字号且保持常规字重`, async () => {
      const el = await makeFieldset({checked: true, label: '启用分区'});
      el.size = size;
      el.style.setProperty('--vscode-font-weight', '700');
      await el.updateComplete;
      const checkbox = checkboxOf(el);
      await checkbox.updateComplete;
      const legend = legendOf(el);
      const label = checkbox.shadowRoot!.querySelector('.label-inner')!;
      const icon = checkbox.shadowRoot!.querySelector('.icon')!;
      const legendStyle = getComputedStyle(legend);
      const labelStyle = getComputedStyle(label);
      const legendRect = legend.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      expect(legendStyle.fontWeight).to.equal('700');
      expect(labelStyle.fontSize).to.equal(legendStyle.fontSize);
      expect(labelStyle.fontWeight).to.equal('400');
      expect(labelStyle.color).to.equal(legendStyle.color);
      expect(Number(labelStyle.opacity)).to.be.within(0.8, 0.95);
      expect(iconRect.top + iconRect.height / 2).to.be.closeTo(
        legendRect.top + legendRect.height / 2,
        1
      );
      expect(getComputedStyle(checkbox).backgroundColor).to.equal(
        getComputedStyle(fieldsetOf(el)).backgroundColor
      );
    });
  }

  it('标题字号和 fieldset 外边距变化后重新对齐', async () => {
    const el = await makeFieldset({checked: true, label: '启用分区'});
    const legend = legendOf(el);
    legend.style.cssText = 'font-size: 19px; line-height: 30px; padding: 8px';
    fieldsetOf(el).style.margin = '20px 24px';
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const checkbox = checkboxOf(el);
    const label = checkbox.shadowRoot!.querySelector('.label-inner')!;
    const checkboxRect = checkbox.getBoundingClientRect();
    const legendRect = legend.getBoundingClientRect();
    expect(getComputedStyle(label).fontSize).to.equal('19px');
    expect(checkboxRect.top + checkboxRect.height / 2).to.be.closeTo(
      legendRect.top + legendRect.height / 2,
      1
    );
    expect(
      fieldsetOf(el).getBoundingClientRect().right - checkboxRect.right
    ).to.be.closeTo(10, 1);
  });

  it('标签和边框遮挡背景跟随祖先主题变化', async () => {
    const parent = await fixture<HTMLDivElement>(html`
      <div
        style="--vscode-sideBar-background: white; --vscode-sideBarSectionHeader-foreground: black"
      >
        <vscode-fieldset checkbox checked checkbox-label="启用分区">
          <fieldset>
            <legend>分区</legend>
            <input />
          </fieldset>
        </vscode-fieldset>
      </div>
    `);
    const el = parent.querySelector('vscode-fieldset')!;
    await el.updateComplete;
    const checkbox = checkboxOf(el);
    await checkbox.updateComplete;
    const label = checkbox.shadowRoot!.querySelector('.label-inner')!;
    expect(getComputedStyle(label).color).to.equal('rgb(0, 0, 0)');
    parent.style.setProperty('--vscode-sideBar-background', 'black');
    parent.style.setProperty(
      '--vscode-sideBarSectionHeader-foreground',
      'white'
    );
    expect(getComputedStyle(label).color).to.equal('rgb(255, 255, 255)');
    expect(getComputedStyle(checkbox).backgroundColor).to.equal('rgb(0, 0, 0)');
  });

  it('默认模式禁用内容但保持可见', async () => {
    const el = await makeFieldset();
    const fieldset = fieldsetOf(el);
    const input = el.querySelector('input')!;

    expect(fieldset.disabled).to.equal(true);
    expect(input.matches(':disabled')).to.equal(true);
    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
  });

  it('折叠内容并在重新勾选后恢复', async () => {
    const el = await makeFieldset({checked: true, mode: 'collapsed'});
    const fieldset = fieldsetOf(el);
    const expanded = fieldset.getBoundingClientRect().height;

    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
    toggle(el);
    await settle(el);
    expect(el.checked).to.equal(false);
    expect(fieldset.disabled).to.equal(true);
    expect(getComputedStyle(contentOf(el)).display).to.equal('none');
    expect(getComputedStyle(legendOf(el)).display).to.equal('block');
    expect(fieldset.getBoundingClientRect().height).to.be.lessThan(expanded);

    toggle(el);
    await settle(el);
    expect(el.checked).to.equal(true);
    expect(fieldset.disabled).to.equal(false);
    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
    expect(fieldset.getBoundingClientRect().height).to.be.closeTo(expanded, 1);
  });

  it('minimal 模式仅保留复选框', async () => {
    const el = await makeFieldset({checked: true, mode: 'minimal'});
    const fieldset = fieldsetOf(el);
    const expanded = el.getBoundingClientRect().height;

    toggle(el);
    await settle(el);
    expect(getComputedStyle(fieldset).display).to.equal('none');
    expect(el.getBoundingClientRect().height).to.be.closeTo(26, 1);
    expect(checkboxOf(el).getBoundingClientRect().height).to.be.greaterThan(0);

    toggle(el);
    await settle(el);
    expect(getComputedStyle(fieldset).display).to.equal('block');
    expect(el.getBoundingClientRect().height).to.be.closeTo(expanded, 1);
  });

  it('为高度变化应用动画并遵循减少动态效果偏好', async () => {
    const el = await makeFieldset({checked: true, mode: 'collapsed'});
    const fieldset = fieldsetOf(el);

    toggle(el);
    await el.updateComplete;
    expect(fieldset.getAnimations().length).to.be.greaterThan(0);
    await settle(el);
    expect(fieldset.getAnimations().length).to.equal(0);
    expect(fieldset.style.height).to.equal('');

    try {
      await emulateMedia({reducedMotion: 'reduce'});
      toggle(el);
      await el.updateComplete;
      expect(fieldset.getAnimations().length).to.equal(0);
      expect(el.getAnimations().length).to.equal(0);
      expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
    } finally {
      await emulateMedia({reducedMotion: 'no-preference'});
    }
  });

  it('派发可取消事件并调用 checkedChange 回调', async () => {
    const el = await makeFieldset({checked: true});
    let detail: VscFieldsetCheckedChangeEvent['detail'] | undefined;
    let callbackValue: boolean | undefined;

    el.addEventListener('vsc-fieldset-checked-change', (event) => {
      detail = (event as VscFieldsetCheckedChangeEvent).detail;
    });
    el.checkedChange = (checked) => {
      callbackValue = checked;
    };
    toggle(el);
    await settle(el);
    expect(detail).to.deep.equal({checked: false});
    expect(callbackValue).to.equal(false);
    expect(el.checked).to.equal(false);
    expect(fieldsetOf(el).disabled).to.equal(true);
  });

  it('事件被取消或回调返回 false 时跳过默认行为', async () => {
    const el = await makeFieldset({checked: true, mode: 'collapsed'});
    const fieldset = fieldsetOf(el);

    el.addEventListener('vsc-fieldset-checked-change', (event) =>
      event.preventDefault()
    );
    toggle(el);
    await settle(el);
    expect(el.checked).to.equal(false);
    expect(fieldset.disabled).to.equal(false);
    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');

    el.checked = true;
    await el.updateComplete;
    await settle(el);
    el.checkedChange = () => false;
    toggle(el);
    await settle(el);
    expect(el.checked).to.equal(false);
    expect(fieldset.disabled).to.equal(false);
    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
  });

  it('通过代码修改 checked 时应用默认行为', async () => {
    const el = await makeFieldset({checked: true, mode: 'collapsed'});
    const fieldset = fieldsetOf(el);

    el.checked = false;
    await el.updateComplete;
    await settle(el);
    expect(fieldset.disabled).to.equal(true);
    expect(getComputedStyle(contentOf(el)).display).to.equal('none');

    el.checked = true;
    await el.updateComplete;
    await settle(el);
    expect(fieldset.disabled).to.equal(false);
    expect(getComputedStyle(contentOf(el)).display).to.not.equal('none');
  });

  it('不带复选框时保留原生状态及调用方的禁用状态', async () => {
    const plain = await fixture<VscodeFieldset>(html`
      <vscode-fieldset>
        <fieldset>
          <legend>Plain</legend>
          <input />
        </fieldset>
      </vscode-fieldset>
    `);

    await plain.updateComplete;
    expect(plain.shadowRoot!.querySelector('vscode-checkbox')).to.equal(null);
    expect(fieldsetOf(plain).disabled).to.equal(false);

    const disabled = await fixture<VscodeFieldset>(html`
      <vscode-fieldset checkbox checked>
        <fieldset disabled>
          <legend>Locked</legend>
          <input />
        </fieldset>
      </vscode-fieldset>
    `);

    await disabled.updateComplete;
    expect(fieldsetOf(disabled).disabled).to.equal(true);
    expect(checkboxOf(disabled).disabled).to.equal(true);
  });
});
