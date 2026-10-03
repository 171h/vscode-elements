import {html, LitElement, nothing, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {customElement} from '../includes/VscElement.js';
import {MarkableFormControl} from '../includes/form-control-dirty.styles.js';
import {chevronDownIcon} from '../includes/vscode-select/template-elements.js';
import {VscodeSelectBase} from '../includes/vscode-select/vscode-select-base.js';
import type {InternalOption} from '../includes/vscode-select/types.js';
import styles from './vscode-multi-select.styles.js';
import {AssociatedFormControl} from '../includes/AssociatedFormControl.js';

const SELECTED_LABELS_GAP_FALLBACK = 2;

/** 标签在空间适配时被截断后的最小宽度。 */
const MIN_TAG_WIDTH = 24;

/**
 * 标签测量精确到亚像素，但 `clientWidth` 四舍五入为整数。
 * 若不保留容差，原本可以容纳的标签，
 * 可能因为宽度总和略大于取整后的宽度而折叠；
 * 该行为取决于当前环境的字体度量。
 */
const FIT_TOLERANCE = 1;

export type VscMultiSelectCreateOptionEvent = CustomEvent<{value: string}>;

/**
 * 允许从选项列表中选择多个项目。
 *
 * 展示区域按选择顺序显示选中项标签。
 * 设置 `abbreviation` 的选项显示其缩写。
 * 标签无法全部放入时，溢出的标签折叠为 "+N" 徽章，
 * 完整选中项列表通过工具提示提供。
 *
 * 参与表单时支持 `:invalid` 伪类，其他情况下
 * 可通过 `invalid` 属性应用错误样式。
 *
 * @tag vscode-multi-select
 *
 * @prop {boolean} invalid
 * @attr {boolean} invalid
 * @attr name - 在表单容器数据中使用的变量名。
 *
 * @cssprop [--dropdown-z-index=2]
 * @cssprop [--vscode-badge-background=#616161]
 * @cssprop [--vscode-badge-foreground=#f8f8f8]
 * @cssprop [--vscode-settings-dropdownBorder=#3c3c3c]
 * @cssprop [--vscode-settings-checkboxBackground=#313131]
 * @cssprop [--vscode-settings-dropdownBackground=#313131]
 * @cssprop [--vscode-settings-dropdownForeground=#cccccc]
 * @cssprop [--vscode-settings-dropdownListBorder=#454545]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-foreground=#cccccc]
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-inputValidation-errorBackground=#5a1d1d]
 * @cssprop [--vscode-inputValidation-errorBorder=#be1100]
 * @cssprop [--vscode-list-activeSelectionBackground=#04395e]
 * @cssprop [--vscode-list-activeSelectionForeground=#ffffff]
 * @cssprop [--vscode-list-focusOutline=#0078d4]
 * @cssprop [--vscode-list-focusHighlightForeground=#2aaaff]
 * @cssprop [--vscode-list-highlightForeground=#2aaaff]
 * @cssprop [--vscode-list-hoverBackground=#2a2d2e]
 * @cssprop [--vscode-list-hoverForeground=#ffffff]
 */
@customElement('vscode-multi-select')
export class VscodeMultiSelect
  extends VscodeSelectBase
  implements AssociatedFormControl, MarkableFormControl
{
  static override styles = styles;

  /** @internal */
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static formAssociated = true;

  /**
   * 组件所属表单是否已修改。状态由
   * 由 `vscode-form-container` 管理，以浅蓝色背景显示。
   */
  @property({type: Boolean, reflect: true})
  dirty = false;

  @property({type: Array, attribute: 'default-value'})
  defaultValue: string[] = [];

  @property({type: Boolean, reflect: true})
  required = false;

  @property({reflect: true})
  name: string | undefined = undefined;

  @property({type: Array, attribute: false})
  set selectedIndexes(val: number[]) {
    this._opts.selectedIndexes = val;
    this._setFormValue();
    this._manageRequired();
  }
  get selectedIndexes(): number[] {
    return this._opts.selectedIndexes;
  }

  @property({type: Array})
  set value(val: string[]) {
    this._opts.multiSelectValue = val;

    if (this._opts.selectedIndexes.length > 0) {
      this._requestedValueToSetLater = [];
    } else {
      this._requestedValueToSetLater = Array.isArray(val) ? val : [val];
    }

    this._setFormValue();
    this._manageRequired();
  }
  get value(): string[] {
    return this._opts.multiSelectValue;
  }

  get form() {
    return this._internals.form;
  }

  /** @internal */
  get type() {
    return 'select-multiple';
  }

  get validity(): ValidityState {
    return this._internals.validity;
  }

  get validationMessage(): string {
    return this._internals.validationMessage;
  }

  get willValidate() {
    return this._internals.willValidate;
  }

  checkValidity(): boolean {
    return this._internals.checkValidity();
  }

  reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  selectAll() {
    this._opts.selectAll();
    this._setFormValue();
    this._manageRequired();
  }

  selectNone() {
    this._opts.selectNone();
    this._setFormValue();
    this._manageRequired();
  }

  private _internals: ElementInternals;

  constructor() {
    super();
    this._opts.multiSelect = true;
    this._internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.updateComplete.then(() => {
      this._setDefaultValue();
      this._manageRequired();
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._observedFaceValues = undefined;
  }

  protected override updated(): void {
    this._updateFaceValues();
    this._setFormValue();
    this._manageRequired();
  }

  /** @internal */
  formResetCallback(): void {
    this.updateComplete.then(() => {
      this.value = this.defaultValue;
    });
  }

  /** @internal */
  formStateRestoreCallback(
    state: FormData,
    _mode: 'restore' | 'autocomplete'
  ): void {
    const entries = Array.from(state.entries()).map((e) => String(e[1]));

    this.updateComplete.then(() => {
      this.value = entries;
    });
  }

  @query('.face')
  private _faceElement!: HTMLDivElement;

  @query('.face-values')
  private _faceValuesElement!: HTMLDivElement;

  /**
   * 能放入展示区域的选中标签数量。超过此数量的标签
   * 会折叠，并汇总为 "+N" 徽章。
   */
  @state()
  private _visibleTagCount = Number.POSITIVE_INFINITY;

  /**
   * 未能完整显示所有选中标签时为 true，此时
   * 鼠标悬停可通过工具提示查看完整列表。
   */
  @state()
  private _isFaceValuesTruncated = false;

  /**
   * 按尺寸和文字记录渲染后标签的宽度。折叠标签
   * 不参与布局，改用最后一次测量的宽度。
   */
  private _tagWidths = new Map<string, number>();

  private _resizeObserver: ResizeObserver | undefined;
  private _observedFaceValues: HTMLElement | undefined;

  private _setDefaultValue() {
    if (Array.isArray(this.defaultValue) && this.defaultValue.length > 0) {
      const val = this.defaultValue.map((v) => String(v));
      this.value = val;
    }
  }

  protected override _dispatchChangeEvent(): void {
    super._dispatchChangeEvent();
  }

  protected override _onFaceClick(): void {
    super._onFaceClick();
    this._opts.activeIndex = 0;
  }

  protected override _toggleComboboxDropdown(): void {
    super._toggleComboboxDropdown();
    this._opts.activeIndex = -1;
  }

  protected override _manageRequired() {
    const {value} = this;
    if (value.length === 0 && this.required) {
      this._internals.setValidity(
        {
          valueMissing: true,
        },
        'Please select an item in the list.',
        this._faceElement
      );
    } else {
      this._internals.setValidity({});
    }
  }

  private _setFormValue() {
    const fd = new FormData();

    this.value.forEach((v) => {
      fd.append(this.name ?? '', v);
    });

    this._internals.setFormValue(fd);
  }

  private _requestedValueToSetLater: string[] = [];

  protected override async _createAndSelectSuggestedOption() {
    super._createAndSelectSuggestedOption();
    const nextIndex = this._createSuggestedOption();

    await this.updateComplete;

    this.selectedIndexes = [...this.selectedIndexes, nextIndex];
    this._dispatchChangeEvent();
    const opCreateEvent: VscMultiSelectCreateOptionEvent = new CustomEvent(
      'vsc-multi-select-create-option',
      {detail: {value: this._opts.getOptionByIndex(nextIndex)?.value ?? ''}}
    );
    this.dispatchEvent(opCreateEvent);
    this.open = false;
    this._isPlaceholderOptionActive = false;
  }

  //#region 事件处理
  protected override _onSlotChange(): void {
    super._onSlotChange();

    if (this._requestedValueToSetLater.length > 0) {
      this._opts.expandMultiSelection(this._requestedValueToSetLater);
      this._requestedValueToSetLater = this._requestedValueToSetLater.filter(
        (v) => this._opts.findOptionIndex(v) === -1
      );
    }
  }

  protected override _onOptionClick = (ev: MouseEvent) => {
    const composedPath = ev.composedPath();
    const optEl = composedPath.find((et) => {
      if ('matches' in et) {
        return (et as HTMLElement).matches('li.option');
      }

      return false;
    });

    if (!optEl) {
      return;
    }

    const isPlaceholderOption = (optEl as HTMLElement).classList.contains(
      'placeholder'
    );

    if (isPlaceholderOption) {
      this._createAndSelectSuggestedOption();
      return;
    }

    const index = Number((optEl as HTMLElement).dataset.index);

    this._opts.toggleOptionSelected(index);

    this._setFormValue();
    this._manageRequired();
    this._dispatchChangeEvent();
  };

  protected override _onEnterKeyDown(ev: KeyboardEvent): void {
    super._onEnterKeyDown(ev);

    if (!this.open) {
      this._opts.filterPattern = '';
      this.open = true;
    } else {
      if (this._isPlaceholderOptionActive) {
        this._createAndSelectSuggestedOption();
      } else {
        this._opts.toggleActiveMultiselectOption();
        this._setFormValue();
        this._manageRequired();
        this._dispatchChangeEvent();
      }
    }
  }

  private _onMultiAcceptClick(): void {
    this.open = false;
  }

  private _onMultiDeselectAllClick(): void {
    this.selectNone();
    this._dispatchChangeEvent();
  }

  private _onMultiSelectAllClick(): void {
    this.selectAll();
    this._dispatchChangeEvent();
  }

  protected override _onComboboxInputBlur(): void {
    super._onComboboxInputBlur();
    this._opts.filterPattern = '';
  }
  //#endregion

  //#region 展示区域中的选中标签

  private _getSelectedOptions(): InternalOption[] {
    const options: InternalOption[] = [];

    this._opts.selectedIndexes.forEach((index) => {
      const op = this._opts.getOptionByIndex(index);

      if (op) {
        options.push(op);
      }
    });

    return options;
  }

  /** 选项带缩写时在展示区域显示缩写。 */
  private _getFaceLabel(op: InternalOption) {
    return op.abbreviation || op.label || op.value;
  }

  /** 选项列表与工具提示显示完整标签。 */
  private _getFullLabel(op: InternalOption) {
    return op.label || op.value;
  }

  private _getTagWidth(tag: HTMLElement) {
    const key = `${this.size}:${tag.textContent ?? ''}`;
    const measured = tag.getBoundingClientRect().width;

    if (measured > 0) {
      this._tagWidths.set(key, measured);

      return measured;
    }

    // 折叠标签不参与布局，使用折叠前
    // 测得的宽度。
    return this._tagWidths.get(key) ?? 0;
  }

  private _getTagGap(container: HTMLElement) {
    const gap = Number.parseFloat(getComputedStyle(container).columnGap);

    return Number.isFinite(gap) ? gap : SELECTED_LABELS_GAP_FALLBACK;
  }

  private _updateFaceValues(): void {
    const container = this._faceValuesElement;

    if (container !== this._observedFaceValues) {
      this._resizeObserver?.disconnect();
      this._observedFaceValues = container;

      if (container && typeof ResizeObserver !== 'undefined') {
        this._resizeObserver ??= new ResizeObserver(() => {
          this._fitSelectedLabels();
        });
        this._resizeObserver.observe(container);
      }
    }

    this._fitSelectedLabels();
  }

  /**
   * 选中标签按选择顺序排列在单行中。
   * 标签无法全部放入展示区域时，超出可用空间的标签
   * 会折叠并汇总为 "+N" 徽章。
   */
  private _fitSelectedLabels(): void {
    const container = this._faceValuesElement;

    if (!container) {
      this._visibleTagCount = Number.POSITIVE_INFINITY;
      this._isFaceValuesTruncated = false;

      return;
    }

    const tags = Array.from(
      container.querySelectorAll<HTMLElement>('.option-tag:not(.more-tag)')
    );

    if (tags.length === 0) {
      this._visibleTagCount = Number.POSITIVE_INFINITY;
      this._isFaceValuesTruncated = false;

      return;
    }

    const widths = tags.map((tag) => this._getTagWidth(tag));
    const gap = this._getTagGap(container);
    const available = container.clientWidth + FIT_TOLERANCE;

    // 即使所有标签可见也渲染 "+N" 徽章，
    // 以便在首次折叠标签前确定其宽度。
    const moreTag = container.querySelector<HTMLElement>('.more-tag');
    const moreTagWidth = moreTag ? this._getTagWidth(moreTag) : 0;

    let used = 0;
    let visibleCount = 0;

    for (const width of widths) {
      const nextUsed = used + (visibleCount > 0 ? gap : 0) + width;

      if (nextUsed > available) {
        break;
      }

      used = nextUsed;
      visibleCount += 1;
    }

    let hiddenCount = widths.length - visibleCount;

    if (hiddenCount > 0) {
      // "+N" 徽章同样占据空间
      while (visibleCount > 0 && used + gap + moreTagWidth > available) {
        visibleCount -= 1;
        hiddenCount += 1;
        used = visibleCount === 0 ? 0 : used - widths[visibleCount] - gap;
      }

      // 截断标签仍比完全不显示标签更有用。
      if (
        visibleCount === 0 &&
        available >= moreTagWidth + gap + MIN_TAG_WIDTH
      ) {
        visibleCount = 1;
      }
    }

    let truncated = hiddenCount > 0;

    if (!truncated) {
      truncated = tags.some((tag) => tag.scrollWidth > tag.clientWidth + 1);
    }

    this._visibleTagCount = visibleCount;
    this._isFaceValuesTruncated = truncated;
  }
  //#endregion

  //#region 渲染函数
  private _renderSelectedLabels() {
    const options = this._getSelectedOptions();
    const labels = options.map((op) => this._getFaceLabel(op));
    const visibleCount = Math.min(this._visibleTagCount, labels.length);
    const hiddenCount = labels.length - visibleCount;
    const moreTagClasses = {
      'option-tag': true,
      'more-tag': true,
      measuring: hiddenCount === 0,
    };
    const hasAbbreviation = options.some((op) => op.abbreviation !== '');
    // 工具提示显示折叠及缩写标签的完整文字，
    // 每行一个标签。
    const showFullLabels =
      labels.length > 0 && (this._isFaceValuesTruncated || hasAbbreviation);
    const tooltip = options
      .map((op) => this._getFullLabel(op).replace(/\s+/g, ' ').trim())
      .join('\n');

    return html`
      <div
        class="face-values"
        title=${ifDefined(showFullLabels ? tooltip : undefined)}
      >
        ${labels.map((label, index) => {
          const classes = {
            'option-tag': true,
            collapsed: index >= visibleCount,
            'option-tag-last': index === visibleCount - 1,
          };

          return html`<span class="select-face-badge ${classMap(classes)}"
            >${label}</span
          >`;
        })}
        ${labels.length > 0
          ? html`<span class="select-face-badge ${classMap(moreTagClasses)}"
              >+${hiddenCount > 0 ? hiddenCount : labels.length}</span
            >`
          : nothing}
      </div>
    `;
  }

  protected override _renderComboboxFace(): TemplateResult {
    const activeDescendant =
      this._opts.activeIndex > -1 ? `op-${this._opts.activeIndex}` : '';
    const expanded = this.open ? 'true' : 'false';

    return html`
      <div class="combobox-face face multiselect">
        ${this._renderSelectedLabels()}
        <input
          aria-activedescendant=${activeDescendant}
          aria-autocomplete="list"
          aria-controls="select-listbox"
          aria-expanded=${expanded}
          aria-haspopup="listbox"
          aria-label=${ifDefined(this.label)}
          class="combobox-input"
          role="combobox"
          spellcheck="false"
          type="text"
          autocomplete="off"
          .value=${this._opts.filterPattern}
          @focus=${this._onComboboxInputFocus}
          @blur=${this._onComboboxInputBlur}
          @input=${this._onComboboxInputInput}
          @click=${this._onComboboxInputClick}
          @keydown=${this._onComboboxInputSpaceKeyDown}
        />
        <button
          aria-label="Open the list of options"
          class="combobox-button"
          type="button"
          @click=${this._onComboboxButtonClick}
          @keydown=${this._onComboboxButtonKeyDown}
          tabindex="-1"
        >
          ${chevronDownIcon}
        </button>
      </div>
    `;
  }

  protected override _renderSelectFace(): TemplateResult {
    const activeDescendant =
      this._opts.activeIndex > -1 ? `op-${this._opts.activeIndex}` : '';
    const expanded = this.open ? 'true' : 'false';

    return html`
      <div
        aria-activedescendant=${ifDefined(
          this._opts.multiSelect ? undefined : activeDescendant
        )}
        aria-controls="select-listbox"
        aria-expanded=${ifDefined(
          this._opts.multiSelect ? undefined : expanded
        )}
        aria-haspopup="listbox"
        aria-label=${ifDefined(this.label ?? undefined)}
        class="select-face face multiselect"
        @click=${this._onFaceClick}
        .tabIndex=${this.disabled ? -1 : 0}
      >
        ${this._renderSelectedLabels()} ${chevronDownIcon}
      </div>
    `;
  }

  protected override _renderDropdownControls(): TemplateResult {
    return this._opts.numOfVisibleOptions > 0
      ? html`
          <div class="dropdown-controls">
            <button
              type="button"
              @click=${this._onMultiSelectAllClick}
              title="Select all"
              class="action-icon"
              id="select-all"
            >
              <vscode-icon name="checklist"></vscode-icon>
            </button>
            <button
              type="button"
              @click=${this._onMultiDeselectAllClick}
              title="Deselect all"
              class="action-icon"
              id="select-none"
            >
              <vscode-icon name="clear-all"></vscode-icon>
            </button>
            <vscode-button
              class="button-accept"
              @click=${this._onMultiAcceptClick}
              >OK</vscode-button
            >
          </div>
        `
      : html`${nothing}`;
  }

  override render(): TemplateResult {
    return html`
      <div class="multi-select">
        <slot class="main-slot" @slotchange=${this._onSlotChange}></slot>
        ${this.combobox ? this._renderComboboxFace() : this._renderSelectFace()}
        ${this._renderDropdown()}
      </div>
    `;
  }
  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-multi-select': VscodeMultiSelect;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-multi-select-create-option': VscMultiSelectCreateOptionEvent;
  }
}
