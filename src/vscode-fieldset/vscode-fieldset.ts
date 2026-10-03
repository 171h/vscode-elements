import {css, html, nothing, PropertyValues, TemplateResult} from 'lit';
import {property, query} from 'lit/decorators.js';
import {FormControlSize} from '../includes/form-control-size.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import defaultStyles from '../includes/default.styles.js';
import {installFieldsetStyles} from '../includes/fieldset.styles.js';
import '../vscode-checkbox/index.js';
import type {VscodeCheckbox} from '../vscode-checkbox/index.js';

/**
 * vscode-fieldset 的复选框未勾选时的内容展示方式。
 *
 * - visible：禁用内容，但保持可见。
 * - collapsed：隐藏内容，保留标题和边框。
 * - minimal：隐藏内容、标题和边框，仅保留复选框及其标签。
 */
export type FieldsetUncheckedMode = 'visible' | 'collapsed' | 'minimal';

export type VscFieldsetCheckedChangeEvent = CustomEvent<{checked: boolean}>;

/** 复选框切换时调用；返回 false 可跳过当前 unchecked-mode 的默认行为。 */
export type FieldsetCheckedChangeCallback = (
  checked: boolean
) => boolean | void;

const COLLAPSED_ATTR = 'data-vsc-collapsed';
const DURATION = 180;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

type DisabledControl = VscElement & {disabled: boolean};

// 多层 fieldset 共享原始状态，所有禁用来源解除后才恢复控件。
const disabledControlStates = new WeakMap<
  DisabledControl,
  {original: boolean; owners: Set<VscodeFieldset>}
>();

/**
 * 可移动的侧栏视图；在默认插槽中提供含 legend 的原生 fieldset。
 *
 * checkbox 属性在边框右上角显示与标题对齐的复选框。
 * 复选框控制内容的禁用状态，并根据 unchecked-mode 控制显示方式。
 * 高度变化带有动画；用户偏好减少动态效果时跳过动画。
 *
 * @tag vscode-fieldset
 *
 * @slot - 原生 fieldset、legend 及任意表单控件或内容。
 *
 * @fires {VscFieldsetCheckedChangeEvent} vsc-fieldset-checked-change - 复选框切换时派发的可取消事件；调用 preventDefault() 可跳过默认行为。
 *
 * @cssprop --vscode-sideBar-background
 * @cssprop --vscode-sideBar-foreground
 * @cssprop --vscode-sideBarSectionHeader-foreground
 * @cssprop --vscode-sideBarSectionHeader-border
 * @cssprop --vscode-contrastBorder
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-disabledForeground
 * @cssprop [--vsc-form-control-border-radius=4px] - 边框圆角；small 使用 1px，large 使用 6px。
 *
 * @csspart checkbox - 位于边框上的复选框容器。
 */
@customElement('vscode-fieldset')
export class VscodeFieldset extends VscElement {
  /** 与项目表单控件一致的尺寸。 */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * 在边框右上角显示复选框，控制内容启用状态及 unchecked-mode 行为。
   */
  @property({type: Boolean, reflect: true})
  checkbox = false;

  /**
   * 复选框标签，默认为空。
   */
  @property({attribute: 'checkbox-label'})
  checkboxLabel = '';

  /**
   * 复选框勾选状态；勾选时启用内容。
   */
  @property({type: Boolean, reflect: true})
  checked = false;

  /**
   * 未勾选时的内容展示方式；可选值见 FieldsetUncheckedMode。
   */
  @property({attribute: 'unchecked-mode', reflect: true})
  uncheckedMode: FieldsetUncheckedMode = 'visible';

  /**
   * 复选框切换时除事件外调用的可选回调。
   * 返回 false 可跳过默认行为；直接设置此属性，无对应 HTML 属性。
   */
  @property({attribute: false})
  checkedChange?: FieldsetCheckedChangeCallback = undefined;

  @query('vscode-checkbox')
  private _checkboxEl?: VscodeCheckbox;

  private _trackedFieldset?: HTMLFieldSetElement;

  private _initialDisabled: boolean | undefined;

  private _suppressDefault = false;

  private _defaultBehaviorSuppressed = false;

  private _rendered = false;

  private _animations: Animation[] = [];

  private _generation = 0;

  private _disabledControls = new Set<DisabledControl>();

