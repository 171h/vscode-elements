import {html, PropertyValues, TemplateResult} from 'lit';
import {property, query, queryAssignedElements, state} from 'lit/decorators.js';
import {
  FOREVER,
  MarkDuration,
  toCssTime,
  toMilliseconds,
} from '../includes/form-mark-duration.js';
import {
  isMarkableFormControl,
  markFormControls,
  unmarkFormControls,
} from '../includes/form-control-dirty.styles.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {VscodeCheckboxGroup} from '../vscode-checkbox-group/index.js';
import {VscodeFormGroup, FormGroupVariant} from '../vscode-form-group/index.js';
import {VscodeRadioGroup} from '../vscode-radio-group/index.js';
import styles from './vscode-form-container.styles.js';

enum FormGroupLayout {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

type CheckboxOrRadioGroup = VscodeRadioGroup | VscodeCheckboxGroup;

/**
 * 表单已修改状态的高亮持续时间。数字按毫秒解析，
 * 字符串按 CSS 时间解析，例如 `2500` 或 `'2.5s'`。
 * `forever` 保持高亮，直到修改其他表单或调用
 * `reset()` 将其移除。
 */
export type FormMarkDuration = MarkDuration | typeof FOREVER;

/**
 * 自动标记在此时间内忽略新修改。同一按键触发的多个事件，
 * 以及连续快速按键，原本会在每次事件发生时
 * 重新开始倒计时；设置间隔后，
 * 每秒最多重新开始约两次。
 *
 * 当状态持续时间较短时，{@link VscodeFormContainer._automaticMarkDelay}
 * 会缩短此间隔，否则倒计时可能在新修改能够重启它之前
 * 就已过期，
 * 导致输入时状态闪烁。
 */
const RE_MARK_DELAY = 500;

/**
 * 无法表示为 CSS 时间的持续时间使用约一天的动画时长。
 * 这不是无限动画：从关键帧解析颜色，
 * 并将动画停留在峰值颜色，
 * 使 `forever` 状态保持可见，直到修改其他表单
 * 或调用 `reset()` 移除。
 */
const UNBOUNDED_DURATION = 86400000;

/**
 * 查询时单个 `vscode-form-container` 的状态。
 */
export interface FormState {
  /** 表单容器本身。 */
  element: VscodeFormContainer;
  /** 容器的 `id` 特性，未设置时为空字符串。 */
  id: string;
  /** 容器的 `name` 特性，未设置时为空字符串。 */
  name: string;
  /** 表单当前是否以已修改状态高亮。 */
  dirty: boolean;
  /** 表单标记为已修改时使用的持续时间。 */
  markDuration: FormMarkDuration;
}

/**
 * 表单已修改高亮开启或关闭时派发的
 * `vsc-dirty-change` 事件详情。
 */
export interface FormDirtyChangeDetail {
  form: VscodeFormContainer;
  dirty: boolean;
}

/** 按创建顺序保存所有已连接的表单容器。 */
const formMarkRegistry = new Set<VscodeFormContainer>();

const collectFormContainers = (
  root: Document | ShadowRoot | Element,
  result: Set<VscodeFormContainer> = new Set()
): Set<VscodeFormContainer> => {
  // 遍历从根节点下方开始，因此树遍历器
  // 不会返回根节点本身。
  if (root instanceof VscodeFormContainer) {
    result.add(root);
  }

  const treeWalker = document.createTreeWalker(
    root as Node,
    NodeFilter.SHOW_ELEMENT
  );

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode as Element;

    if (node instanceof VscodeFormContainer) {
      result.add(node);
    }

    if (node.shadowRoot) {
      collectFormContainers(node.shadowRoot, result);
    }
  }

  return result;
};

const isInRoot = (
  form: VscodeFormContainer,
  root: Document | ShadowRoot | Element
): boolean => {
  if (root instanceof Document) {
    return form.isConnected && form.getRootNode() === root;
  }

  return root.contains(form);
};

