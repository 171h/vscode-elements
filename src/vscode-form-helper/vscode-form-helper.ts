import {html, TemplateResult} from 'lit';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-form-helper.styles.js';

// SSR 防护：CSSStyleSheet 可能不可用
let lightDOMStyles: CSSStyleSheet | undefined;
if (typeof CSSStyleSheet !== 'undefined') {
  lightDOMStyles = new CSSStyleSheet();
  lightDOMStyles.replaceSync(`
    vscode-form-helper * {
      margin: 0;
    }

    vscode-form-helper *:not(:last-child) {
      margin-bottom: 8px;
    }
  `);
}

/**
 * 为[表单组](https://bendera.github.io/vscode-webview-elements/components/vscode-form-group/)添加更详细的说明
 *
 * @tag vscode-form-helper
 *
 * @cssprop --vsc-foreground-translucent - 默认文字颜色，默认使用 `--vscode-foreground` 的 90% 透明度版本。
 */
@customElement('vscode-form-helper')
export class VscodeFormHelper extends VscElement {
  static override styles = styles;

  constructor() {
    super();
    this._injectLightDOMStyles();
  }

  private _injectLightDOMStyles() {
    // SSR 防护：document 可能不可用
    if (typeof document === 'undefined' || !lightDOMStyles) {
      return;
    }

    const found = document.adoptedStyleSheets.find((s) => s === lightDOMStyles);

    if (!found) {
      document.adoptedStyleSheets.push(lightDOMStyles);
    }
  }

  override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-form-helper': VscodeFormHelper;
  }
}
