import {html, TemplateResult} from 'lit';
import {property, queryAssignedElements} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import uniqueId from '../includes/uniqueId.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {VscodeTabHeader} from '../vscode-tab-header/index.js';
import {VscodeTabPanel} from '../vscode-tab-panel/index.js';
import styles from './vscode-tabs.styles.js';
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

  private _dragController = new TabsDragController(this);

  override connectedCallback() {
    super.connectedCallback();
    this._dragController.connect();
  }

  override disconnectedCallback() {
    this._dragController.disconnect();
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

  private _tabFocus = 0;

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
    this._tabFocus = this.selectedIndex;

    this._tabPanels.forEach((el, i) => {
      el.hidden = i !== this.selectedIndex;
    });

    this._tabHeaders.forEach((el: VscodeTabHeader, i) => {
      el.active = i === this.selectedIndex;
    });
  }

  private _focusPrevTab() {
    if (this._tabFocus === 0) {
      this._tabFocus = this._tabHeaders.length - 1;
    } else {
      this._tabFocus -= 1;
    }
  }

  private _focusNextTab() {
    if (this._tabFocus === this._tabHeaders.length - 1) {
      this._tabFocus = 0;
    } else {
      this._tabFocus += 1;
    }
  }

  private _onHeaderKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      this._tabHeaders[this._tabFocus].setAttribute('tabindex', '-1');

      if (ev.key === 'ArrowLeft') {
        this._focusPrevTab();
      } else if (ev.key === 'ArrowRight') {
        this._focusNextTab();
      }

      this._tabHeaders[this._tabFocus].setAttribute('tabindex', '0');
      this._tabHeaders[this._tabFocus].focus();
    }

    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.selectedIndex = this._tabFocus;
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
    this._tabHeaders = this._headerSlotElements.filter(
      (el) => el instanceof VscodeTabHeader
    ) as VscodeTabHeader[];
    this._tabHeaders.forEach((el, i) => {
      el.tabId = i;
      el.id = `t${this._componentId}-h${i}`;
      el.ariaControls = `t${this._componentId}-p${i}`;
      el.panel = this.panel;
      el.active = i === this.selectedIndex;
    });
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
        <div role="tablist" class="tablist">
          <slot
            name="header"
            @slotchange=${this._onHeaderSlotChange}
            role="tablist"
          ></slot>
        </div>
        <slot name="addons"></slot>
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
