import {html, TemplateResult, PropertyValues} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {stylePropertyMap} from '../includes/style-property-map.js';
import uniqueId from '../includes/uniqueId.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import {VscodeTabPanel} from '../vscode-tab-panel/index.js';
import styles from './vscode-tabs.styles.js';
import '../vscode-context-menu/index.js';
import type {
  VscodeContextMenu,
  VscContextMenuSelectEvent,
} from '../vscode-context-menu/vscode-context-menu.js';
import {TabsDragController} from './drag-controller.js';

export type VscTabsSelectEvent = CustomEvent<{selectedIndex: number}>;
export type VscTabsLayoutChangeEvent = CustomEvent<{
  source: VscodeTabs;
  destination: VscodeTabs;
  views: HTMLElement[];
  header?: VscodeTabHeader;
}>;

/**
 * @tag vscode-tabs
 *
 * @slot - 默认插槽，用于标签页面板。
 * @slot header - 标签页标题插槽。
 * @slot addons - 标题中右对齐的区域。
 *
 * @fires {VscTabSelectEvent} vsc-tabs-select - 激活标签页变化时派发
 * @fires {VscTabsLayoutChangeEvent} vsc-tabs-layout-change - 移动标签页或视图后派发
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-settings-headerBorder=#2b2b2b]
 * @cssprop [--vscode-panel-background=#181818]
 */
@customElement('vscode-tabs')
export class VscodeTabs extends VscElement {
  static override styles = styles;
  /**
   * 面板风格的外观
   */
  @property({type: Boolean, reflect: true})
  panel = false;

  @property({type: Number, reflect: true, attribute: 'selected-index'})
  selectedIndex = 0;

  /** 标题溢出时的显示方式：换行、水平滚动或菜单。 */
  @property({reflect: true})
  overflow: 'wrap' | 'scroll' | 'menu' = 'wrap';

  /** 换行标题的对齐方式。 */
  @property({reflect: true, attribute: 'wrap-alignment'})
  wrapAlignment: 'start' | 'center' = 'start';

  private _dragController = new TabsDragController(this);

  @state()
  private _scrollWidth = 0;

  @state()
  private _scrollViewportWidth = 0;

  @state()
  private _scrollOffset = 0;

  @state()
  private _hiddenHeaders: VscodeTabHeader[] = [];

  @state()
  private _menuOpen = false;

  @state()
  private _menuLeft = 0;

  @state()
  private _menuTop = 0;

  private _contentObserver = new MutationObserver(() =>
    this._scheduleContentLayout()
  );

  private _scheduleContentLayout = () => {
    this.requestUpdate();
    this._scheduleLayout();
  };

  private _overflowInert = new WeakMap<VscodeTabHeader, boolean>();

  private _resizeObserver = new ResizeObserver(() => this._scheduleLayout());
  private _layoutFrame = 0;

  private _scheduleLayout = () => {
    if (!this.isConnected) {
      return;
    }
    cancelAnimationFrame(this._layoutFrame);
    this._layoutFrame = requestAnimationFrame(() => this._updateOverflow());
  };

  private _updateOverflow() {
    const list = this.shadowRoot?.querySelector<HTMLElement>('.tablist');
    if (!list) {
      return;
    }
    this._updateMenuOverflow(list);
    this._scrollWidth = this.overflow === 'scroll' ? list.scrollWidth : 0;
    this._scrollViewportWidth = list.clientWidth;
    this._scrollOffset = list.offsetLeft;
    this._syncScroll();
  }

