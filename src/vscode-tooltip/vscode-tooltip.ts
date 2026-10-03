import {html, PropertyValues, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-tooltip.styles.js';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
let nextId = 0;

/**
 * 鼠标悬停或键盘聚焦时显示活动栏风格的文字提示。
 *
 * @tag vscode-tooltip
 * @slot - 一个触发元素；键盘操作时该元素应能获得焦点。
 * @csspart tooltip - 提示面板，包含指向触发元素的小箭头。
 * @cssprop [--vscode-editorHoverWidget-background=#252526] - 提示背景色。
 * @cssprop [--vscode-editorHoverWidget-foreground=#cccccc] - 提示文字颜色。
 * @cssprop [--vscode-editorHoverWidget-border=#454545] - 提示及箭头边框颜色。
 * @cssprop [--vscode-widget-shadow=rgba(0,0,0,0.36)] - 提示阴影颜色。
 * @cssprop [--vscode-contrastBorder=transparent] - 高对比度边框颜色。
 * @cssprop [--vscode-font-family=sans-serif] - 提示字体。
 * @cssprop [--vsc-tooltip-min-width=0px] - 提示最小宽度。
 * @cssprop [--vsc-tooltip-max-width=320px] - 提示最大宽度。
 */
@customElement('vscode-tooltip')
export class VscodeTooltip extends VscElement {
  static override styles = styles;

  /** 提示文字，按纯文本渲染。 */
  @property() text = '';

  /** 提示相对触发元素的方向；活动栏通常使用 right。 */
  @property({reflect: true}) placement: TooltipPlacement = 'bottom';

  /** 外部触发元素的 id，与提示位于同一个 Document 或 ShadowRoot；无需包装触发元素。 */
  @property({reflect: true}) for = '';

  /** 外部触发元素引用，优先于 for 和默认插槽；元素需与提示处于同一根节点。 */
  @property({attribute: false}) target: HTMLElement | null = null;

  /** 持续显示提示，适用于字段说明与校验；Escape 可暂时关闭，重新设置时恢复。 */
  @property({type: Boolean, reflect: true}) open = false;

  /** 空间不足时依次尝试的方向；默认尝试首选方向的相反方向。 */
  @property({attribute: false}) fallbacks: readonly TooltipPlacement[] | null =
    null;

  /** 鼠标悬停后的显示延迟，单位为毫秒；键盘聚焦立即显示。 */
  @property({type: Number}) delay = 500;

  /** 禁用提示，不影响触发元素本身。 */
  @property({type: Boolean, reflect: true}) disabled = false;

  @state() private _open = false;
  @query('.tooltip') private _panel!: HTMLElement;
  @query('slot:not([name])') private _slot!: HTMLSlotElement;

  private _target?: HTMLElement;
  private _description = document.createElement('span');
  private _focusDescriptionTarget?: Element;
  private _focusDescriptionAttribute: string | null = null;
  private _focusDescriptionElements: readonly Element[] = [];
  private _timer?: ReturnType<typeof setTimeout>;
  private _hovered = false;
  private _focused = false;
  private _dismissed = false;
  private _anchorVisible = true;
  private _frame?: number;
  private _resize = new ResizeObserver(() => this._schedulePosition());
  private _intersection = new IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === this._target);
    if (entry) {
      this._anchorVisible = entry.isIntersecting;
      this._schedulePosition();
    }
  });
  private _mutation = new MutationObserver(() => {
    this._syncTarget();
    this._schedulePosition();
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this._description.id ||= `vscode-tooltip-${++nextId}`;
    this._description.slot = '_description';
    this._description.setAttribute('role', 'tooltip');
    this.append(this._description);
    void this.updateComplete.then(() => {
      if (this.isConnected) {
        this._syncTarget();
        this._observeRoot();
      }
    });
  }

  override disconnectedCallback(): void {
    this._close();
    this._unlinkTarget();
    this._hovered = this._focused = false;
    this._mutation.disconnect();
    super.disconnectedCallback();
  }

  private _unlinkTarget(): void {
    this._unlinkFocusedDescription();
    if (!this._target) {
      return;
    }
    this._target.removeEventListener('mouseenter', this._enter);
    this._target.removeEventListener('mouseleave', this._leave);
    this._target.removeEventListener('focusin', this._focusIn);
    this._target.removeEventListener('focusout', this._focusOut);
    const ids = (this._target.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== this._description.id);
    if (ids.length) {
      this._target.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this._target.removeAttribute('aria-describedby');
    }
    this._target = undefined;
  }

  private _syncTarget(): void {
    if (!this.isConnected || !this._slot) {
      return;
    }
    const root = this.getRootNode() as Document | ShadowRoot;
    const candidate =
      this.target ||
      (this.for
        ? root.getElementById(this.for)
        : this._slot.assignedElements()[0]);
    const target =
      candidate instanceof HTMLElement &&
      candidate.isConnected &&
      candidate.getRootNode() === root
        ? candidate
        : undefined;
    if (target === this._target) {
      return;
    }
    if (target !== this._target) {
      this._close();
      this._unlinkTarget();
      this._target = target;
      this._hovered = this._focused = false;
      this._anchorVisible = true;
      if (target) {
        target.addEventListener('mouseenter', this._enter);
        target.addEventListener('mouseleave', this._leave);
        target.addEventListener('focusin', this._focusIn);
        target.addEventListener('focusout', this._focusOut);
      }
      this.requestUpdate();
    }
    if (target) {
      const ids = new Set(
        (target.getAttribute('aria-describedby') || '')
          .split(/\s+/)
          .filter(Boolean)
      );
      ids.add(this._description.id);
      target.setAttribute('aria-describedby', [...ids].join(' '));
    }
  }

  private _observeRoot(): void {
    this._mutation.disconnect();
    const root = this.getRootNode();
    const options = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['inert', 'hidden', 'style', 'class', 'id'],
    };
    this._mutation.observe(root, options);
    if (root instanceof ShadowRoot) {
      this._mutation.observe(this.ownerDocument, options);
    }
  }

  private _unlinkFocusedDescription(): void {
    const element = this._focusDescriptionTarget;
    if (element) {
      const remaining = (element.ariaDescribedByElements || []).filter(
        (item) => item !== this._description
      );
      element.ariaDescribedByElements = remaining;
      if (
        this._focusDescriptionAttribute !== null &&
        remaining.length === this._focusDescriptionElements.length &&
        remaining.every(
          (item, index) => item === this._focusDescriptionElements[index]
        )
      ) {
        element.setAttribute(
          'aria-describedby',
          this._focusDescriptionAttribute
        );
      }
      this._focusDescriptionTarget = undefined;
    }
  }

  private _enter = (): void => {
    this._hovered = true;
    this._dismissed = false;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._show(), Math.max(0, this.delay));
  };

  private _panelEnter = (): void => {
    this._hovered = true;
    clearTimeout(this._timer);
  };

  private _leave = (): void => {
    this._hovered = false;
    clearTimeout(this._timer);
    // 保留跨越箭头间隙的时间，使鼠标能够移入提示面板。
    this._timer = setTimeout(() => {
      if (!this._focused && !this._hovered) {
        this._open = false;
      }
    }, 100);
  };

  private _focusIn = (event: FocusEvent): void => {
    this._unlinkFocusedDescription();
    const focused = event.composedPath()[0];
    // 内部 input 的焦点会重定向到 Web Component 宿主，使用元素引用跨越 Shadow DOM 描述它。
    if (
      focused instanceof Element &&
      focused !== this._target &&
      'ariaDescribedByElements' in focused
    ) {
      this._focusDescriptionAttribute =
        focused.getAttribute('aria-describedby');
      this._focusDescriptionElements = focused.ariaDescribedByElements || [];
      focused.ariaDescribedByElements = [
        ...(focused.ariaDescribedByElements || []),
        this._description,
      ];
      this._focusDescriptionTarget = focused;
    }
    this._focused = true;
    this._dismissed = false;
    clearTimeout(this._timer);
    this._show();
  };

  private _focusOut = (event: FocusEvent): void => {
    if (
      event.relatedTarget instanceof Node &&
      this._target?.contains(event.relatedTarget)
    ) {
      return;
    }
    this._focused = false;
    this._unlinkFocusedDescription();
    if (!this._hovered) {
      this._open = false;
    }
  };

  private _escape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      // 目标内部关闭提示时，不让同一次 Escape 继续关闭上层对话框。
      if (this._target && event.composedPath().includes(this._target)) {
        event.stopPropagation();
      }
      this._dismissed = true;
      this._close();
      this.requestUpdate();
    }
  };

  private _show(): void {
    if (
      !this.disabled &&
      !this._dismissed &&
      this.text?.trim() &&
      this._target &&
      this.isConnected
    ) {
      this._open = true;
    }
  }

  private _close(): void {
    clearTimeout(this._timer);
    this._open = false;
    if (this._panel?.matches(':popover-open')) {
      this._panel.hidePopover();
    }
    this._resize.disconnect();
    this._intersection.disconnect();
    if (this._frame !== undefined) {
      cancelAnimationFrame(this._frame);
      this._frame = undefined;
    }
    window.removeEventListener('resize', this._schedulePosition);
    window.removeEventListener('scroll', this._schedulePosition, true);
    document.removeEventListener('keydown', this._escape, true);
  }

  private _schedulePosition = (): void => {
    if (this._panel?.matches(':popover-open') && this._frame === undefined) {
      this._frame = requestAnimationFrame(() => {
        this._frame = undefined;
        this._position();
      });
    }
  };

  private _position = (): void => {
    if (!this._panel?.matches(':popover-open') || !this._target) {
      return;
    }
    const anchor = this._target.getBoundingClientRect();
    const visible =
      this._anchorVisible &&
      this._target.isConnected &&
      this._target.getClientRects().length > 0 &&
      !this._isUnavailable(this._target) &&
      anchor.bottom > 0 &&
      anchor.top < innerHeight &&
      anchor.right > 0 &&
      anchor.left < innerWidth;
    this._panel.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) {
      return;
    }
    const panel = this._panel.getBoundingClientRect();
    const gap = 8;
    const positions = {
      top: {
        x: anchor.left + (anchor.width - panel.width) / 2,
        y: anchor.top - panel.height - gap,
      },
      bottom: {
        x: anchor.left + (anchor.width - panel.width) / 2,
        y: anchor.bottom + gap,
      },
      left: {
        x: anchor.left - panel.width - gap,
        y: anchor.top + (anchor.height - panel.height) / 2,
      },
      right: {
        x: anchor.right + gap,
        y: anchor.top + (anchor.height - panel.height) / 2,
      },
    };
    const preferred = this.placement in positions ? this.placement : 'bottom';
    const opposite: Record<TooltipPlacement, TooltipPlacement> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    const placement =
      [preferred, ...(this.fallbacks || [opposite[preferred]])].find((side) => {
        const point = positions[side];
        return (
          point &&
          (side === 'left' || side === 'right'
            ? point.x >= 8 && point.x + panel.width <= innerWidth - 8
            : point.y >= 8 && point.y + panel.height <= innerHeight - 8)
        );
      }) || preferred;
    let {x, y} = positions[placement];
    this._panel.dataset.placement = placement;
    // 回退后再限制在视口内，箭头继续指向锚点中心。
    x = Math.max(8, Math.min(x, window.innerWidth - panel.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - panel.height - 8));
    this._panel.style.left = `${x}px`;
    this._panel.style.top = `${y}px`;
    const vertical = placement === 'left' || placement === 'right';
    const arrow = vertical
      ? anchor.top + anchor.height / 2 - y
      : anchor.left + anchor.width / 2 - x;
    const extent = vertical ? panel.height : panel.width;
    this._panel.style.setProperty(
      '--arrow-offset',
      `${Math.max(8, Math.min(arrow, extent - 8))}px`
    );
  };

  private _isUnavailable(target: HTMLElement): boolean {
    let element: HTMLElement | null = target;
    while (element) {
      if (
        element.closest('[inert], [hidden]') ||
        getComputedStyle(element).visibility !== 'visible'
      ) {
        return true;
      }
      const root = element.getRootNode();
      element =
        root instanceof ShadowRoot && root.host instanceof HTMLElement
          ? root.host
          : null;
    }
    return false;
  }

  protected override updated(changes: PropertyValues): void {
    if (!this.isConnected) {
      return;
    }
    if (changes.has('for') || changes.has('target')) {
      this._mutation.disconnect();
      this._syncTarget();
      this._observeRoot();
    }
    if (changes.has('open')) {
      this._dismissed = false;
    }
    if (this._description.textContent !== (this.text || '')) {
      this._description.textContent = this.text || '';
    }
    if (
      this.disabled ||
      !this.text?.trim() ||
      !this._target ||
      this._dismissed
    ) {
      this._close();
      return;
    }
    if (this._open || this.open) {
      if (!this._panel.matches(':popover-open')) {
        this._panel.showPopover();
        this._resize.observe(this._target!);
        this._resize.observe(this._panel);
        this._intersection.observe(this._target!);
        window.addEventListener('resize', this._schedulePosition);
        window.addEventListener('scroll', this._schedulePosition, true);
        document.addEventListener('keydown', this._escape, true);
      }
      this._position();
    } else {
      this._close();
    }
  }

  override render(): TemplateResult {
    return html`
      <slot @slotchange=${this._syncTarget}></slot>
      <div
        class="tooltip"
        part="tooltip"
        popover="manual"
        data-placement=${this.placement}
        @mouseenter=${this._panelEnter}
        @mouseleave=${this._leave}
      >
        <slot name="_description"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-tooltip': VscodeTooltip;
  }
}
