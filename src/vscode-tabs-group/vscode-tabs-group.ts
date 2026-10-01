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
 * Container for `vscode-tabs` groups. Groups can be reordered, moved between
 * containers, and created from a dragged tab or view.
 *
 * Drag the background of a tab strip to move a whole tabs group. Tab titles
 * keep their existing drag behavior: dropping one on the container promotes it
 * to a new group, and the same applies to a fieldset legend.
 *
 * @tag vscode-tabs-group
 *
 * @slot - Default slot. Assign `vscode-tabs` elements to move them as groups.
 *
 * @fires {VscTabsGroupLayoutChangeEvent} vsc-tabs-group-layout-change - Dispatched after moving or creating a tabs group
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

  /**
   * Hint shown while the container has no tabs groups.
   */
  @property({type: String, attribute: 'empty-text'})
  emptyText = 'Drag a tabs group here';

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
