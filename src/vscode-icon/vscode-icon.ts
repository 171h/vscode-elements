import {html, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {stylePropertyMap} from '../includes/style-property-map.js';
import styles from './vscode-icon.styles.js';

/**
 * 展示 [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) 图标。
 * 在 "action-icon" 模式下表现为按钮，
 * 建议通过 `label` 属性提供有意义的标签。
 *
 * @tag vscode-icon
 *
 * @cssprop [--vscode-icon-foreground=#cccccc]
 * @cssprop [--vscode-toolbar-hoverBackground=rgba(90, 93, 94, 0.31)] - `active-icon` 模式下悬停状态的背景色
 * @cssprop [--vscode-toolbar-activeBackground=rgba(99, 102, 103, 0.31)] - `active-icon` 模式下激活状态的背景色
 * @cssprop [--vscode-focusBorder=#0078d4]
 */
@customElement('vscode-icon')
export class VscodeIcon extends VscElement {
  static override styles = styles;
  /**
   * 在 `action-icon` 模式下设置有意义的标签供屏幕阅读器使用
   */
  @property()
  label = '';

  /**
   * [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) 图标名称。
   */
  @property({type: String})
  name = '';

  /**
   * 图标尺寸，接受像素数或预设尺寸：
   * `small`（14px）、`medium`（16px，默认）和 `large`（20px）。
   * 无效值（例如 `NaN`、`24px` 或空字符串）
   * 会被拒绝，并回退为默认 `medium`（16px）。
   */
  @property()
  set size(val: number | 'small' | 'medium' | 'large') {
    const presets = {
      small: 14,
      medium: 16,
      large: 20,
    } as const;

    if (typeof val === 'string') {
      const trimmed = val.trim();

      if (trimmed in presets) {
        this._size = presets[trimmed as keyof typeof presets];
        return;
      }

      const numericValue = Number(trimmed);
      this._size =
        trimmed !== '' && Number.isFinite(numericValue) ? numericValue : 16;
      return;
    }

    this._size = Number.isFinite(val) ? val : 16;
  }
  get size(): number {
    return this._size;
  }

  /**
   * 启用旋转动画
   */
  @property({type: Boolean, reflect: true})
  spin = false;

  /**
   * 动画时长，单位为秒
   */
  @property({type: Number, attribute: 'spin-duration'})
  spinDuration = 1.5;

  /**
   * 表现为按钮
   */
  @property({type: Boolean, reflect: true, attribute: 'action-icon'})
  actionIcon = false;

  private static stylesheetHref: string | undefined = '';

  private static nonce: string | undefined = '';

  private _size = 16;

  override connectedCallback(): void {
    super.connectedCallback();

    const {href, nonce} = this._getStylesheetConfig();

    VscodeIcon.stylesheetHref = href;
    VscodeIcon.nonce = nonce;
  }

  /**
   * 在 Web Components 中使用网络字体时，字体样式表需要引入两次：
   * 一次在页面中，一次在组件中。此函数查找
   * 页面上的字体样式表，并返回其 URL 与 nonce
   * 标识。
   */
  private _getStylesheetConfig(): {
    href: string | undefined;
    nonce: string | undefined;
  } {
    // SSR 防护：document 可能不可用
    if (typeof document === 'undefined') {
      return {nonce: undefined, href: undefined};
    }

    const linkElement = document.getElementById('vscode-codicon-stylesheet');
    const href = linkElement?.getAttribute('href') || undefined;
    const nonce = linkElement?.nonce || undefined;

    if (!linkElement) {
      let msg =
        'To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';
      msg += '请在宿主页面中加载 Codicon 样式表。';

      this.warn(msg);
    }

    return {nonce, href};
  }

  private _onButtonClick = (ev: MouseEvent) => {
    this.dispatchEvent(
      new CustomEvent('vsc-click', {detail: {originalEvent: ev}})
    );
  };

  override render(): TemplateResult {
    const {stylesheetHref, nonce} = VscodeIcon;

    const content = html`<span
      class=${classMap({
        codicon: true,
        ['codicon-' + this.name]: true,
        spin: this.spin,
      })}
      .style=${stylePropertyMap({
        animationDuration: String(this.spinDuration) + 's',
        fontSize: `var(--vsc-icon-size, ${this.size}px)`,
        height: `var(--vsc-icon-size, ${this.size}px)`,
        width: `var(--vsc-icon-size, ${this.size}px)`,
      })}
    ></span>`;

    const wrapped = this.actionIcon
      ? html` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${content}
        </button>`
      : html` <span class="icon" aria-hidden="true" role="presentation"
          >${content}</span
        >`;

    return html`
      <link
        rel="stylesheet"
        href=${ifDefined(stylesheetHref)}
        nonce=${ifDefined(nonce)}
      />
      ${wrapped}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-icon': VscodeIcon;
  }
}
