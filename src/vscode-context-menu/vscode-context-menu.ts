import {html, nothing, TemplateResult} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import type {VscodeContextMenuItem} from '../vscode-context-menu-item/vscode-context-menu-item.js';
import '../vscode-context-menu-item/index.js';
import styles from './vscode-context-menu.styles.js';

interface MenuItemData {
  label?: string;
  keybinding?: string;
  value?: string;
  separator?: boolean;
  tabindex?: number;
}

export type VscContextMenuSelectEvent = CustomEvent<{
  keybinding: string;
  label: string;
  value: string;
  separator: boolean;
  tabindex: number;
}>;

/**
 * @tag vscode-context-menu
 *
 * @fires {VscMenuSelectEvent} vsc-menu-select - 点击菜单项时触发
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-menu-background=#1f1f1f]
 * @cssprop [--vscode-menu-border=#454545]
 * @cssprop [--vscode-menu-foreground=#cccccc]
 * @cssprop [--vscode-widget-shadow=rgba(0, 0, 0, 0.36)]
 */
@customElement('vscode-context-menu')
export class VscodeContextMenu extends VscElement {
  static override styles = styles;

  @property({type: Array, attribute: false})
  set data(data: MenuItemData[]) {
    const identity = JSON.stringify(
      data.map(({label, value, separator, keybinding}) => [
        label,
        value,
        !!separator,
        keybinding,
      ])
    );
    if (identity !== this._dataIdentity) {
      this._selectedClickableItemIndex = -1;
    }
    this._dataIdentity = identity;
    this._data = data;

    const indexes: number[] = [];

    data.forEach((v, i) => {
      if (!v.separator) {
        indexes.push(i);
      }
    });

    this._clickableItemIndexes = indexes;
    if (this._selectedClickableItemIndex >= indexes.length) {
      this._selectedClickableItemIndex = -1;
    }
  }
  get data(): MenuItemData[] {
    return this._data;
  }

  /**
   * 默认点击菜单项后关闭菜单，此特性阻止菜单关闭。
   */
  @property({type: Boolean, reflect: true, attribute: 'prevent-close'})
  preventClose = false;

  @property({type: Boolean, reflect: true})
  set show(show: boolean) {
    const generation = ++this._showGeneration;
    this._clearOutsideClickListener();
    this._show = show;
    this._selectedClickableItemIndex = -1;

    if (show) {
      this.updateComplete.then(() => {
        if (
          !this.show ||
          !this.isConnected ||
          generation !== this._showGeneration
        ) {
          return;
        }
        this._wrapperEl?.focus();
        this._outsideClickFrame = requestAnimationFrame(() => {
          this._outsideClickFrame = 0;
          if (
            this.show &&
            this.isConnected &&
            generation === this._showGeneration
          ) {
            this._outsideClickDocument = this.ownerDocument;
            this._outsideClickDocument.addEventListener(
              'click',
              this._onClickOutsideBound
            );
          }
        });
      });
    }
  }
  get show(): boolean {
    return this._show;
  }

  /** @internal */
  @property({type: Number, reflect: true})
  override tabIndex = 0;

