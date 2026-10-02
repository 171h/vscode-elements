import {html, TemplateResult, nothing} from 'lit';
import {property} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-table-cell.styles.js';

/**
 * @tag vscode-table-cell
 *
 * @cssprop [--vscode-editorGroup-border=rgba(255, 255, 255, 0.09)]
 * @cssprop [--vscode-foreground=#cccccc]
 * @cssprop [--vscode-font-family=sans-serif]
 * @cssprop [--vscode-font-size=13px]
 */
@customElement('vscode-table-cell')
export class VscodeTableCell extends VscElement {
  static override styles = styles;

  /** @internal */
  @property({reflect: true})
  override role = 'cell';

  /**
   * 响应式紧凑视图中的单元格标签，仅供内部使用。
   */
  @property({attribute: 'column-label'})
  columnLabel = '';

  /**
   * 启用响应式紧凑视图，仅供内部使用。
   */
  @property({type: Boolean, reflect: true})
  compact = false;

  override render(): TemplateResult {
    const columnLabelElement = this.columnLabel
      ? html`<div class="column-label" role="presentation">
          ${this.columnLabel}
        </div>`
      : nothing;

    return html`
      <div class="wrapper">
        ${columnLabelElement}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-table-cell': VscodeTableCell;
  }
}
