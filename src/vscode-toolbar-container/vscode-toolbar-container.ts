import {html, TemplateResult} from 'lit';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-toolbar-container.styles.js';

/**
 * 用于排列工具栏按钮的简单容器
 *
 * @tag vscode-toolbar-container
 */
@customElement('vscode-toolbar-container')
export class VscodeToolbarContainer extends VscElement {
  static override styles = styles;

  override render(): TemplateResult {
    return html`<div><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-toolbar-container': VscodeToolbarContainer;
  }
}
