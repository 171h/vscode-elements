import {html, render, nothing, TemplateResult, PropertyValues} from 'lit';
import {property, query, queryAssignedElements, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';
import '../../vscode-button/index.js';
import '../../vscode-option/index.js';
import {VscodeOption} from '../../vscode-option/index.js';
import {stylePropertyMap} from '../style-property-map.js';
import {VscElement} from '../VscElement.js';
import {FormControlSize} from '../form-control-size.js';
import {filterOptionsByPattern, highlightRanges} from './helpers.js';
import type {InternalOption, Option, FilterMethod} from './types.js';
import {OptionListController} from './OptionListController.js';
import {checkIcon} from './template-elements.js';
import '../../vscode-scrollable/vscode-scrollable.js';

export const VISIBLE_OPTS = 10;
export const OPT_HEIGHT = 22;
export const OPT_HEIGHTS: Record<FormControlSize, number> = {
  small: 16,
  medium: OPT_HEIGHT,
  large: 28,
};

export class VscodeSelectBase extends VscElement {
  @property({type: Boolean, reflect: true})
  creatable = false;

  /**
   * 通过在文本输入框中输入内容过滤选项。
   */
  @property({type: Boolean, reflect: true})
  set combobox(enabled: boolean) {
    this._opts.comboboxMode = enabled;
  }
  get combobox() {
    return this._opts.comboboxMode;
  }

  /**
   * 供屏幕阅读器使用的无障碍标签。连接 `<vscode-label>`
   * 后自动填写。
   */
  @property({reflect: true})
  label = '';

  /**
   * 元素不可使用，也无法获得焦点。
   */
  @property({type: Boolean, reflect: true})
  set disabled(newState: boolean) {
    this._disabled = newState;
    this.ariaDisabled = newState ? 'true' : 'false';

    if (newState === true) {
      this._originalTabIndex = this.tabIndex;
      this.tabIndex = -1;
    } else {
      this.tabIndex = this._originalTabIndex ?? 0;
      this._originalTabIndex = undefined;
    }

    this.requestUpdate();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * 手动设置无效状态。
   */
  @property({type: Boolean, reflect: true})
  invalid = false;

  /**
   * 组件尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * 组合框模式中过滤列表的搜索方式。
   *
   * - contains - 列表项在任意位置包含搜索内容。
   * - fuzzy - 列表项按顺序包含搜索字符，但位置可以不连续。
   * - startsWith - 搜索内容匹配文本开头。
   * - startsWithPerTerm - 搜索内容匹配文本中任意单词的开头。
   *
   * @default 'fuzzy'
   */
  @property()
  set filter(val: 'contains' | 'fuzzy' | 'startsWith' | 'startsWithPerTerm') {
    const validValues: FilterMethod[] = [
      'contains',
      'fuzzy',
      'startsWith',
      'startsWithPerTerm',
    ];

    let fm: FilterMethod;

    if (validValues.includes(val as FilterMethod)) {
      fm = val;
    } else {
      this.warn(
        `Invalid filter: "${val}", fallback to default. Valid values are: "contains", "fuzzy", "startsWith", "startsWithPerm".`
      );
      fm = 'fuzzy';
    }

    this._opts.filterMethod = fm;
  }
  get filter(): 'contains' | 'fuzzy' | 'startsWith' | 'startsWithPerTerm' {
    return this._opts.filterMethod;
  }

  /**
   * 元素获得焦点时值为 true。
   */
  @property({type: Boolean, reflect: true})
  focused = false;

  /**
   * 切换下拉列表的可见状态。
   */
  @property({type: Boolean, reflect: true})
  open = false;

  /**
   * @attr [options=[]]
   * @type {Option[]}
   */
  @property({type: Array})
  set options(opts: Option[]) {
    this._opts.populate(opts);
  }
  get options(): Option[] {
    return this._opts.options.map(
      ({label, value, abbreviation, description, selected, disabled}) => ({
        label,
        value,
        abbreviation,
        description,
        selected,
        disabled,
      })
    );
  }

  /**
   * 选项列表展开时的位置。
   */
  @property({reflect: true})
  position: 'above' | 'below' = 'below';

  @queryAssignedElements({
    flatten: true,
    selector: 'vscode-option',
  })
  private _assignedOptions!: VscodeOption[];

  @query('.dropdown', true)
  private _dropdownEl!: HTMLDivElement;

  private _prevXPos = 0;
  private _prevYPos = 0;

  protected _opts = new OptionListController(this);

  //#region 生命周期回调

  constructor() {
    super();
    this.addEventListener('vsc-option-state-change', (ev) => {
      ev.stopPropagation();
      this._setStateFromSlottedElements();
      this.requestUpdate();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._onComponentKeyDown);
    this.addEventListener('focus', this._onComponentFocus);
    this.addEventListener('blur', this._onComponentBlur);
    this._setAutoFocus();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onComponentKeyDown);
    this.removeEventListener('focus', this._onComponentFocus);
    this.removeEventListener('blur', this._onComponentBlur);
  }

  protected _firstUpdateCompleted = false;

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    this._firstUpdateCompleted = true;
  }

  protected override willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('required') && this._firstUpdateCompleted) {
      this._manageRequired();
    }

    if (changedProperties.has('open') && this._firstUpdateCompleted) {
      if (this.open) {
        this._dropdownEl.showPopover();

        const {x, y} = this.getBoundingClientRect();
        this._prevXPos = x;
        this._prevYPos = y;

        window.addEventListener('scroll', this._handleWindowScroll, {
          capture: true,
        });

        this._opts.activateDefault();
        this._scrollActiveElementToTop();
      } else {
        this._dropdownEl.hidePopover();

        window.removeEventListener('scroll', this._handleWindowScroll);
      }
    }
  }

  //#endregion

  @state()
  protected _currentDescription = '';

  @state()
  protected _filter: FilterMethod = 'fuzzy';

  @state()
  protected get _filteredOptions(): InternalOption[] {
    if (!this.combobox || this._opts.filterPattern === '') {
      return this._options;
    }

    return filterOptionsByPattern(
      this._options,
      this._opts.filterPattern,
      this._filter
    );
  }

  @state()
  protected _selectedIndexes: number[] = [];

  @state()
  protected _options: InternalOption[] = [];

  @state()
  protected _value = '';

  @state()
  protected _values: string[] = [];

  @state()
  protected _isPlaceholderOptionActive = false;

  @state()
  protected _isBeingFiltered = false;

  @state()
  protected _optionListScrollPos = 0;

  private _isHoverForbidden = false;
  private _disabled = false;
  private _originalTabIndex: number | undefined = undefined;

  private _setAutoFocus() {
    if (this.hasAttribute('autofocus')) {
      if (this.tabIndex < 0) {
        this.tabIndex = 0;
      }

      if (this.combobox) {
        this.updateComplete.then(() => {
          this.shadowRoot
            ?.querySelector<HTMLInputElement>('.combobox-input')!
            .focus();
        });
      } else {
        this.updateComplete.then(() => {
          this.shadowRoot
            ?.querySelector<HTMLInputElement>('.select-face')!
            .focus();
        });
      }
    }
  }

  protected get _isSuggestedOptionVisible() {
    if (!(this.combobox && this.creatable)) {
      return false;
    }

    const filterPatternExistsAsOption =
      this._opts.getOptionByValue(this._opts.filterPattern) !== null;
    const filtered = this._opts.filterPattern.length > 0;
    return !filterPatternExistsAsOption && filtered;
  }

  protected _manageRequired() {}

  protected _setStateFromSlottedElements() {
    const optionElements = this._assignedOptions ?? [];
    this._opts.clear();

    optionElements.forEach((el) => {
      const {innerText, abbreviation, description, disabled} = el;
      const value = typeof el.value === 'string' ? el.value : innerText.trim();
      const selected = el.selected ?? false;
      const op: Option = {
        label: innerText.trim(),
        value,
        abbreviation,
        description,
        selected,
        disabled,
      };

      this._opts.add(op);
    });
  }

  protected _createSuggestedOption() {
    const nextSelectedIndex = this._opts.numOptions;
    const op = document.createElement('vscode-option');
    op.value = this._opts.filterPattern;
    render(this._opts.filterPattern, op);
    this.appendChild(op);

    return nextSelectedIndex;
  }

  /**
   * 事件会冒泡，因此父元素（例如 `vscode-form-container`）
   * 能够检测选择变化。
   */
  protected _dispatchChangeEvent(): void {
    this.dispatchEvent(new Event('change', {bubbles: true}));
    this.dispatchEvent(new Event('input', {bubbles: true}));
  }

  protected async _createAndSelectSuggestedOption() {}

  protected _toggleComboboxDropdown() {
    this._opts.filterPattern = '';
    this.open = !this.open;
  }

  protected _scrollActiveElementToTop() {
    this._optionListScrollPos = Math.floor(
      this._opts.relativeActiveIndex * OPT_HEIGHTS[this.size]
    );
  }

  private async _adjustOptionListScrollPos(
    direction: 'down' | 'up',
    optionIndex: number
  ) {
    let numOpts = this._opts.numOfVisibleOptions;
    const suggestedOptionVisible = this._isSuggestedOptionVisible;

    if (suggestedOptionVisible) {
      numOpts += 1;
    }

    if (numOpts <= VISIBLE_OPTS) {
      return;
    }

    this._isHoverForbidden = true;
    window.addEventListener('mousemove', this._onMouseMove);

    const ulScrollTop = this._optionListScrollPos;
    const optionHeight = OPT_HEIGHTS[this.size];
    const liPosY = optionIndex * optionHeight;

    const fullyVisible =
      liPosY >= ulScrollTop &&
      liPosY <= ulScrollTop + VISIBLE_OPTS * optionHeight - optionHeight;

    if (direction === 'down') {
      if (!fullyVisible) {
        this._optionListScrollPos =
          optionIndex * optionHeight - (VISIBLE_OPTS - 1) * optionHeight;
      }
    }

    if (direction === 'up') {
      if (!fullyVisible) {
        this._optionListScrollPos = Math.floor(
          this._opts.relativeActiveIndex * optionHeight
        );
      }
    }
  }

  //#region 事件处理
  protected _onFaceClick(): void {
    this.open = !this.open;
  }

  private _handleDropdownToggle(event: ToggleEvent) {
    this.open = event.newState === 'open';
  }

  private _onMouseMove = () => {
    this._isHoverForbidden = false;
    window.removeEventListener('mousemove', this._onMouseMove);
  };

  protected _onComboboxButtonClick(): void {
    this._toggleComboboxDropdown();
  }

  protected _onComboboxButtonKeyDown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter') {
      this._toggleComboboxDropdown();
    }
  }

  private _onOptionListScroll = (ev: CustomEvent<number>) => {
    this._optionListScrollPos = ev.detail;
  };

  protected _onOptionMouseOver(ev: MouseEvent): void {
    if (this._isHoverForbidden) {
      return;
    }

    const el = ev.target as HTMLElement;

    if (!el.matches('.option')) {
      return;
    }

    if (el.matches('.placeholder')) {
      this._isPlaceholderOptionActive = true;
      this._opts.activeIndex = -1;
    } else {
      this._isPlaceholderOptionActive = false;
      this._opts.activeIndex = +el.dataset.index!;
    }
  }

  protected _onPlaceholderOptionMouseOut() {
    this._isPlaceholderOptionActive = false;
  }

  protected _onNoOptionsClick(ev: MouseEvent) {
    ev.stopPropagation();
  }

  protected _onEnterKeyDown(ev: KeyboardEvent): void {
    this._isBeingFiltered = false;
    const clickedOnAcceptButton = ev?.composedPath
      ? ev
          .composedPath()
          .find((el) =>
            (el as HTMLElement).matches
              ? (el as HTMLElement).matches('vscode-button.button-accept')
              : false
          )
      : false;

    if (clickedOnAcceptButton) {
      return;
    }
  }

  private _onSpaceKeyDown() {
    if (!this.open) {
      this.open = true;
      return;
    }
  }

  protected _onArrowUpKeyDown(): void {
    if (this.open) {
      if (this._opts.activeIndex <= 0 && !(this.combobox && this.creatable)) {
        return;
      }

      if (this._isPlaceholderOptionActive) {
        const optionIndex = this._opts.numOfVisibleOptions - 1;
        this._opts.activeIndex = optionIndex;
        this._isPlaceholderOptionActive = false;
      } else {
        const prevOp = this._opts.prev();

        if (prevOp !== null) {
          this._opts.activeIndex = prevOp?.index ?? -1;
          const prevSelectableIndex = prevOp?.filteredIndex ?? -1;

          if (prevSelectableIndex > -1) {
            this._adjustOptionListScrollPos('up', prevSelectableIndex);
          }
        }
      }
    } else {
      this.open = true;
      this._opts.activateDefault();
    }
  }

  protected _onArrowDownKeyDown(): void {
    let numOpts = this._opts.numOfVisibleOptions;
    const suggestedOptionVisible = this._isSuggestedOptionVisible;

    if (suggestedOptionVisible) {
      numOpts += 1;
    }

    if (this.open) {
      if (this._isPlaceholderOptionActive && this._opts.activeIndex === -1) {
        return;
      }

      const nextOp = this._opts.next();

      if (suggestedOptionVisible && nextOp === null) {
        this._isPlaceholderOptionActive = true;
        this._adjustOptionListScrollPos('down', numOpts - 1);
        this._opts.activeIndex = -1;
      } else if (nextOp !== null) {
        const nextSelectableIndex = nextOp?.filteredIndex ?? -1;
        this._opts.activeIndex = nextOp?.index ?? -1;

        if (nextSelectableIndex > -1) {
          this._adjustOptionListScrollPos('down', nextSelectableIndex);
        }
      }
    } else {
      this.open = true;
      this._opts.activateDefault();
    }
  }

  private _onEscapeKeyDown() {
    this.open = false;
  }

  private _onComponentKeyDown = (event: KeyboardEvent) => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      this._onEnterKeyDown(event);
    }

    if (event.key === ' ') {
      this._onSpaceKeyDown();
    }

    if (event.key === 'Escape') {
      this._onEscapeKeyDown();
    }

    if (event.key === 'ArrowUp') {
      this._onArrowUpKeyDown();
    }

    if (event.key === 'ArrowDown') {
      this._onArrowDownKeyDown();
    }
  };

  private _onComponentFocus = () => {
    this.focused = true;
  };

  private _onComponentBlur = () => {
    this.focused = false;
  };

  protected _onSlotChange(): void {
    this._setStateFromSlottedElements();
    this.requestUpdate();
  }

  protected _onComboboxInputFocus(ev: FocusEvent): void {
    (ev.target as HTMLInputElement).select();
    this._isBeingFiltered = false;
    this._opts.filterPattern = '';
  }

  protected _onComboboxInputBlur() {
    this._isBeingFiltered = false;
  }

  /**
   * 过滤内容不是组件的值；内部输入框的事件
   * 不会离开 Shadow Root，因此组件上层的元素，
   * 例如 `vscode-form-container`，仅响应选择变化。
   * 组件自身的 `change` 和 `input` 事件
   * 在选择变化时由 {@link _dispatchChangeEvent} 派发。
   */
  protected _onComboboxInputInput(ev: InputEvent): void {
    ev.stopPropagation();
    this._isBeingFiltered = true;
    this._opts.filterPattern = (ev.target as HTMLInputElement).value;
    this._opts.activeIndex = -1;
    this.open = true;
  }

  protected _onComboboxInputClick(): void {
    this._isBeingFiltered = this._opts.filterPattern !== '';
    this.open = true;
  }

  protected _onComboboxInputSpaceKeyDown(ev: KeyboardEvent) {
    if (ev.key === ' ') {
      ev.stopPropagation();
    }
  }

  protected _onOptionClick(_ev: MouseEvent) {
    this._isBeingFiltered = false;
    return;
  }

  private _handleWindowScroll = () => {
    const {x, y} = this.getBoundingClientRect();

    if (x !== this._prevXPos || y !== this._prevYPos) {
      this.open = false;
    }
  };
  //#endregion

  //#region 渲染函数
  private _renderCheckbox(
    checked: boolean,
    label: string | TemplateResult | TemplateResult[]
  ) {
    const checkboxClasses = {
      'checkbox-icon': true,
      checked,
    };

    return html`<span class=${classMap(checkboxClasses)}>${checkIcon}</span
      ><span class="option-label">${label}</span>`;
  }

  protected _renderOptions(): TemplateResult | TemplateResult[] {
    const list = this._opts.options;

    return html`
      <ul
        aria-label=${ifDefined(this.label ?? undefined)}
        aria-multiselectable=${ifDefined(
          this._opts.multiSelect ? 'true' : undefined
        )}
        class="options"
        id="select-listbox"
        role="listbox"
        tabindex="-1"
        @click=${this._onOptionClick}
        @mouseover=${this._onOptionMouseOver}
      >
        ${repeat(
          list,
          (op) => op.index,
          (op, index) => {
            if (!op.visible) {
              return nothing;
            }

            const active = op.index === this._opts.activeIndex && !op.disabled;
            const selected = this._opts.getIsIndexSelected(op.index);

            const optionClasses = {
              active,
              disabled: op.disabled,
              option: true,
              'single-select': !this._opts.multiSelect,
              'multi-select': this._opts.multiSelect,
              selected,
            };

            const labelText =
              (op.ranges?.length ?? 0 > 0)
                ? highlightRanges(op.label, op.ranges ?? [])
                : op.label;

            return html`
              <li
                aria-selected=${selected ? 'true' : 'false'}
                class=${classMap(optionClasses)}
                data-index=${op.index}
                data-filtered-index=${index}
                id=${`op-${op.index}`}
                role="option"
                tabindex="-1"
              >
                ${when(
                  this._opts.multiSelect,
                  () => this._renderCheckbox(selected, labelText),
                  () => labelText
                )}
              </li>
            `;
          }
        )}
        ${this._renderPlaceholderOption(this._opts.numOfVisibleOptions < 1)}
      </ul>
    `;
  }

  protected _renderPlaceholderOption(isListEmpty: boolean) {
    if (!this.combobox) {
      return nothing;
    }

    const foundOption = this._opts.getOptionByLabel(this._opts.filterPattern);

    if (foundOption) {
      return nothing;
    }

    if (this.creatable && this._opts.filterPattern.length > 0) {
      return html`<li
        class=${classMap({
          option: true,
          placeholder: true,
          active: this._isPlaceholderOptionActive,
        })}
        @mouseout=${this._onPlaceholderOptionMouseOut}
      >
        Add "${this._opts.filterPattern}"
      </li>`;
    } else {
      return isListEmpty
        ? html`<li class="no-options" @click=${this._onNoOptionsClick}>
            No options
          </li>`
        : nothing;
    }
  }

  private _renderDescription() {
    const op = this._opts.getActiveOption();

    if (!op) {
      return nothing;
    }

    const {description} = op;

    return description
      ? html`<div class="description">${description}</div>`
      : nothing;
  }

  protected _renderSelectFace(): TemplateResult {
    return html`${nothing}`;
  }

  protected _renderComboboxFace(): TemplateResult {
    return html`${nothing}`;
  }

  protected _renderDropdownControls(): TemplateResult {
    return html`${nothing}`;
  }

  protected _renderDropdown() {
    const classes = {
      dropdown: true,
      multiple: this._opts.multiSelect,
      open: this.open,
    };

    const visibleOptions =
      this._isSuggestedOptionVisible || this._opts.numOfVisibleOptions === 0
        ? this._opts.numOfVisibleOptions + 1
        : this._opts.numOfVisibleOptions;
    const optionHeight = OPT_HEIGHTS[this.size];

    const scrollPaneHeight = Math.min(
      visibleOptions * optionHeight,
      VISIBLE_OPTS * optionHeight
    );

    const cr = this.getBoundingClientRect();

    const dropdownStyles: Partial<CSSStyleDeclaration> = {
      width: `${cr.width}px`,
      left: `${cr.left}px`,
      top: this.position === 'below' ? `${cr.top + cr.height}px` : 'unset',
      bottom:
        this.position === 'below'
          ? 'unset'
          : `${document.documentElement.clientHeight - cr.top}px`,
    };

    return html`
      <div
        class=${classMap(classes)}
        popover="auto"
        @toggle=${this._handleDropdownToggle}
        .style=${stylePropertyMap(dropdownStyles)}
      >
        ${this.position === 'above' ? this._renderDescription() : nothing}
        <vscode-scrollable
          always-visible
          class="scrollable"
          min-thumb-size="40"
          tabindex="-1"
          @vsc-scrollable-scroll=${this._onOptionListScroll}
          .scrollPos=${this._optionListScrollPos}
          .style=${stylePropertyMap({
            height: `${scrollPaneHeight}px`,
          })}
        >
          ${this._renderOptions()} ${this._renderDropdownControls()}
        </vscode-scrollable>
        ${this.position === 'below' ? this._renderDescription() : nothing}
      </div>
    `;
  }
  //#endregion
}