  constructor() {
    super();
    this.addEventListener('keydown', this._onKeyDown);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.show) {
      this.show = true;
    }
  }

  override disconnectedCallback(): void {
    this._showGeneration++;
    this._clearOutsideClickListener();
    super.disconnectedCallback();
  }

  private _showGeneration = 0;
  private _outsideClickFrame = 0;
  private _outsideClickDocument?: Document;

  private _clearOutsideClickListener() {
    cancelAnimationFrame(this._outsideClickFrame);
    this._outsideClickFrame = 0;
    this._outsideClickDocument?.removeEventListener(
      'click',
      this._onClickOutsideBound
    );
    this._outsideClickDocument = undefined;
  }

  @state()
  private _selectedClickableItemIndex = -1;

  @state()
  private _show = false;

  @query('.context-menu')
  private _wrapperEl!: HTMLDivElement;

  private _data: MenuItemData[] = [];
  private _dataIdentity = '';

  private _clickableItemIndexes: number[] = [];

  private _onClickOutside(ev: MouseEvent) {
    if (!ev.composedPath().includes(this)) {
      this.show = false;
    }
  }

  private _onClickOutsideBound = this._onClickOutside.bind(this);

  private _onKeyDown(ev: KeyboardEvent) {
    const {key} = ev;

    if (
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'Escape' ||
      key === 'Enter'
    ) {
      ev.preventDefault();
    }

    switch (key) {
      case 'ArrowUp':
        this._handleArrowUp();
        break;
      case 'ArrowDown':
        this._handleArrowDown();
        break;
      case 'Escape':
        this._handleEscape();
        break;
      case 'Enter':
        this._handleEnter();
        break;
      default:
    }
  }

  private _handleArrowUp() {
    const count = this._clickableItemIndexes.length;
    if (count === 0) {
      this._selectedClickableItemIndex = -1;
      return;
    }
    if (
      this._selectedClickableItemIndex <= 0 ||
      this._selectedClickableItemIndex >= count
    ) {
      this._selectedClickableItemIndex = count - 1;
    } else {
      this._selectedClickableItemIndex -= 1;
    }
  }

  private _handleArrowDown() {
    const count = this._clickableItemIndexes.length;
    if (count === 0) {
      this._selectedClickableItemIndex = -1;
      return;
    }
    this._selectedClickableItemIndex =
      (this._selectedClickableItemIndex + 1) % count;
  }

  private _handleEscape() {
    this.show = false;
  }

  private _dispatchSelectEvent(selectedOption: VscodeContextMenuItem) {
    const {keybinding, label, value, separator, tabindex} = selectedOption;

    this.dispatchEvent(
      new CustomEvent('vsc-context-menu-select', {
        detail: {
          keybinding,
          label,
          separator,
          tabindex,
          value,
        },
      }) as VscContextMenuSelectEvent
    );
  }

  private _handleEnter() {
    if (this._selectedClickableItemIndex < 0) {
      return;
    }

    const realItemIndex =
      this._clickableItemIndexes[this._selectedClickableItemIndex];
    const options = this._wrapperEl.querySelectorAll(
      'vscode-context-menu-item'
    );
    const selectedOption = options[realItemIndex];
    if (!selectedOption || selectedOption.separator) {
      return;
    }

    this._dispatchSelectEvent(selectedOption);

    if (!this.preventClose) {
      this.show = false;
    }
  }

  private _onItemClick(event: CustomEvent) {
    const et = event.currentTarget as VscodeContextMenuItem;

    this._dispatchSelectEvent(et);

    if (!this.preventClose) {
      this.show = false;
    }
  }

  private _onItemMouseOver(event: MouseEvent) {
    const el = event.target as HTMLElement;
    const index = el.dataset.index ? +el.dataset.index : -1;
    const found = this._clickableItemIndexes.findIndex(
      (item) => item === index
    );

    if (found !== -1) {
      this._selectedClickableItemIndex = found;
    }
  }

  private _onItemMouseOut() {
    this._selectedClickableItemIndex = -1;
  }

  override render(): TemplateResult {
    if (!this._show) {
      return html`${nothing}`;
    }

    const selectedIndex =
      this._clickableItemIndexes[this._selectedClickableItemIndex];

    return html`
      <div class="context-menu" tabindex="0">
        ${this.data
          ? this.data.map(
              (
                {
                  label = '',
                  keybinding = '',
                  value = '',
                  separator = false,
                  tabindex = 0,
                },
                index
              ) => html`
                <vscode-context-menu-item
                  label=${label}
                  keybinding=${keybinding}
                  value=${value}
                  ?separator=${separator}
                  ?selected=${index === selectedIndex}
                  tabindex=${tabindex}
                  @vsc-click=${this._onItemClick}
                  @mouseover=${this._onItemMouseOver}
                  @mouseout=${this._onItemMouseOut}
                  data-index=${index}
                ></vscode-context-menu-item>
              `
            )
          : html`<slot></slot>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-context-menu': VscodeContextMenu;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-context-menu-select': VscContextMenuSelectEvent;
  }
}
