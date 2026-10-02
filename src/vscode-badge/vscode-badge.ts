import {html, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-badge.styles.js';

/**
 * 展示数量或状态信息。徽章也可用于[文本框](https://vscode-elements.github.io/components/textfield)和[标签页标题](https://vscode-elements.github.io/components/tabs)组件。
 *
 * @tag vscode-badge
 *
 * @cssprop [--vscode-font-family=sans-serif] - 无衬线字体，具体字体取决于宿主操作系统。
 * @cssprop [--vscode-contrastBorder=transparent]
 * @cssprop [--vscode-badge-background=#616161] - 默认及计数样式的背景色
 * @cssprop [--vscode-badge-foreground=#f8f8f8] - 默认及计数样式的前景色
 * @cssprop [--vscode-activityBarBadge-background=#0078d4] - 活动栏样式的背景色
 * @cssprop [--vscode-activityBarBadge-foreground=#ffffff] - 活动栏样式的前景色
 */
@customElement('vscode-badge')
export class VscodeBadge extends VscElement {
  static override styles = styles;

  @property({reflect: true})
  variant:
    | 'default'
    | 'counter'
    | 'activity-bar-counter'
    | 'tab-header-counter' = 'default';

  override render(): TemplateResult {
    return html`<div class="root"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-badge': VscodeBadge;
  }
}