  private _updateMenuOverflow(list: HTMLElement) {
    const button =
      this.shadowRoot!.querySelector<HTMLButtonElement>('.overflow-button')!;
    const headers = this._tabHeaders.filter((header) => !header.hidden);
    this._tabHeaders.forEach((header) =>
      header.removeAttribute('data-vsc-overflow-last')
    );
    const widths = headers.map((header) => {
      const style = getComputedStyle(header);
      return (
        header.getBoundingClientRect().width +
        (parseFloat(style.marginLeft) || 0) +
        (parseFloat(style.marginRight) || 0)
      );
    });
    const available =
      list.clientWidth + (button.hidden ? 0 : button.offsetWidth);
    let visible = [...headers];
    let promoted: VscodeTabHeader | undefined;
    if (
      this.overflow === 'menu' &&
      widths.reduce((sum, width) => sum + width, 0) > available
    ) {
      const budget = Math.max(0, available - 32);
      visible = [];
      let used = 0;
      for (let i = 0; i < headers.length; i++) {
        if (used + widths[i] > budget) {
          break;
        }
        visible.push(headers[i]);
        used += widths[i];
      }
      const selected = this._tabHeaders[this.selectedIndex];
      if (selected && !selected.hidden && !visible.includes(selected)) {
        const width = Math.min(widths[headers.indexOf(selected)], budget);
        while (visible.length && used + width > budget) {
          const removed = visible.pop()!;
          used -= widths[headers.indexOf(removed)];
        }
        visible.push(selected);
        promoted = selected;
      }
    }
    const hidden =
      this.overflow === 'menu'
        ? headers.filter((header) => !visible.includes(header))
        : [];
    this._tabHeaders.forEach((header) => {
      header.toggleAttribute(
        'data-vsc-overflow-hidden',
        hidden.includes(header)
      );
      header.toggleAttribute('data-vsc-overflow-last', header === promoted);
      this._setOverflowInert(header, hidden.includes(header));
    });
    if (
      hidden.length !== this._hiddenHeaders.length ||
      hidden.some((header, i) => header !== this._hiddenHeaders[i])
    ) {
      this._hiddenHeaders = hidden;
      if (!hidden.length) {
        this._closeMenu(false);
      }
    }
    if (this.overflow !== 'menu') {
      this._closeMenu(false);
    }
    this._revealHeader(this._tabHeaders[this.selectedIndex]);
  }

  private _setOverflowInert(header: VscodeTabHeader, hidden: boolean) {
    if (hidden) {
      if (!this._overflowInert.has(header)) {
        this._overflowInert.set(header, header.inert);
      }
      header.inert = true;
    } else if (this._overflowInert.has(header)) {
      header.inert = this._overflowInert.get(header)!;
      this._overflowInert.delete(header);
    }
  }

  private _restoreOverflowHeader(header: VscodeTabHeader) {
    header.removeAttribute('data-vsc-overflow-hidden');
    header.removeAttribute('data-vsc-overflow-last');
    this._setOverflowInert(header, false);
  }

  private _setMenuRoles(menu: VscodeContextMenu) {
    const wrapper =
      menu.shadowRoot?.querySelector<HTMLElement>('.context-menu');
    if (!wrapper) {
      return;
    }
    wrapper.role = 'menu';
    wrapper.ariaLabel = '更多标签页';
    let active: string | null = null;
    menu.shadowRoot
      ?.querySelectorAll('vscode-context-menu-item')
      .forEach((item, index) => {
        item.role = 'menuitem';
        item.id = `t${this._componentId}-overflow-${index}`;
        if (item.hasAttribute('selected')) {
          active = item.id;
        }
      });
    if (active) {
      wrapper.setAttribute('aria-activedescendant', active);
    } else {
      wrapper.removeAttribute('aria-activedescendant');
    }
  }

  private _headerLabel(header: VscodeTabHeader) {
    return (
      header.ariaLabel ||
      Array.from(header.childNodes)
        .filter(
          (node) => !(node instanceof Element) || !node.getAttribute('slot')
        )
        .map((node) => node.textContent)
        .join('')
        .trim() ||
      `标签页 ${header.tabId + 1}`
    );
  }