/**
 * @tag vscode-form-container
 *
 * 表单的已修改状态通过控件上的浅蓝色背景显示。
 * 颜色随 VS Code 主题类型变化：浅色主题静止颜色为 `#eff3ff`，
 * 深色及高对比度主题使用相同色相，
 * 并匹配各自表面的明度。
 * 显示错误的控件保留错误颜色，
 * 不在其上绘制已修改状态。
 *
 * @fires {CustomEvent<FormDirtyChangeDetail>} vsc-dirty-change - 表单已修改状态变化时派发；已修改表单仅重启倒计时时不派发。事件不冒泡，`detail` 包含 `form` 与新的 `dirty` 值。已修改表单移出 DOM 后状态变为 `false`，同样派发事件。
 * @cssprop [--vsc-form-control-dirty-background=#eff3ff] - 已修改表单控件的静止背景色
 * @cssprop [--vsc-form-control-dirty-background-peak=#dbe4ff] - 已修改表单控件在动画开始时的背景色
 * @cssprop [--vsc-form-control-dirty-border-color=#93a9f0] - 已修改表单控件的边框颜色
 * @cssprop [--vsc-form-control-dirty-ring-color=#6784de] - 已修改复选框和单选按钮的外环颜色
 * @cssprop [--vsc-form-control-dirty-duration=5000ms] - 已修改控件的动画时长，由容器的 `markDuration` 属性写入，因此容器祖先上的值不生效。状态倒计时也遵循 `markDuration`。
 */
@customElement('vscode-form-container')
export class VscodeFormContainer extends VscElement {
  static override styles = styles;

  /** 未设置 `mark-duration` 特性时的高亮持续时间。 */
  static defaultMarkDuration: FormMarkDuration = 5000;

  /**
   * 获取根节点内所有表单容器及当前已修改状态，包括
   * 嵌套表单；根节点本身为表单容器时也包含在结果中。
   * 传入 `Document` 时返回该文档中的表单，
   * 传入 Shadow Root 时返回其内部表单。
   *
   * 查询遍历整棵树并深入 Shadow Root，开销较大，
   * 不应在频繁执行的路径上调用。
   *
   * @param root 默认为整个文档。
   */
  static getFormStates(
    root: Document | ShadowRoot | Element = document
  ): FormState[] {
    return [...collectFormContainers(root)]
      .filter((form) => form.isConnected && isInRoot(form, root))
      .map((form) => ({
        element: form,
        id: form.id,
        name: form.getAttribute('name') ?? '',
        dirty: form.dirty,
        markDuration: form.markDuration,
      }));
  }

  @property({type: Boolean, reflect: true})
  set responsive(isResponsive: boolean) {
    this._responsive = isResponsive;

    if (this._firstUpdateComplete) {
      if (isResponsive) {
        this._activateResponsiveLayout();
      } else {
        this._deactivateResizeObserver();
      }
    }
  }
  get responsive(): boolean {
    return this._responsive;
  }

  @property({type: Number})
  breakpoint = 490;

  /**
   * 表单修改后的高亮持续时间。数字按毫秒解析，
   * 字符串按 CSS 时间解析（例如 `'2.5s'`）；
   * `forever` 禁用自动重置。负数按零解析。
   * 默认值为
   * `VscodeFormContainer.defaultMarkDuration`，即 5 秒。
   *
   * 空值（例如不带值的 `mark-duration` 特性）
   * 或移除该特性同样会恢复默认持续时间。
   */
  @property({
    attribute: 'mark-duration',
    converter: {
      fromAttribute: (value: string | null) =>
        value === null || value.trim() === ''
          ? VscodeFormContainer.defaultMarkDuration
          : value,
    },
  })
  markDuration: FormMarkDuration = VscodeFormContainer.defaultMarkDuration;

  /**
   * 属性为 `false` 时，不因用户交互自动标记表单，
   * 但仍可调用 `mark()` 标记。使用
   * `markable="false"` 特性关闭自动标记；状态
   * 不会写回 DOM，因此 `vscode-form-container[markable]`
   * 仅匹配显式带有此特性的容器。
   */
  @property({
    attribute: 'markable',
    converter: {
      fromAttribute: (value: string | null) => value !== 'false',
    },
  })
  markable = true;

  @state()
  private _dirty = false;

  private _resetTimer: ReturnType<typeof setTimeout> | null = null;

  private _lastMarkTime = -Infinity;

  /** 表单处于已修改状态时监听变化，使新增控件加入该状态。 */
  private _controlObserver: MutationObserver | null = null;

  private _firstUpdateComplete = false;

  private _resizeObserver!: ResizeObserver | null;

  @query('.wrapper')
  private _wrapperElement!: Element;

