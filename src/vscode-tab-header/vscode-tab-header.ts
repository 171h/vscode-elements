import {html, nothing, TemplateResult} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import '../vscode-icon/index.js';
import {stylePropertyMap} from '../includes/style-property-map.js';
import styles from './vscode-tab-header.styles.js';

/**
 * @tag vscode-tab-header
 *
 * @slot - 标题文字，在纯图标模式下仍作为无障碍名称。
 * @slot icon - 自定义 SVG 或字体图标，优先于 icon 属性。
 * @slot content-before - 标题前的附加内容。
 * @slot content-after - 标题后的附加内容。
 * @cssprop [--vsc-tab-header-height=20px] - 标题内容的最小高度，面板风格默认为 31px。
 *
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vscode-foreground=#cccccc]
 * @cssprop [--vscode-panelTitle-activeBorder=#0078d4]
 * @cssprop [--vscode-panelTitle-activeForeground=#cccccc]
 * @cssprop [--vscode-panelTitle-inactiveForeground=#9d9d9d]
 */
@customElement('vscode-tab-header')
export class VscodeTabHeader extends VscElement {
  static override styles = styles;

  @property({type: Boolean, reflect: true})
  active = false;

  /** @internal */
  @property({reflect: true, attribute: 'aria-controls'})
  ariaControls = '';

  /**
   * 面板风格的外观
   */
  @property({type: Boolean, reflect: true})
  panel = false;

  /** @internal */
  @property({reflect: true})
  override role = 'tab';

  /** @internal */
  @property({type: Number, reflect: true, attribute: 'tab-id'})
  tabId = -1;

  /** Codicon 字体图标名称，自定义图标可使用 icon 插槽。 */
  @property()
  icon = '';

  /** 图标位于标题左侧或右侧。 */
  @property({reflect: true, attribute: 'icon-position'})
  iconPosition: 'start' | 'end' = 'start';

  /** 仅图标、图标加文字或仅文字。 */
  @property({reflect: true, attribute: 'icon-display'})
  iconDisplay: 'icon' | 'icon-text' | 'text' = 'icon-text';

  @state()
  private _hasCustomIcon = false;

  @state()
  private _iconSize = 16;

  private _iconResizeObserver = new ResizeObserver((entries) => {
    const height = entries[0]?.contentRect.height;
    if (height) {
      this._iconSize = Math.max(1, Math.round(height * 0.8));
    }
  });

  override connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      const wrapper = this.shadowRoot?.querySelector('.wrapper');
      if (this.isConnected && wrapper) {
        this._iconResizeObserver.observe(wrapper);
      }
    });
  }

  override disconnectedCallback() {
    this._iconResizeObserver.disconnect();
    super.disconnectedCallback();
  }

  private _onIconSlotChange(event: Event) {
    this._hasCustomIcon =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback(name, old, value);

    if (name === 'active') {
      const active = value !== null;
      this.ariaSelected = active ? 'true' : 'false';
      this.tabIndex = active ? 0 : -1;
    }
  }

  override render(): TemplateResult {
    return html`
      <div
        class=${classMap({
          wrapper: true,
          active: this.active,
          panel: this.panel,
        })}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <span
          class=${classMap({icon: true, trailing: this.iconPosition === 'end'})}
          aria-hidden="true"
          ?hidden=${this.iconDisplay === 'text' ||
          (!this.icon && !this._hasCustomIcon)}
          .style=${stylePropertyMap({
            fontSize: `${this._iconSize}px`,
            width: `${this._iconSize}px`,
            height: `${this._iconSize}px`,
          })}
        >
          <slot name="icon" @slotchange=${this._onIconSlotChange}>
            ${this.icon
              ? html`<vscode-icon name=${this.icon}></vscode-icon>`
              : nothing}
          </slot>
        </span>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${classMap({
            'active-indicator': true,
            active: this.active,
            panel: this.panel,
          })}
        ></span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-tab-header': VscodeTabHeader;
  }
}