  private async _openMenu() {
    const layer = this.shadowRoot!.querySelector<HTMLElement>('.menu-layer')!;
    const menu = this.shadowRoot!.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    )!;
    if (this._menuOpen) {
      this._closeMenu();
      return;
    }
    this._menuOpen = true;
    menu.show = true;
    layer.showPopover();
    await menu.updateComplete;
    if (!this.isConnected) {
      return;
    }
    this._setMenuRoles(menu);
    const button =
      this.shadowRoot!.querySelector(
        '.overflow-button'
      )!.getBoundingClientRect();
    const rect = menu.getBoundingClientRect();
    this._menuLeft = Math.max(
      0,
      Math.min(button.right - rect.width, window.innerWidth - rect.width)
    );
    this._menuTop =
      button.bottom + rect.height > window.innerHeight
        ? Math.max(0, button.top - rect.height)
        : button.bottom;
  }

  private _closeMenu(restoreFocus = true) {
    const layer = this.shadowRoot?.querySelector<HTMLElement>('.menu-layer');
    if (layer?.matches(':popover-open')) {
      layer.hidePopover();
    }
    const menu = this.shadowRoot?.querySelector<VscodeContextMenu>(
      'vscode-context-menu'
    );
    if (menu) {
      menu.show = false;
    }
    const wasOpen = this._menuOpen;
    this._menuOpen = false;
    if (wasOpen && restoreFocus) {
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>('.overflow-button')
        ?.focus();
    }
  }

  private _onMenuToggle(event: Event) {
    if ((event as ToggleEvent).newState === 'closed') {
      this._closeMenu(false);
    }
  }

  private async _onMenuKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this._closeMenu();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const menu = this.shadowRoot!.querySelector<VscodeContextMenu>(
        'vscode-context-menu'
      )!;
      await menu.updateComplete;
      this._setMenuRoles(menu);
    }
  }

  private async _onMenuSelect(event: VscContextMenuSelectEvent) {
    const index = Number(event.detail.value);
    if (!this._tabHeaders[index]) {
      return;
    }
    this.selectedIndex = index;
    this._setActiveTab();
    this._closeMenu(false);
    this._dispatchSelectEvent();
    await this.updateComplete;
    this._updateOverflow();
    this._tabHeaders[index].focus();
  }

  private _syncScroll(event?: Event) {
    const list = this.shadowRoot?.querySelector<HTMLElement>('.tablist');
    const scrollbar = this.shadowRoot?.querySelector<HTMLElement>('.scrollbar');
    if (!list || !scrollbar) {
      return;
    }
    if (event?.target === scrollbar) {
      list.scrollLeft = scrollbar.scrollLeft;
    } else {
      scrollbar.scrollLeft = list.scrollLeft;
    }
  }

  private _revealHeader(header?: VscodeTabHeader) {
    if (this.overflow !== 'scroll' || !header) {
      return;
    }
    const list = this.shadowRoot?.querySelector<HTMLElement>('.tablist');
    if (!list) {
      return;
    }
    const bounds = list.getBoundingClientRect();
    const rect = header.getBoundingClientRect();
    if (rect.left < bounds.left) {
      list.scrollLeft += rect.left - bounds.left;
    } else if (rect.right > bounds.right) {
      list.scrollLeft += rect.right - bounds.right;
    }
    this._syncScroll();
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    this._scheduleLayout();
    if (this._menuOpen) {
      const menu = this.shadowRoot?.querySelector<VscodeContextMenu>(
        'vscode-context-menu'
      );
      menu?.updateComplete.then(() => this._setMenuRoles(menu));
    }
    if (changed.has('selectedIndex')) {
      this._setActiveTab();
      this._revealHeader(this._tabHeaders[this.selectedIndex]);
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this._dragController.connect();
    this._resizeObserver.observe(this);
    this.updateComplete.then(() => {
      if (this.isConnected) {
        this._onHeaderSlotChange();
      }
    });
    this._contentObserver.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'aria-label',
        'hidden',
        'icon',
        'icon-display',
        'icon-position',
      ],
    });
  }

  override disconnectedCallback() {
    this._dragController.disconnect();
    this._resizeObserver.disconnect();
    this._contentObserver.disconnect();
    this._tabHeaders.forEach((header) => this._restoreOverflowHeader(header));
    this._closeMenu(false);
    cancelAnimationFrame(this._layoutFrame);
    super.disconnectedCallback();
  }

  /** @internal DOM 移动后刷新成对的标题和面板。 */
  syncDragTabs(activePanel = this._tabPanels[this.selectedIndex]) {
    this._onMainSlotChange();
    this._onHeaderSlotChange();
    const index = activePanel ? this._tabPanels.indexOf(activePanel) : -1;
    this.selectedIndex =
      index >= 0
        ? index
        : Math.max(0, Math.min(this.selectedIndex, this._tabPanels.length - 1));
    this._setActiveTab();
    this._dragController.refresh();
  }

  /** @internal 位于 vscode-tabs-group 内时，可用于移动整个标签页组件的标题栏。 */
  get dragBar(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>('.header') ?? null;
  }

  /** @internal 登记拖拽系统创建的面板。 */
  markGeneratedPanel(panel: VscodeTabPanel) {
    this._dragController.markGenerated(panel);
  }

  constructor() {
    super();
    this._componentId = uniqueId();
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback(name, old, value);

    if (name === 'selected-index') {
      this._setActiveTab();
    }

    if (name === 'panel') {
      this._tabHeaders.forEach((h) => (h.panel = value !== null));
      this._tabPanels.forEach((p) => (p.panel = value !== null));
    }
  }

  @queryAssignedElements({slot: 'header'})
  private _headerSlotElements!: Element[];

  @queryAssignedElements()
  private _mainSlotElements!: Element[];

  private _tabHeaders: VscodeTabHeader[] = [];

  private _tabPanels: VscodeTabPanel[] = [];

  private _componentId = '';

  private _dispatchSelectEvent() {
    this.dispatchEvent(
      new CustomEvent('vsc-tabs-select', {
        detail: {
          selectedIndex: this.selectedIndex,
        },
        composed: true,
      }) as VscTabsSelectEvent
    );
  }

  private _setActiveTab() {
    this._tabPanels.forEach((el, i) => {
      el.hidden = i !== this.selectedIndex;
    });

    this._tabHeaders.forEach((el: VscodeTabHeader, i) => {
      el.active = i === this.selectedIndex;
    });
  }

  private _onHeaderKeyDown(ev: KeyboardEvent) {
    const path = ev.composedPath();
    const target = path.find((node) =>
      this._tabHeaders.includes(node as VscodeTabHeader)
    ) as VscodeTabHeader | undefined;
    if (
      !target ||
      path
        .slice(0, path.indexOf(target))
        .some(
          (node) =>
            node instanceof HTMLElement &&
            (node.isContentEditable ||
              node.matches(
                'button, input, select, textarea, a[href], [role="button"]'
              ))
        )
    ) {
      return;
    }
    const headers = this._tabHeaders.filter(
      (header) => !header.hidden && !header.inert
    );
    const index = headers.indexOf(target);
    let next: VscodeTabHeader | undefined;
    if (ev.key === 'ArrowLeft') {
      next = headers[(index + headers.length - 1) % headers.length];
    } else if (ev.key === 'ArrowRight') {
      next = headers[(index + 1) % headers.length];
    } else if (ev.key === 'Home') {
      next = headers[0];
    } else if (ev.key === 'End') {
      next = headers[headers.length - 1];
    }
    if (next) {
      ev.preventDefault();
      target.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
      this._revealHeader(next);
    }
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.selectedIndex = target.tabId;
      this._setActiveTab();
      this._dispatchSelectEvent();
    }
  }

  private _moveHeadersToHeaderSlot() {
    const headers = this._mainSlotElements.filter(
      (el) => el instanceof VscodeTabHeader
    ) as VscodeTabHeader[];

    if (headers.length > 0) {
      headers.forEach((h) => h.setAttribute('slot', 'header'));
    }
  }

  private _onMainSlotChange() {
    this._moveHeadersToHeaderSlot();

    this._tabPanels = this._mainSlotElements.filter(
      (el) => el instanceof VscodeTabPanel
    ) as VscodeTabPanel[];
    this._tabPanels.forEach((el, i) => {
      el.ariaLabelledby = `t${this._componentId}-h${i}`;
      el.id = `t${this._componentId}-p${i}`;
      el.panel = this.panel;
    });

    this._setActiveTab();
  }

  private _onHeaderSlotChange() {
    const previous = this._tabHeaders;
    this._tabHeaders = this._headerSlotElements.filter(
      (el) => el instanceof VscodeTabHeader
    ) as VscodeTabHeader[];
    previous
      .filter((header) => !this._tabHeaders.includes(header))
      .forEach((header) => this._restoreOverflowHeader(header));
    this._resizeObserver.disconnect();
    this._resizeObserver.observe(this);
    const list = this.shadowRoot?.querySelector('.tablist');
    if (list) {
      this._resizeObserver.observe(list);
    }
    this._tabHeaders.forEach((el, i) => {
      this._resizeObserver.observe(el);
      el.tabId = i;
      el.id = `t${this._componentId}-h${i}`;
      el.ariaControls = `t${this._componentId}-p${i}`;
      el.panel = this.panel;
      el.active = i === this.selectedIndex;
    });
    this._scheduleLayout();
  }

  private _onAddonsSlotChange(event: Event) {
    (event.target as HTMLSlotElement)
      .assignedElements()
      .forEach((el) => this._resizeObserver.observe(el));
    this._scheduleLayout();
  }

  private _onHeaderClick(event: MouseEvent) {
    const path = event.composedPath();
    const headerEl = path.find(
      (et) => (et as VscodeTabHeader) instanceof VscodeTabHeader
    );

    if (headerEl) {
      this.selectedIndex = (headerEl as VscodeTabHeader).tabId;
      this._setActiveTab();
      this._dispatchSelectEvent();
    }
  }

  override render(): TemplateResult {
    return html`
      <div
        class=${classMap({header: true, panel: this.panel})}
        @click=${this._onHeaderClick}
        @keydown=${this._onHeaderKeyDown}
      >
        <div role="tablist" class="tablist" @scroll=${this._syncScroll}>
          <slot
            name="header"
            @slotchange=${this._onHeaderSlotChange}
            role="tablist"
          ></slot>
        </div>
        <button
          class="overflow-button"
          ?hidden=${this._hiddenHeaders.length === 0}
          aria-label="更多标签页"
          aria-haspopup="menu"
          aria-expanded=${String(this._menuOpen)}
          @click=${this._openMenu}
        >
          ...
        </button>
        <div
          class="scrollbar"
          ?hidden=${this.overflow !== 'scroll' ||
          this._scrollWidth <= this._scrollViewportWidth}
          .style=${stylePropertyMap({
            width: `${this._scrollViewportWidth}px`,
            left: `${this._scrollOffset}px`,
          })}
          @scroll=${this._syncScroll}
          aria-hidden="true"
        >
          <div
            .style=${stylePropertyMap({
              width: `${this._scrollWidth}px`,
              height: '1px',
            })}
          ></div>
        </div>
        <slot name="addons" @slotchange=${this._onAddonsSlotChange}></slot>
      </div>
      <div
        class="menu-layer"
        popover="auto"
        @toggle=${this._onMenuToggle}
        @keydown=${this._onMenuKeyDown}
        .style=${stylePropertyMap({
          left: `${this._menuLeft}px`,
          top: `${this._menuTop}px`,
        })}
      >
        <vscode-context-menu
          .tabIndex=${-1}
          .data=${this._hiddenHeaders.map((header) => ({
            label: this._headerLabel(header),
            value: String(header.tabId),
            tabindex: -1,
          }))}
          @vsc-context-menu-select=${this._onMenuSelect}
        ></vscode-context-menu>
      </div>
      <slot @slotchange=${this._onMainSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-tabs': VscodeTabs;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-tabs-select': VscTabsSelectEvent;
    'vsc-tabs-layout-change': VscTabsLayoutChangeEvent;
  }
}