  private _contentObserver = new MutationObserver((records) => {
    this._syncDisabledControls();
    if (records.some((record) => record.type === 'childList')) {
      this._observeLayout();
    }
    this._syncCheckboxLayout();
  });

  private _layoutObserver = new ResizeObserver(() => {
    this._syncCheckboxLayout();
  });

  private _animationStyles = new Map<
    HTMLElement,
    Map<string, {value: string; priority: string}>
  >();

  static override styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        min-width: 0;
        position: relative;
      }

      /* 零高度行使复选框覆盖边框，并与边框上的标题垂直居中对齐。 */
      .checkbox-row {
        --vsc-fieldset-title-foreground: var(
          --vscode-sideBarSectionHeader-foreground,
          var(
            --vscode-sideBarTitle-foreground,
            var(--vscode-foreground, CanvasText)
          )
        );
        display: flex;
        height: 0;
        justify-content: flex-end;
        position: relative;
        z-index: 1;
      }

      .checkbox-row[data-disabled-title] {
        --vsc-fieldset-title-foreground: var(
          --vscode-disabledForeground,
          GrayText
        );
      }

      .checkbox-row vscode-checkbox {
        --vscode-foreground: var(--vsc-fieldset-title-foreground);
        --vscode-font-weight: normal;
        background: var(
          --vscode-sideBar-background,
          var(--vscode-editor-background, Canvas)
        );
        padding: 0 4px;
        position: absolute;
        right: 10px;
        top: 13px;
        transform: translateY(-50%);
        white-space: nowrap;
      }

      :host([data-vsc-collapsed][unchecked-mode='minimal']) {
        min-height: 26px;
      }
    `,
  ];

  /** 默认插槽中的原生 fieldset。 */
  get fieldsetElement(): HTMLFieldSetElement | null {
    return this.querySelector('fieldset');
  }

  override connectedCallback() {
    super.connectedCallback();
    installFieldsetStyles(this);
    this._contentObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    if (this._rendered) {
      this._onSlotChange();
    }
  }

  override disconnectedCallback() {
    this._contentObserver.disconnect();
    this._layoutObserver.disconnect();
    for (const control of this._disabledControls) {
      this._releaseDisabledControl(control);
    }
    this._stopAnimation();
    this._clearAnimationStyles();
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues): void {
    if (
      !this._rendered ||
      changed.has('checked') ||
      changed.has('checkbox') ||
      changed.has('uncheckedMode')
    ) {
      const animate = this._rendered;

      this._rendered = true;
      if (this._suppressDefault) {
        this._suppressDefault = false;
      } else {
        this._defaultBehaviorSuppressed = false;
        this._syncCheckedState(animate);
      }
    } else {
      this._rendered = true;
    }
    this._observeLayout();
    this._syncCheckboxLayout();
  }

  private _observeLayout() {
    this._layoutObserver.disconnect();
    this._layoutObserver.observe(this);
    const fieldset = this.fieldsetElement;
    if (fieldset) {
      this._layoutObserver.observe(fieldset);
      const legend = fieldset.querySelector('legend');
      if (legend) {
        this._layoutObserver.observe(legend);
      }
    }
  }

  /** 根据实际标题同步边框上的复选框，兼容自定义字号和外边距。 */
  private _syncCheckboxLayout() {
    const checkbox = this._checkboxEl;
    const fieldset = this.fieldsetElement;
    const legend = fieldset?.querySelector('legend');
    if (!checkbox || !fieldset || !legend || !legend.getClientRects().length) {
      return;
    }
    const hostRect = this.getBoundingClientRect();
    const fieldsetRect = fieldset.getBoundingClientRect();
    const legendRect = legend.getBoundingClientRect();
    const legendStyle = getComputedStyle(legend);
    checkbox.style.top = `${legendRect.top + legendRect.height / 2 - hostRect.top}px`;
    checkbox.style.right = `${hostRect.right - fieldsetRect.right + 10}px`;
    checkbox.style.setProperty(
      '--vsc-form-control-font-size',
      legendStyle.fontSize
    );
    checkbox.parentElement?.toggleAttribute(
      'data-disabled-title',
      fieldset.disabled
    );
  }

  private _onSlotChange() {
    if (this._defaultBehaviorSuppressed) {
      this._syncDisabledControls();
    } else {
      this._syncCheckedState(false);
    }
    this._observeLayout();
    this._syncCheckboxLayout();
  }

  private _onCheckboxChange() {
    const checked = this._checkboxEl?.checked ?? false;
    const allowed = this.dispatchEvent(
      new CustomEvent('vsc-fieldset-checked-change', {
        detail: {checked},
        bubbles: true,
        composed: true,
        cancelable: true,
      }) as VscFieldsetCheckedChangeEvent
    );

    this._defaultBehaviorSuppressed =
      !allowed || this.checkedChange?.(checked) === false;
    this._suppressDefault = this._defaultBehaviorSuppressed;
    this.checked = checked;
  }

  private _uncheckedMode(): FieldsetUncheckedMode {
    return this.uncheckedMode === 'collapsed' ||
      this.uncheckedMode === 'minimal'
      ? this.uncheckedMode
      : 'visible';
  }

  private _syncCheckedState(animate: boolean) {
    const fieldset = this.fieldsetElement;

    if (!fieldset) {
      return;
    }
    if (fieldset !== this._trackedFieldset) {
      this._trackedFieldset = fieldset;
      this._initialDisabled = undefined;
    }
    if (this._initialDisabled === undefined) {
      this._initialDisabled = fieldset.disabled;
    }
    if (this._checkboxEl) {
      this._checkboxEl.disabled = this._initialDisabled;
    }
    if (!this.checkbox) {
      this._stopAnimation();
      this.removeAttribute(COLLAPSED_ATTR);
      this._clearAnimationStyles();
      fieldset.disabled = this._initialDisabled;
      this._syncDisabledControls();
      return;
    }
    fieldset.disabled = this._initialDisabled || !this.checked;
    this._syncDisabledControls();

    const mode = this._uncheckedMode();

    if (!this.checked && mode === 'minimal') {
      this._collapseMinimal(fieldset, animate);
    } else if (!this.checked && mode === 'collapsed') {
      this._collapseFieldset(fieldset, animate);
    } else {
      this._expand(fieldset, animate);
    }
  }

  /** 同步库控件的实际禁用状态，并保留其原有 disabled 值。 */
  private _syncDisabledControls() {
    const fieldset = this.fieldsetElement;
    const disabled = this.checkbox && !!fieldset?.disabled;

    for (const control of this._disabledControls) {
      if (!disabled || !fieldset?.contains(control)) {
        this._releaseDisabledControl(control);
      }
    }
    if (!disabled || !fieldset) {
      return;
    }
    for (const element of fieldset.querySelectorAll('*')) {
      if (
        !(element instanceof VscElement) ||
        !(element.constructor as {formAssociated?: boolean}).formAssociated ||
        !('disabled' in element) ||
        typeof element.disabled !== 'boolean' ||
        !element.matches(':disabled')
      ) {
        continue;
      }
      const control = element as DisabledControl;
      let state = disabledControlStates.get(control);
      if (!state) {
        state = {original: control.disabled, owners: new Set()};
        disabledControlStates.set(control, state);
      }
      state.owners.add(this);
      this._disabledControls.add(control);
      if (!control.disabled) {
        control.disabled = true;
      }
    }
  }

  /** 仅在最后一个禁用来源解除时恢复控件，避免嵌套组件相互覆盖。 */
  private _releaseDisabledControl(control: DisabledControl) {
    this._disabledControls.delete(control);
    const state = disabledControlStates.get(control);
    if (!state) {
      return;
    }
    state.owners.delete(this);
    if (state.owners.size === 0) {
      control.disabled = state.original;
      disabledControlStates.delete(control);
    }
  }

  /**
   * 将内容折叠至标题高度；动画裁剪内容，同时保留边框和标题的位置。
   */
  private _collapseFieldset(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const start = fieldset.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles();
    this.setAttribute(COLLAPSED_ATTR, '');
    const end = fieldset.getBoundingClientRect().height;

    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      this.setAttribute(COLLAPSED_ATTR, '');
      return;
    }
    const generation = this._generation;

    this._setAnimationStyles(fieldset, start);
    const animation = fieldset.animate(
      [{height: `${start}px`}, {height: `${end}px`}],
      {duration: DURATION, easing: 'ease', fill: 'forwards'}
    );

    this._finish(animation, generation, () => {
      this.setAttribute(COLLAPSED_ATTR, '');
      this._clearAnimationStyles();
    });
  }

  /**
   * minimal 模式仅保留复选框；对宿主高度和内容透明度应用动画，
   * 使标题消失、复选框移动至折叠后的位置。
   */
  private _collapseMinimal(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const start = this.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles();
    this.setAttribute(COLLAPSED_ATTR, '');
    const end = this.getBoundingClientRect().height;

    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      this.setAttribute(COLLAPSED_ATTR, '');
      return;
    }
    const generation = this._generation;
    const options: KeyframeAnimationOptions = {
      duration: DURATION,
      easing: 'ease',
      fill: 'forwards',
    };

    this._setAnimationStyles(this, start);
    this._finish(
      this.animate([{height: `${start}px`}, {height: `${end}px`}], options),
      generation,
      () => {
        this.setAttribute(COLLAPSED_ATTR, '');
        this._clearAnimationStyles();
      }
    );
    this._finish(
      fieldset.animate([{opacity: '1'}, {opacity: '0'}], options),
      generation
    );
  }

  /** 恢复内容，并以动画展开至完整高度。 */
  private _expand(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (!this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const minimal = this.uncheckedMode === 'minimal';
    const hostStart = this.getBoundingClientRect().height;
    const fieldsetStart = fieldset.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles();
    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      return;
    }
    const generation = this._generation;
    const options: KeyframeAnimationOptions = {
      duration: DURATION,
      easing: 'ease',
      fill: 'forwards',
    };

    if (minimal) {
      const end = this.getBoundingClientRect().height;

      this._setAnimationStyles(this, hostStart);
      this._finish(
        this.animate(
          [{height: `${hostStart}px`}, {height: `${end}px`}],
          options
        ),
        generation,
        () => this._clearAnimationStyles()
      );
      this._finish(
        fieldset.animate([{opacity: '0'}, {opacity: '1'}], options),
        generation
      );
    } else {
      const end = fieldset.getBoundingClientRect().height;

      this._setAnimationStyles(fieldset, fieldsetStart);
      this._finish(
        fieldset.animate(
          [{height: `${fieldsetStart}px`}, {height: `${end}px`}],
          options
        ),
        generation,
        () => this._clearAnimationStyles()
      );
    }
  }

  /** 同步动画列表与结束回调。 */
  private _finish(
    animation: Animation,
    generation: number,
    settle?: () => void
  ) {
    this._animations.push(animation);
    animation.finished
      .then(() => {
        animation.cancel();
        this._animations = this._animations.filter(
          (item) => item !== animation
        );
        if (this._generation !== generation) {
          return;
        }
        settle?.();
      })
      .catch(() => undefined);
  }

  private _stopAnimation() {
    this._generation += 1;
    this._animations.forEach((animation) => animation.cancel());
    this._animations = [];
  }

  /** 记录并覆盖动画所需的样式，结束时恢复调用方的值和优先级。 */
  private _setAnimationStyles(element: HTMLElement, height: number) {
    const saved = new Map<string, {value: string; priority: string}>();

    for (const property of ['height', 'overflow']) {
      saved.set(property, {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      });
    }
    this._animationStyles.set(element, saved);
    element.style.setProperty('height', height + 'px');
    element.style.setProperty('overflow', 'hidden');
  }

  private _clearAnimationStyles() {
    for (const [element, saved] of this._animationStyles) {
      for (const [property, {value, priority}] of saved) {
        if (value) {
          element.style.setProperty(property, value, priority);
        } else {
          element.style.removeProperty(property);
        }
      }
    }
    this._animationStyles.clear();
  }

  private _reducedMotion() {
    return matchMedia(REDUCED_MOTION).matches;
  }

  override render(): TemplateResult {
    return html`
      ${
        this.checkbox
          ? html`
              <div class="checkbox-row" part="checkbox">
                <vscode-checkbox
                  size=${this.size}
                  label=${this.checkboxLabel}
                  ?checked=${this.checked}
                  @change=${this._onCheckboxChange}
                ></vscode-checkbox>
              </div>
            `
          : nothing
      }
      <slot @slotchange=${this._onSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-fieldset': VscodeFieldset;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-fieldset-checked-change': VscFieldsetCheckedChangeEvent;
  }
}
