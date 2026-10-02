import {html, LitElement, nothing, TemplateResult} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement} from '../includes/VscElement.js';
import {FormButtonWidgetBase} from '../includes/form-button-widget/FormButtonWidgetBase.js';
import {LabelledCheckboxOrRadioMixin} from '../includes/form-button-widget/LabelledCheckboxOrRadio.js';
import {MarkableFormControl} from '../includes/form-control-dirty.styles.js';
import styles from './vscode-checkbox.styles.js';
import {AssociatedFormControl} from '../includes/AssociatedFormControl.js';

/**
 * 允许用户从一组选项中选择一个或多个选项。参与表单时支持
 * `:invalid` 伪类；其他情况下可通过 `invalid`
 * 属性应用错误样式。
 *
 * @tag vscode-checkbox
 *
 * @attr name - 在表单容器数据中使用的变量名。
 * @attr label - 与 `label` 属性对应的 HTML 特性。
 * @prop label - 标签文字，仅在组件 innerHTML 不包含文字时应用。
 *
 * @fires {Event} change - 选中状态变化时派发。事件会冒泡，可在 `CheckboxGroup` 等父元素上监听。
 * @fires {Event} invalid - 元素无效且调用 `checkValidity()` 或提交所在表单时派发。
 *
 * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/invalid_event)
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-foreground=#cccccc]
 * @cssprop [--vscode-settings-checkboxBackground=#313131]
 * @cssprop [--vscode-settings-checkboxBorder=#3c3c3c]
 * @cssprop [--vscode-settings-checkboxForeground=#cccccc]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-inputValidation-errorBackground=#5a1d1d]
 * @cssprop [--vscode-inputValidation-errorBorder=#be1100]
 */
@customElement('vscode-checkbox')
export class VscodeCheckbox
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

  /**
   * 组件所属表单是否已修改。状态由
   * `vscode-form-container` 管理，使用浅蓝色方框显示。
   */
  @property({type: Boolean, reflect: true})
  dirty = false;

  /**
   * 页面加载时自动聚焦元素。
   *
   * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus)
   */
  @property({type: Boolean, reflect: true})
  override autofocus = false;

  @property({type: Boolean, reflect: true})
  set checked(newVal: boolean) {
    this._checked = newVal;
    this._manageRequired();
    this.requestUpdate();
  }
  get checked(): boolean {
    return this._checked;
  }

  private _checked = false;

  /**
   * 元素的初始选中状态，所在表单重置时恢复此状态。
   */
  @property({type: Boolean, reflect: true, attribute: 'default-checked'})
  defaultChecked = false;

  @property({type: Boolean, reflect: true})
  invalid = false;

  @property({reflect: true})
  name: string | undefined = undefined;

  /**
   * 为 true 时渲染为切换开关，而非复选框。
   */
  @property({type: Boolean, reflect: true})
  toggle = false;

  /**
   * 为复选框关联一个值。根据原生复选框[规范](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value_2)，当组件参与表单时：
   *
   * - 未选中时不提交该值。
   * - 选中但未设置值时提交 `on`。
   * - 选中且设置了值时提交该值。
   */
  @property()
  value = '';

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  indeterminate = false;

  @property({type: Boolean, reflect: true})
  set required(newVal: boolean) {
    this._required = newVal;
    this._manageRequired();
    this.requestUpdate();
  }
  get required() {
    return this._required;
  }
  private _required = false;

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  /** @internal */
  @property()
  type = 'checkbox';

  get validity(): ValidityState {
    return this._internals.validity;
  }

  get validationMessage(): string {
    return this._internals.validationMessage;
  }

  get willValidate(): boolean {
    return this._internals.willValidate;
  }

  /**
   * 元素值有效时返回 `true`，否则返回 `false`。
   * 元素值无效时在元素上触发 invalid 事件。
   *
   * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity)
   */
  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  /**
   * 元素值有效时返回 `true`，否则返回 `false`。
   * 元素值无效时在元素上触发 invalid 事件，
   * 浏览器同时向用户显示错误消息。
   *
   * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/reportValidity)
   */
  reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('keydown', this._handleKeyDown);

    this.updateComplete.then(() => {
      this._manageRequired();
      this._setActualFormValue();
    });
  }

  override disconnectedCallback(): void {
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  /** @internal */
  formResetCallback(): void {
    this.checked = this.defaultChecked;
  }

  /** @internal */
  formStateRestoreCallback(
    state: string,
    _mode: 'restore' | 'autocomplete'
  ): void {
    if (state) {
      this.checked = true;
    }
  }

  @query('#input')
  private _inputEl!: HTMLInputElement;

  private _internals: ElementInternals;

  // 按照原生复选框行为设置控件值。
  // - 未选中时值为 null，因此该控件
  //   不参与表单提交。
  // - 选中但未设置值时，值为 "on"。
  // - 选中且已设置值时，保持原值。
  private _setActualFormValue() {
    let actualValue: string | null = '';

    if (this.checked) {
      actualValue = !this.value ? 'on' : this.value;
    } else {
      actualValue = null;
    }

    this._internals.setFormValue(actualValue);
  }

  private _toggleState() {
    this.checked = !this.checked;
    this.indeterminate = false;
    this._setActualFormValue();
    this._manageRequired();
    this.dispatchEvent(new Event('change', {bubbles: true}));
  }

  private _handleClick = (ev: MouseEvent): void => {
    ev.preventDefault();

    if (this.disabled) {
      return;
    }

    this._toggleState();
  };

  private _handleKeyDown = (ev: KeyboardEvent): void => {
    if (!this.disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();

      if (ev.key === ' ') {
        this._toggleState();
      }

      if (ev.key === 'Enter') {
        this._internals.form?.requestSubmit();
      }
    }
  };

  private _manageRequired() {
    if (!this.checked && this.required) {
      this._internals.setValidity(
        {
          valueMissing: true,
        },
        'Please check this box if you want to proceed.',
        this._inputEl ?? undefined
      );
    } else {
      this._internals.setValidity({});
    }
  }

  override render(): TemplateResult {
    const iconClasses = classMap({
      icon: true,
      checked: this.checked,
      indeterminate: this.indeterminate,
    });
    const labelInnerClasses = classMap({
      'label-inner': true,
    });

    const icon = html`<svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="check-icon"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
      />
    </svg>`;
    const check = this.checked && !this.indeterminate ? icon : nothing;
    const indeterminate = this.indeterminate
      ? html`<span class="indeterminate-icon"></span>`
      : nothing;

    const iconContent = this.toggle
      ? html`<span class="thumb"></span>`
      : html`${indeterminate}${check}`;

    return html`
      <div class="wrapper">
        <input
          ?autofocus=${this.autofocus}
          id="input"
          class="checkbox"
          type="checkbox"
          ?checked=${this.checked}
          role=${ifDefined(this.toggle ? 'switch' : undefined)}
          aria-checked=${ifDefined(
            this.toggle ? (this.checked ? 'true' : 'false') : undefined
          )}
          value=${this.value}
        />
        <div class=${iconClasses}>${iconContent}</div>
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
    'vscode-checkbox': VscodeCheckbox;
  }
}
