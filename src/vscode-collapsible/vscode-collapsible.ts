import {html, nothing, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-collapsible.styles.js';

export type VscCollapsibleToggleEvent = CustomEvent<{open: boolean}>;

/**
 * 允许用户展开或隐藏页面中的相关内容。
 *
 * @tag vscode-collapsible
 *
 * @slot - 主要内容。
 * @slot actions - 标题中的操作图标插槽，也可放置任意 HTML 元素；仅在组件展开时可见。
 * @slot decorations - 此插槽中的元素始终可见。
 *
 * @fires {VscCollapsibleToggleEvent} vsc-collapsible-toggle - 内容可见状态变化时派发。
 *
 * @cssprop [--vscode-sideBar-background=#181818] - 背景色
 * @cssprop [--vscode-focusBorder=#0078d4] - 焦点边框颜色
 * @cssprop [--vscode-font-family=sans-serif] - 标题字体
 * @cssprop [--vscode-sideBarSectionHeader-background=#181818] - 标题背景
 * @cssprop [--vscode-icon-foreground=#cccccc] - 箭头图标颜色
 * @cssprop [--vscode-sideBarTitle-foreground=#cccccc] - 标题字体颜色
 *
 * @csspart body - 组件中可展开内容的容器。默认隐藏溢出内容，可通过此 CSS 部件调整该行为。
 */
@customElement('vscode-collapsible')
export class VscodeCollapsible extends VscElement {
  static override styles = styles;

  /**
   * 启用时标题操作始终可见，否则仅在鼠标悬停时显示。
   * 操作只在折叠组件展开时显示。
   * 此属性用于适配 `workbench.view.alwaysShowHeaderActions` 设置。
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'always-show-header-actions',
  })
  alwaysShowHeaderActions = false;

  /**
   * 组件标题文字
   *
   * @deprecated `title` 是 HTML 全局特性，会意外触发原生
   * 工具提示。请改用 `heading` 属性。
   */
  @property({type: String})
  override title: string = '';

  /**
   * 标题文字。
   */
  @property()
  heading = '';

  /** 标题中视觉强调较弱的文字。 */
  @property()
  description = '';

  @property({type: Boolean, reflect: true})
  open = false;

  private _emitToggleEvent() {
    this.dispatchEvent(
      new CustomEvent('vsc-collapsible-toggle', {
        detail: {open: this.open},
      }) as VscCollapsibleToggleEvent
    );
  }

  private _onHeaderClick() {
    this.open = !this.open;
    this._emitToggleEvent();
  }

  private _onHeaderKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.open = !this.open;
      this._emitToggleEvent();
    }
  }

  private _onHeaderSlotClick(event: PointerEvent) {
    event.stopPropagation();
  }

  override render(): TemplateResult {
    const classes = {collapsible: true, open: this.open};
    const actionsClasses = {
      actions: true,
      'always-visible': this.alwaysShowHeaderActions,
    };
    const heading = this.heading ? this.heading : this.title;

    const icon = html`<svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="header-icon"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z"
      />
    </svg>`;

    const descriptionMarkup = this.description
      ? html`<span class="description">${this.description}</span>`
      : nothing;

    return html`
      <div class=${classMap(classes)}>
        <div
          class="collapsible-header"
          tabindex="0"
          @click=${this._onHeaderClick}
          @keydown=${this._onHeaderKeyDown}
        >
          ${icon}
          <h3 class="title">${heading}${descriptionMarkup}</h3>
          <div class="header-slots">
            <div class=${classMap(actionsClasses)}>
              <slot name="actions" @click=${this._onHeaderSlotClick}></slot>
            </div>
            <div class="decorations">
              <slot name="decorations" @click=${this._onHeaderSlotClick}></slot>
            </div>
          </div>
        </div>
        <div class="collapsible-body" part="body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-collapsible': VscodeCollapsible;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-collapsible-toggle': VscCollapsibleToggleEvent;
  }
}
