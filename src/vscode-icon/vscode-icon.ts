import {html, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {stylePropertyMap} from '../includes/style-property-map.js';
import styles from './vscode-icon.styles.js';

/**
 * Display a [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html).
 * In "action-icon" mode it behaves like a button. In this case, it is
 * recommended that a meaningful label is specified with the `label` property.
 *
 * @tag vscode-icon
 *
 * @cssprop [--vscode-icon-foreground=#cccccc]
 * @cssprop [--vscode-toolbar-hoverBackground=rgba(90, 93, 94, 0.31)] - Hover state background color in `active-icon` mode
 * @cssprop [--vscode-toolbar-activeBackground=rgba(99, 102, 103, 0.31)] - Active state background color in `active-icon` mode
 * @cssprop [--vscode-focusBorder=#0078d4]
 */
@customElement('vscode-icon')
export class VscodeIcon extends VscElement {
  static override styles = styles;
  /**
   * Set a meaningful label in `action-icon` mode for the screen readers
   */
  @property()
  label = '';

  /**
   * [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) icon name.
   */
  @property({type: String})
  name = '';

  /**
   * Icon size. Accepts a number of pixels or one of the predefined sizes:
   * `small` (14px), `medium` (16px, default) and `large` (20px).
   * Invalid values (for example `NaN`, `24px` or an empty string) are
   * rejected and fall back to the `medium` default (16px).
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
   * Enable rotation animation
   */
  @property({type: Boolean, reflect: true})
  spin = false;

  /**
   * Animation duration in seconds
   */
  @property({type: Number, attribute: 'spin-duration'})
  spinDuration = 1.5;

  /**
   * Behaves like a button
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
   * For using web fonts in web components, the font stylesheet must be included
   * twice: on the page and in the web component. This function looks for the
   * font stylesheet on the page and returns the stylesheet URL and the nonce
   * id.
   */
  private _getStylesheetConfig(): {
    href: string | undefined;
    nonce: string | undefined;
  } {
    // Guard for SSR: document may not be available
    if (typeof document === 'undefined') {
      return {nonce: undefined, href: undefined};
    }

    const linkElement = document.getElementById('vscode-codicon-stylesheet');
    const href = linkElement?.getAttribute('href') || undefined;
    const nonce = linkElement?.nonce || undefined;

    if (!linkElement) {
      let msg =
        'To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';
      msg +=
        'See https://vscode-elements.github.io/components/icon/ for more details.';

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
