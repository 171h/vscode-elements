import {html, LitElement, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
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
 * A simple inline textfield
 *
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * The `percentage` property turns the component into a percent field. The input displays the
 * percent sign, while the `value` property and the value submitted with the form use the fraction
 * form: entering `1` displays `1%` and reads back as `0.01`.
 *
 * @tag vscode-textfield
 *
 * @slot content-before - A slot before the editable area but inside of the component. It is used to place icons.
 * @slot content-after - A slot after the editable area but inside of the component. It is used to place icons.
 *
 * @fires {InputEvent} input
 * @fires {Event} change
 *
 * @cssprop [--vscode-settings-textInputBackground=#313131]
 * @cssprop [--vscode-settings-textInputBorder=var(--vscode-settings-textInputBackground, #313131)]
 * @cssprop [--vscode-settings-textInputForeground=#cccccc]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-font-family=sans-serif] - A sans-serif font type depends on the host OS.
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-inputValidation-errorBorder=#be1100]
 * @cssprop [--vscode-inputValidation-errorBackground=#5a1d1d]
 * @cssprop [--vscode-input-placeholderForeground=#989898]
 * @cssprop [--vscode-button-background=#0078d4]
 * @cssprop [--vscode-button-foreground=#ffffff]
 * @cssprop [--vscode-button-hoverBackground=#026ec1]
 * @cssprop [--vsc-form-control-font-size=var(--vscode-font-size, 13px)] - Font size of the input. It is set automatically by the `size` property.
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
   * Set error styles on the component. This is only intended to apply styles when custom error
   * validation is implemented. To check whether the component is valid, use the checkValidity method.
   */
  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * @internal
   * Set `aria-label` for the inner input element. Should not be set,
   * vscode-label will do it automatically.
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
   * Specifies a regular expression the form control's value should match.
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern)
   */
  @property()
  pattern: string | undefined = undefined;

  /**
   * Treats the value of the component as a percentage. The editable text is a percent number which
   * is displayed with a percent sign: entering `1` displays `1%`. The `value` property, the
   * submitted form value, and the `min`, `max`, and `step` constraints use the fraction form of
   * that number, so `1%` is `0.01`.
   *
   * The inner input is rendered as a text field in this mode, because a native number field does
   * not accept a percent sign.
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
   * The size of the textfield. The `medium` size is the default.
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  @property({type: Number})
  step: number | undefined = undefined;

  /**
   * Same as the `type` of the native `<input>` element but only a subset of types are supported.
   * The supported ones are: `color`,`date`,`datetime-local`,`email`,`file`,`month`,`number`,`password`,`search`,`tel`,`text`,`time`,`url`,`week`
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
   * Lowercase alias to minLength
   */
  set minlength(val: number) {
    this.minLength = val;
  }

  get minlength(): number | undefined {
    return this.minLength;
  }

  /**
   * Lowercase alias to maxLength
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
   * Check the component's validity state when built-in validation is used.
   * Built-in validation is triggered when any validation-related attribute is set. Validation-related
   * attributes are: `max, maxlength, min, minlength, pattern, required, step`.
   * See this [the MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity) for more details.
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
   * Whether the form of the component has been modified. The state is managed
   * by `vscode-form-container` and it is shown with a light blue background.
   */
  @property({type: Boolean, reflect: true})
  dirty = false;

  /**
   * The value of the component. In percentage mode it is the fraction form of
   * the percent number which is displayed in the input.
   */
  @state()
  private _value = '';

  /**
   * The text of the input without the percent sign. It can be an incomplete
   * percent number like `'-'` or `'1.'` while the user is typing.
   */
  @state()
  private _displayText = '';

  @state()
  private _type: InputType = 'text';

  private _percentage = false;

  /**
   * The caret position of the input which has to be restored after the masked
   * text is rendered, or null when the caret does not have to be restored.
   */
  private _caretBeforeUpdate: number | null = null;

  private _internals: ElementInternals;

  /**
   * In percentage mode the value is always a valid fraction or an empty string.
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
   * Applies the final form of the editable text: `'05'` becomes `'5%'` and
   * `'1.'` becomes `'1%'`.
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
   * Maps a caret position of the raw text to the position inside the masked
   * text. A caret after the percent sign is moved to the end of the number,
   * because everything which is typed there belongs to the end of the number.
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
   * The masked text is rendered into the input, which moves the caret to the
   * end of the text, so the position is saved before the update and restored
   * afterwards.
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
          .value=${this._displayValue}
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
