import {html, LitElement, PropertyValueMap, TemplateResult} from 'lit';
import {property, state, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement} from '../includes/VscElement.js';
import {FormButtonWidgetBase} from '../includes/form-button-widget/FormButtonWidgetBase.js';
import {LabelledCheckboxOrRadioMixin} from '../includes/form-button-widget/LabelledCheckboxOrRadio.js';
import {MarkableFormControl} from '../includes/form-control-dirty.styles.js';
import styles from './vscode-radio.styles.js';
import {AssociatedFormControl} from '../includes/AssociatedFormControl.js';

/**
 * 参与表单时支持 `:invalid` 伪类，其他情况下
 * 可通过 `invalid` 属性应用错误样式。
 *
 * @tag vscode-radio
 *
 * @attr name - 在表单容器数据中使用的变量名。
 * @attr label - 与 `label` 属性对应的 HTML 特性。
 *
 * @prop label - 标签文字，仅在组件 innerHTML 不包含文字时应用。
 *
 * @fires {Event} change - 选中状态变化时派发。
 * @fires {Event} invalid - 元素无效且调用 `checkValidity()` 或提交所在表单时派发。
 *
 * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/invalid_event)
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-settings-checkboxBackground=#313131]
 * @cssprop [--vscode-settings-checkboxBorder=#3c3c3c]
 * @cssprop [--vscode-settings-checkboxForeground=#cccccc]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-inputValidation-errorBackground=#5a1d1d]
 * @cssprop [--vscode-inputValidation-errorBorder=#be1100]
 */
@customElement('vscode-radio')
export class VscodeRadio
  extends LabelledCheckboxOrRadioMixin(FormButtonWidgetBase)
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

  //#region 属性

  /**
   * 组件所属表单是否已修改。状态由
   * `vscode-form-container` 管理，使用浅蓝色方框显示。
   */
  @property({type: Boolean, reflect: true})
  dirty = false;

  @property({type: Boolean, reflect: true})
  override autofocus = false;

  @property({type: Boolean, reflect: true})
  checked = false;

  @property({type: Boolean, reflect: true, attribute: 'default-checked'})
  defaultChecked = false;

  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * 在表单容器数据中使用的变量名。
   */
  @property({reflect: true})
  name = '';

  /** @internal */
  @property()
  type = 'radio';

  @property()
  value = '';

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  required = false;

  /** @internal */
  @property({type: Number, reflect: true})
  override tabIndex = 0;

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  get validity(): ValidityState {
    return this._internals.validity;
  }

  get validationMessage(): string {
    return this._internals.validationMessage;
  }

  get willValidate(): boolean {
    return this._internals.willValidate;
  }

  //#endregion

  //#region 私有变量

  @state()
  private _slottedText = '';

  @query('#input')
  private _inputEl!: HTMLInputElement;

  private _internals: ElementInternals;

  //#endregion

  //#region 生命周期方法

  constructor() {
    super();
    this._internals = this.attachInternals();

    this.addEventListener('keydown', this._handleKeyDown);
    this.addEventListener('click', this._handleClick);
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this._handleValueChange();
  }

  override update(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.update(changedProperties);

    if (changedProperties.has('checked')) {
      this._handleValueChange();
    }

    if (changedProperties.has('required')) {
      this._handleValueChange();
    }
  }

  //#endregion

  //#region 公共方法

  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  /** @internal */
  formResetCallback(): void {
    const radios = this._getRadios();

    radios.forEach((r) => {
      r.checked = r.defaultChecked;
    });

    this.updateComplete.then(() => {
      this._handleValueChange();
    });
  }

  /** @internal */
  formStateRestoreCallback(
    state: string,
    _mode: 'restore' | 'autocomplete'
  ): void {
    if (this.value === state && state !== '') {
      this.checked = true;
    }
  }

  /**
   * @internal
   */
  setComponentValidity(isValid: boolean) {
    if (isValid) {
      this._internals.setValidity({});
    } else {
      this._internals.setValidity(
        {
          valueMissing: true,
        },
        'Please select one of these options.',
        this._inputEl
      );
    }
  }

  //#endregion

  //#region 私有方法

  private _getRadios(): VscodeRadio[] {
    const root = this.getRootNode({composed: false}) as Document | ShadowRoot;

    if (!root) {
      return [];
    }

    const radios = root.querySelectorAll(
      `vscode-radio[name="${this.name}"]`
    ) as NodeListOf<VscodeRadio>;

    return Array.from(radios);
  }

  private _uncheckOthers(radios: VscodeRadio[]) {
    radios.forEach((r) => {
      if (r !== this) {
        r.checked = false;
      }
    });
  }

  private _checkButton() {
    const radios = this._getRadios();
    this.checked = true;

    radios.forEach((r) => {
      if (r !== this) {
        r.checked = false;
      }
    });
  }

  private _setGroupValidity(radios: VscodeRadio[], isValid: boolean) {
    this.updateComplete.then(() => {
      radios.forEach((r) => {
        r.setComponentValidity(isValid);
      });
    });
  }

  private _setActualFormValue() {
    let actualValue: string | null = '';

    if (this.checked) {
      actualValue = !this.value ? 'on' : this.value;
    } else {
      actualValue = null;
    }

    this._internals.setFormValue(actualValue);
  }

  //#endregion

  //#region 事件处理

  private _handleValueChange() {
    const radios = this._getRadios();
    const anyRequired = radios.some((r) => {
      return r.required;
    });

    this._setActualFormValue();

    if (this.checked) {
      this._uncheckOthers(radios);
      this._setGroupValidity(radios, true);
    } else {
      const anyChecked = !!radios.find((r) => r.checked);
      const isInvalid = anyRequired && !anyChecked;

      this._setGroupValidity(radios, !isInvalid);
    }
  }

  private _handleClick = (): void => {
    if (this.disabled) {
      return;
    }

    if (!this.checked) {
      this._checkButton();
      this._handleValueChange();
      this.dispatchEvent(new Event('change', {bubbles: true}));
    }
  };

  protected _handleKeyDown = (ev: KeyboardEvent): void => {
    if (!this.disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();

      if (ev.key === ' ' && !this.checked) {
        this.checked = true;
        this._handleValueChange();
        this.dispatchEvent(new Event('change', {bubbles: true}));
      }

      if (ev.key === 'Enter') {
        this._internals.form?.requestSubmit();
      }
    }
  };

  //#endregion

  override render(): TemplateResult {
    const iconClasses = classMap({
      icon: true,
      checked: this.checked,
    });
    const labelInnerClasses = classMap({
      'label-inner': true,
      'is-slot-empty': this._slottedText === '',
    });

    return html`
      <div class="wrapper">
        <input
          ?autofocus=${this.autofocus}
          id="input"
          class="radio"
          type="radio"
          name=${this.name}
          ?checked=${this.checked}
          value=${this.value}
          tabindex=${this.tabIndex}
        />
        <div class=${iconClasses}></div>
        <label for="input" class="label" @click=${this._handleClick}>
          <span class=${labelInnerClasses}>
            ${this._renderLabelAttribute()}
            <slot @slotchange=${this._handleSlotChange}></slot>
          </span>
        </label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-radio': VscodeRadio;
  }
}
