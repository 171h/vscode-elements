import {html, TemplateResult} from 'lit';
import {property, state} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import type {VscodeTabHeader} from '../vscode-tab-header/index.js';
import type {VscodeTabs} from '../vscode-tabs/index.js';
import styles from './vscode-tabs-group.styles.js';
import {TabsGroupDragController} from './drag-controller.js';

export type VscTabsGroupLayoutChangeEvent = CustomEvent<{
  source: VscodeTabsGroup | null;
  destination: VscodeTabsGroup;
  tabs: VscodeTabs;
  header?: VscodeTabHeader;
  views: HTMLElement[];
}>;

/**
 * vscode-tabs 组容器，支持排序、跨容器移动，以及由拖拽标签页或视图创建新组。
 * 拖拽标签栏背景可移动整组；拖拽标题或 fieldset 的 legend 至容器可创建新组。
 *
 * @tag vscode-tabs-group
 *
 * @slot - 默认插槽；放入 vscode-tabs 元素后可按组移动。
 *
 * @fires {VscTabsGroupLayoutChangeEvent} vsc-tabs-group-layout-change - 移动或创建标签页组后派发
 *
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-descriptionForeground=#9d9d9d]
 * @cssprop [--vscode-sideBar-dropBackground=rgba(83, 89, 93, 0.5)]
 * @cssprop [--vscode-contrastActiveBorder=transparent]
 * @cssprop [--vscode-contrastBorder=#6fc3df]
 */
@customElement('vscode-tabs-group')
export class VscodeTabsGroup extends VscElement {
  static override styles = styles;

  /** 容器没有标签页组时显示的提示。 */
  @property({type: String, attribute: 'empty-text'})
  emptyText = '将标签页组拖到此处';

  @state()
  private hasTabs = false;

  private _dragController = new TabsGroupDragController(this);

  override connectedCallback() {
    super.connectedCallback();
    this._dragController.connect();
  }

  override disconnectedCallback() {
    this._dragController.disconnect();
    super.disconnectedCallback();
  }

  private _onSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;

    this.hasTabs = slot
      .assignedElements()
      .some((el) => el.localName === 'vscode-tabs');
  }

  override render(): TemplateResult {
    return html`
      <slot @slotchange=${this._onSlotChange}></slot>
      <div class="empty" ?hidden=${this.hasTabs}>
        <span class="empty-text">${this.emptyText}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-tabs-group': VscodeTabsGroup;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-tabs-group-layout-change': VscTabsGroupLayoutChangeEvent;
  }
}