  @queryAssignedElements({selector: 'vscode-form-group'})
  private _assignedFormGroups!: VscodeFormGroup[];

  private _responsive = false;

  private _currentFormGroupLayout!: FormGroupLayout;

  /** 表单当前是否以已修改状态高亮。 */
  get dirty(): boolean {
    return this._dirty;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    formMarkRegistry.add(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    formMarkRegistry.delete(this);
    this._clearResetTimer();
    this._stopObservingControls();

    if (this._dirty) {
      this._dirty = false;
      unmarkFormControls(this);
      this._dispatchDirtyChange(false);
    }
  }

  override firstUpdated(): void {
    this._firstUpdateComplete = true;

    if (this._responsive) {
      this._activateResponsiveLayout();
    }

    // 状态可在元素渲染前设置。
    this._reflectDirty();
    this._reflectMarkDuration();
  }

  override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('_dirty')) {
      this._reflectDirty();
    }

    if (changedProperties.has('markDuration')) {
      this._reflectMarkDuration();
    }
  }

  /**
   * 以已修改状态高亮表单，并开始重置倒计时。
   * 同一根节点内的其他表单立即恢复正常状态。
   * 每次调用都会重启倒计时，
   * 自动标记的事件忽略间隔不适用于直接调用。
   *
   * 仅在表单之前尚未修改时派发 `vsc-dirty-change` 事件，
   * 因为重启倒计时不会改变状态。
   */
  mark(): void {
    const wasDirty = this._dirty;

    this._lastMarkTime = performance.now();
    this._clearResetTimer();
    this._dirty = true;
    this._unmarkOthers();
    this._reflectDirty();
    this._observeControls();
    this._scheduleResetTimer();

    if (wasDirty) {
      return;
    }

    this._dispatchDirtyChangeWhenUpdated(true);
  }

  /**
   * 立即移除已修改高亮，恢复正常状态。
   */
  reset(): void {
    this._clearResetTimer();
    this._stopObservingControls();
    this._lastMarkTime = -Infinity;

    if (!this._dirty) {
      return;
    }

    this._dirty = false;
    this._reflectDirty();
    this._dispatchDirtyChangeWhenUpdated(false);
  }

  /**
   * 已修改状态显示在表单控件上，
   * 容器本身保留自己的背景。
   */
  private _reflectDirty(): void {
    if (this._dirty) {
      markFormControls(this);
    } else {
      unmarkFormControls(this);
    }
  }

  /**
   * 表单已修改期间新增的控件也显示该状态。
   * 观察器仅在状态可见时运行。
   */
  private _observeControls(): void {
    if (this._controlObserver) {
      return;
    }

    this._controlObserver = new MutationObserver(() => {
      if (this._dirty) {
        markFormControls(this);
      }
    });

    this._controlObserver.observe(this, {childList: true, subtree: true});
  }

  private _stopObservingControls(): void {
    this._controlObserver?.disconnect();
    this._controlObserver = null;
  }

  /**
   * 已修改状态的动画时长与状态持续时间一致，
   * 使颜色逐渐变化，并体现倒计时结束。
   */
  private _reflectMarkDuration(): void {
    const cssTime = toCssTime(this.markDuration);

    this.style.setProperty(
      '--vsc-form-control-dirty-duration',
      cssTime ?? `${UNBOUNDED_DURATION}ms`
    );
  }

  private _dispatchDirtyChange(dirty: boolean): void {
    const detail: FormDirtyChangeDetail = {form: this, dirty};

    this.dispatchEvent(
      new CustomEvent<FormDirtyChangeDetail>('vsc-dirty-change', {
        detail,
        composed: true,
      })
    );
  }

  /**
   * 状态在下一次更新时反射到 DOM，
   * 因此事件也等待该更新完成。
   */
  private _dispatchDirtyChangeWhenUpdated(dirty: boolean): void {
    if (this._firstUpdateComplete) {
      this.requestUpdate();
      void this.updateComplete.then(() => this._dispatchDirtyChange(dirty));
    } else {
      this._dispatchDirtyChange(dirty);
    }
  }

  /**
   * 表单仅恢复同一根节点下的表单，
   * 不同文档和 Shadow Root 互不干扰。
   */
  private _unmarkOthers(): void {
    const root = this.getRootNode();

    for (const form of formMarkRegistry) {
      if (form !== this && form.dirty && form.getRootNode() === root) {
        form.reset();
      }
    }
  }

  private _scheduleResetTimer(): void {
    const milliseconds = toMilliseconds(this.markDuration);

    if (milliseconds === null) {
      return;
    }

    this._resetTimer = setTimeout(() => {
      this._resetTimer = null;
      this.reset();
    }, milliseconds);
  }

  private _clearResetTimer(): void {
    if (this._resetTimer === null) {
      return;
    }

    clearTimeout(this._resetTimer);
    this._resetTimer = null;
  }

  /**
   * 判断事件是否来自当前表单的控件。控件归属最近的表单容器，
   * 因此嵌套表单控件触发事件时，
   * 外层表单不会标记自身。
   */
  private _markableFormControl(ev: Event): boolean {
    if (!this.markable) {
      return false;
    }

    let controlWasFound = false;

    for (const node of ev.composedPath()) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      if (node.localName === 'vscode-form-container') {
        return node === this && controlWasFound;
      }

      if (isMarkableFormControl(node)) {
        controlWasFound = true;
      }
    }

    return false;
  }

  /**
   * 自动标记忽略新修改的间隔。
   *
   * 此间隔不超过状态持续时间的一半，
   * 用户持续修改表单时，倒计时会在过期前重启，
   * 因此短于 `RE_MARK_DELAY` 的持续时间
   * 不会使状态闪烁。永久状态使用标准间隔。
   */
  private _automaticMarkDelay(): number {
    const milliseconds = toMilliseconds(this.markDuration);

    return milliseconds === null
      ? RE_MARK_DELAY
      : Math.min(RE_MARK_DELAY, milliseconds / 2);
  }

  private _handleFormControlStateChange = (ev: Event): void => {
    if (!this._markableFormControl(ev)) {
      return;
    }

    // 同一次按键的多个事件和连续快速按键
    // 不会重启倒计时。
    if (
      this.dirty &&
      performance.now() - this._lastMarkTime < this._automaticMarkDelay()
    ) {
      return;
    }

    this.mark();
  };

  private _toggleCompactLayout(layout: FormGroupLayout) {
    this._assignedFormGroups.forEach((group) => {
      if (!group.dataset.originalVariant) {
        group.dataset.originalVariant = group.variant;
      }

      const oVariant = group.dataset.originalVariant as FormGroupVariant;

      if (layout === FormGroupLayout.VERTICAL && oVariant === 'horizontal') {
        group.variant = 'vertical';
      } else {
        group.variant = oVariant;
      }

      const checkboxOrRadioGroup = group.querySelectorAll(
        'vscode-checkbox-group, vscode-radio-group'
      ) as NodeListOf<CheckboxOrRadioGroup>;

      checkboxOrRadioGroup.forEach((widgetGroup) => {
        if (!widgetGroup.dataset.originalVariant) {
          widgetGroup.dataset.originalVariant = widgetGroup.variant;
        }

        const originalVariant = widgetGroup.dataset.originalVariant;

        if (
          layout === FormGroupLayout.HORIZONTAL &&
          originalVariant === FormGroupLayout.HORIZONTAL
        ) {
          widgetGroup.variant = 'horizontal';
        } else {
          widgetGroup.variant = 'vertical';
        }
      });
    });
  }

  private _resizeObserverCallback(entries: ResizeObserverEntry[]) {
    let wrapperWidth = 0;

    for (const entry of entries) {
      wrapperWidth = entry.contentRect.width;
    }

    const nextLayout: FormGroupLayout =
      wrapperWidth < this.breakpoint
        ? FormGroupLayout.VERTICAL
        : FormGroupLayout.HORIZONTAL;

    if (nextLayout !== this._currentFormGroupLayout) {
      this._toggleCompactLayout(nextLayout);
      this._currentFormGroupLayout = nextLayout;
    }
  }

  private _resizeObserverCallbackBound =
    this._resizeObserverCallback.bind(this);

  private _activateResponsiveLayout() {
    this._resizeObserver = new ResizeObserver(
      this._resizeObserverCallbackBound
    );
    this._resizeObserver.observe(this._wrapperElement);
  }

  private _deactivateResizeObserver() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  override render(): TemplateResult {
    return html`
      <div
        class="wrapper"
        @input=${this._handleFormControlStateChange}
        @change=${this._handleFormControlStateChange}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-form-container': VscodeFormContainer;
  }
}
