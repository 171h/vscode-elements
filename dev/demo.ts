import {LitElement, html, css} from 'lit';
import {themes, applyTheme} from './themes.js';

// 示例环境使用本地主题工具，不依赖上游项目的运行时代码。
window.litNonce = 'abc123';
const sheet = document.createElement('style');
sheet.nonce = 'abc123';
sheet.textContent = `body {font: 13px var(--vscode-font-family, sans-serif); color: var(--vscode-foreground); background: var(--vscode-editor-background); margin: 20px;} main > div {padding: 12px;}`;
document.head.append(sheet);
applyTheme('dark-v2');
class DevThemeSelector extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    select {
      font: inherit;
      padding: 4px;
      color: var(--vscode-foreground);
      background: var(--vscode-input-background);
    }
  `;
  override render() {
    return html`<select
      aria-label="示例主题"
      @change=${(event: Event) => applyTheme((event.target as HTMLSelectElement).value)}
    >
      ${Object.keys(themes).map((id) => html`<option value=${id}>${id}</option>`)}
    </select>`;
  }
}
customElements.define('dev-theme-selector', DevThemeSelector);
