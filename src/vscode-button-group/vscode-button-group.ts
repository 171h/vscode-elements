import {html, TemplateResult} from 'lit';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-button-group.styles.js';

/**
 * 展示将多个组件组合为单个按钮的分割按钮，常用于按钮右侧带下拉菜单的场景。
 *
 * @tag vscode-button-group
 *
 * @cssprop [--vscode-button-background=#0078d4]
 * @cssprop [--vscode-button-foreground=#ffffff]
 * @cssprop [--vscode-button-border=var(--vscode-button-background, rgba(255, 255, 255, 0.07))]
 * @cssprop [--vscode-button-hoverBackground=#026ec1]
 * @cssprop [--vscode-font-family=sans-serif] - 无衬线字体，具体字体取决于宿主操作系统。
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-button-secondaryForeground=#cccccc]
 * @cssprop [--vscode-button-secondaryBackground=#313131]
 * @cssprop [--vscode-button-secondaryHoverBackground=#3c3c3c]
 * @cssprop [--vscode-focusBorder=#0078d4]
 */
@customElement('vscode-button-group')
export class VscodeButtonGroup extends VscElement {
  static override styles = styles;

  override render(): TemplateResult {
    return html`<div class="root"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-button-group': VscodeButtonGroup;
  }
}
