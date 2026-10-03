import {html, LitElement, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {live} from 'lit/directives/live.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {FormControlSize} from '../includes/form-control-size.js';
import {MarkableFormControl} from '../includes/form-control-dirty.styles.js';
import styles from './vscode-textfield.styles.js';
import {AssociatedFormControl} from '../includes/AssociatedFormControl.js';
import {
  formatPercentDisplay,
  fractionToPercent,
  normalizePercentInput,
  percentToFraction,
  sanitizePercentInput,
  validatePercentValue,
} from './percentage.js';

type InputType =
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'month'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

/**
 * 简单的单行文本框
 *
 * 参与表单时支持 `:invalid` 伪类，其他情况下
 * 可通过 `invalid` 属性应用错误样式。
 *
 * `percentage` 属性将组件转换为百分比输入框。输入框显示
 * 百分号，`value` 属性与表单提交值使用小数形式：
 * 输入 `1` 显示 `1%`，读取值为 `0.01`。
 *
 * @tag vscode-textfield
 *
 * @slot content-before - 组件内部、可编辑区域前的插槽，用于放置图标。
 * @slot content-after - 组件内部、可编辑区域后的插槽，用于放置图标。
 *
 * @fires {InputEvent} input
 * @fires {Event} change
 *
 * @cssprop [--vscode-settings-textInputBackground=#313131]
 * @cssprop [--vscode-settings-textInputBorder=var(--vscode-settings-textInputBackground, #313131)]
 * @cssprop [--vscode-settings-textInputForeground=#cccccc]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-font-family=sans-serif] - 无衬线字体，具体字体取决于宿主操作系统。
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-inputValidation-errorBorder=#be1100]
 * @cssprop [--vscode-inputValidation-errorBackground=#5a1d1d]
 * @cssprop [--vscode-input-placeholderForeground=#989898]
 * @cssprop [--vscode-button-background=#0078d4]
 * @cssprop [--vscode-button-foreground=#ffffff]
 * @cssprop [--vscode-button-hoverBackground=#026ec1]
 * @cssprop [--vsc-form-control-font-size=var(--vscode-font-size, 13px)] - 输入框字号，由 `size` 属性自动设置。
 */
@customElement('vscode-textfield')
export class VscodeTextfield
  extends VscElement
  implements AssociatedFormControl, MarkableFormControl
{
  static override styles = styles;

  /** @internal */
  static formAssociated = true;

  /** @internal */
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property()
  autocomplete: 'on' | 'off' | undefined = undefined;

  @property({type: Boolean, reflect: true})
  override autofocus = false;

  @property({attribute: 'default-value'})
  defaultValue = '';

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  focused = false;

  /**
   * 为组件设置错误样式，仅用于实现自定义错误校验时的样式设置。
   * 检查组件是否有效时，应使用 checkValidity 方法。
   */
  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * @internal
   * 为内部 input 元素设置 `aria-label`。通常不应手动设置，
   * vscode-label 会自动处理。
   */
  @property({attribute: false})
  label = '';

  @property({type: Number})
  max: number | undefined = undefined;

  @property({type: Number})
  maxLength: number | undefined = undefined;

  @property({type: Number})
  min: number | undefined = undefined;

  @property({type: Number})
  minLength: number | undefined = undefined;

  @property({type: Boolean, reflect: true})
  multiple = false;

  @property({reflect: true})
  name: string | undefined = undefined;

  /**
   * 指定表单控件值必须匹配的正则表达式。
   * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern)
   */
  @property()
  pattern: string | undefined = undefined;

  /**
   * 将组件值视为百分比。可编辑文字为百分数，
   * 显示时附带百分号：输入 `1` 显示 `1%`。`value` 属性、
   * 表单提交值以及 `min`、`max`、`step` 约束均使用
   * 对应的小数形式，因此 `1%` 对应 `0.01`。
   *
   * 此模式将内部 input 渲染为文本框，
   * 因为原生数字输入框不接受百分号。
   */
  @property({type: Boolean, reflect: true})
  get percentage(): boolean {
    return this._percentage;
  }
  set percentage(val: boolean) {
    if (val === this._percentage) {
      return;
    }

    this._percentage = val;

    if (val) {
      const percentText = fractionToPercent(this._value);
      this._value = percentText === '' ? '' : percentToFraction(percentText);
      this._displayText = percentText;
    } else {
      this._displayText = this._value;
    }

    this._internals.setFormValue(this._value);
  }

  @property()
  placeholder: string | undefined = undefined;

  @property({type: Boolean, reflect: true})
  readonly = false;

  @property({type: Boolean, reflect: true})
  required = false;

  /**
   * 文本框尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  @property({type: Number})
  step: number | undefined = undefined;

  /**
   * 与原生 `<input>` 的 `type` 类似，但仅支持部分类型。
   * 支持：`color`、`date`、`datetime-local`、`email`、`file`、`month`、`number`、`password`、`search`、`tel`、`text`、`time`、`url`、`week`
   */
  @property({reflect: true})
  set type(val: InputType) {
    const validTypes: InputType[] = [
      'color',
      'date',
      'datetime-local',
      'email',
      'file',
      'month',
      'number',
      'password',
      'search',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ];

    this._type = (
      validTypes.includes(val as InputType) ? val : 'text'
    ) as InputType;
  }
  get type(): InputType {
    return this._type;
  }

  @property()
  set value(val: string) {
    if (this.type !== 'file') {
      this._value = this._normalizeValue(val);
      this._displayText = this.percentage
        ? fractionToPercent(this._value)
        : this._value;
      this._internals.setFormValue(this._value);
    }

    this.updateComplete.then(() => {
      this._setValidityFromInput();
    });
  }
  get value(): string {
    return this._value;
  }

  /**
   * minLength 的小写别名
   */
  set minlength(val: number) {
    this.minLength = val;
  }

  get minlength(): number | undefined {
    return this.minLength;
  }

  /**
   * maxLength 的小写别名
   */
  set maxlength(val: number) {
    this.maxLength = val;
  }

  get maxlength(): number | undefined {
    return this.maxLength;
  }

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  get validity(): ValidityState {
    return this._internals.validity;
  }

  get validationMessage() {
    return this._internals.validationMessage;
  }

  get willValidate() {
    return this._internals.willValidate;
  }

  /**
   * 使用内置校验时检查组件有效性。
   * 设置任何校验相关特性都会触发内置校验。
   * 相关特性为：`max, maxlength, min, minlength, pattern, required, step`。
   * 更多细节参见 [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity)。
   * @returns {boolean}
   */
  checkValidity(): boolean {
    this._setValidityFromInput();
    return this._internals.checkValidity();
  }

  reportValidity() {
    this._setValidityFromInput();
    return this._internals.reportValidity();
  }

  get wrappedElement(): HTMLInputElement {
    return this._inputEl;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.updateComplete.then(() => {
      this._inputEl.checkValidity();
      this._setValidityFromInput();
      this._internals.setFormValue(
        this.percentage ? this._value : this._inputEl.value
      );
    });
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback(name, old, value);

    const validationRelatedAttributes = [
      'max',
      'maxlength',
      'min',
      'minlength',
      'pattern',
      'required',
      'step',
    ];

    if (validationRelatedAttributes.includes(name)) {
      this.updateComplete.then(() => {
        this._setValidityFromInput();
      });
    }
  }

  /** @internal */
  formResetCallback(): void {
    this.value = this.defaultValue;
    this.requestUpdate();
  }

  /** @internal */
  formStateRestoreCallback(
    state: string,
    _mode: 'restore' | 'autocomplete'
  ): void {
    this.value = state;
  }

  @query('#input')
  private _inputEl!: HTMLInputElement;

  /**
   * 组件所属表单是否已修改。状态由
   * 由 `vscode-form-container` 管理，以浅蓝色背景显示。
   */
  @property({type: Boolean, reflect: true})
  dirty = false;

  /**
   * 组件值。百分比模式下为输入框中所显示百分数的
   * 小数形式。
   */
  @state()
  private _value = '';

  /**
   * 不含百分号的输入文字。输入过程中可为
   * `'-'` 或 `'1.'` 等不完整百分数。
   */
  @state()
  private _displayText = '';

  @state()
  private _type: InputType = 'text';

  private _percentage = false;

  /**
   * 遮罩文字渲染后需要恢复的光标位置；
   * 不需要恢复时为 null。
   */
  private _caretBeforeUpdate: number | null = null;

  private _internals: ElementInternals;

  /**
   * 百分比模式中的值始终为有效小数或空字符串。
   */
  private _normalizeValue(val: string): string {
    if (!this.percentage) {
      return val;
    }

    const percentText = fractionToPercent(val);

    return percentText === '' ? '' : percentToFraction(percentText);
  }

  private get _displayValue(): string {
    return this.percentage
      ? formatPercentDisplay(this._displayText)
      : this._displayText;
  }

  private _dataChanged() {
    if (this.percentage) {
      this._displayText = sanitizePercentInput(this._inputEl.value);
      this._value = percentToFraction(this._displayText);
      this._internals.setFormValue(this._value);
      return;
    }

    this._value = this._inputEl.value;
    this._displayText = this._value;

    if (this.type === 'file' && this._inputEl.files) {
      for (const f of this._inputEl.files) {
        this._internals.setFormValue(f);
      }
    } else {
      this._internals.setFormValue(this._inputEl.value);
    }
  }

  /**
   * 应用可编辑文字的最终形式：`'05'` 变为 `'5%'`，
   * `'1.'` 变为 `'1%'`。
   */
  private _commitPercentInput() {
    const text = normalizePercentInput(this._inputEl.value);
    const display = formatPercentDisplay(text);

    if (display !== this._inputEl.value) {
      this._inputEl.value = display;
    }

    this._displayText = text;
    this._value = percentToFraction(text);
    this._internals.setFormValue(this._value);
  }

  /**
   * 将原始文字中的光标位置映射到遮罩文字中。
   * 百分号后的光标移动至数字末尾，
   * 因为在此处输入的内容属于数字末尾。
   */
  private _caretFromRaw(raw: string, caret: number, sanitized: string): number {
    const percentIndex = raw.indexOf('%');

    if (percentIndex !== -1 && caret > percentIndex) {
      return sanitized.length;
    }

    return sanitizePercentInput(raw.slice(0, caret)).length;
  }

  private _setCaret(position: number) {
    if (!this.percentage || !this._inputEl) {
      return;
    }

    const caret = Math.min(Math.max(position, 0), this._inputEl.value.length);

    this._inputEl.setSelectionRange(caret, caret);
  }

  private _onPercentInput() {
    const raw = this._inputEl.value;
    const caret = this._inputEl.selectionStart ?? raw.length;
    const sanitized = sanitizePercentInput(raw);
    const display = formatPercentDisplay(sanitized);

    this._dataChanged();

    if (display !== raw) {
      const position = this._caretFromRaw(raw, caret, sanitized);

      this._inputEl.value = display;
      this._setCaret(position);
    }
  }

  private _setValidityFromInput() {
    if (!this._inputEl) {
      return;
    }

    const validity = this._inputEl.validity;
    const flags: ValidityStateFlags = {
      badInput: validity.badInput,
      customError: validity.customError,
      patternMismatch: validity.patternMismatch,
      rangeOverflow: validity.rangeOverflow,
      rangeUnderflow: validity.rangeUnderflow,
      stepMismatch: validity.stepMismatch,
      tooLong: validity.tooLong,
      tooShort: validity.tooShort,
      typeMismatch: validity.typeMismatch,
      valueMissing: validity.valueMissing,
    };
    let message = this._inputEl.validationMessage;

    if (this.percentage) {
      const violation = validatePercentValue(this._value, {
        min: this.min,
        max: this.max,
        step: this.step,
      });

      if (violation) {
        flags[violation.flag] = true;
        message = violation.message;
      }
    }

    this._internals.setValidity(flags, message, this._inputEl);
  }

  private _onInput() {
    if (this.percentage) {
      this._onPercentInput();
    } else {
      this._dataChanged();
    }

    this._setValidityFromInput();
    // native input event dispatched automatically
  }

  private _onChange() {
    if (this.percentage) {
      this._commitPercentInput();
    } else {
      this._dataChanged();
    }

    this._setValidityFromInput();
    this.dispatchEvent(new Event('change'));
  }

  private _onFocus() {
    this.focused = true;
  }

  private _onBlur() {
    this.focused = false;
  }

  private _onKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && this._internals.form) {
      this._internals.form?.requestSubmit();
    }
  }

  /**
   * 遮罩文字渲染到输入框时会将光标移动到文字末尾，
   * 因此在更新前保存位置，
   * 更新后恢复。
   */
  protected override willUpdate(): void {
    if (!this.percentage || !this._inputEl) {
      return;
    }

    this._caretBeforeUpdate = this._inputEl.matches(':focus')
      ? this._inputEl.selectionStart
      : null;
  }

  override updated(): void {
    const caret = this._caretBeforeUpdate;

    this._caretBeforeUpdate = null;

    if (caret !== null) {
      this._setCaret(caret);
    }
  }

  override render(): TemplateResult {
    return html`
      <div class="root">
        <slot name="content-before"></slot>
        <input
          id="input"
          type=${this.percentage ? 'text' : this.type}
          inputmode=${ifDefined(this.percentage ? 'decimal' : undefined)}
          ?autofocus=${this.autofocus}
          autocomplete=${ifDefined(this.autocomplete)}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          max=${ifDefined(this.max)}
          maxlength=${ifDefined(this.maxLength)}
          min=${ifDefined(this.min)}
          minlength=${ifDefined(this.minLength)}
          ?multiple=${this.multiple}
          name=${ifDefined(this.name)}
          pattern=${ifDefined(this.pattern)}
          placeholder=${ifDefined(this.placeholder)}
          ?readonly=${this.readonly}
          ?required=${this.required}
          step=${ifDefined(this.step)}
          .value=${live(this._displayValue)}
          @blur=${this._onBlur}
          @change=${this._onChange}
          @focus=${this._onFocus}
          @input=${this._onInput}
          @keydown=${this._onKeyDown}
        />
        <slot name="content-after"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-textfield': VscodeTextfield;
  }
}
