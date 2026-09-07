import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      border-bottom-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
      border-bottom-style: solid;
      border-bottom-width: var(--vsc-row-border-bottom-width);
      box-sizing: border-box;
      color: var(--vscode-foreground, #cccccc);
      display: table-cell;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(
        --vsc-form-control-font-size,
        var(--vscode-font-size, 13px)
      );
      height: var(--vsc-table-row-height, 24px);
      overflow: hidden;
      padding-left: 10px;
      text-overflow: ellipsis;
      vertical-align: middle;
      white-space: nowrap;
    }

    :host([compact]) {
      display: block;
      height: auto;
      padding-bottom: var(--vsc-table-compact-padding, 5px);
      width: 100% !important;
    }

    :host([compact]:first-child) {
      padding-top: var(--vsc-table-compact-edge-padding, 10px);
    }

    :host([compact]:last-child) {
      padding-bottom: var(--vsc-table-compact-edge-padding, 10px);
    }

    .wrapper {
      overflow: inherit;
      text-overflow: inherit;
      white-space: inherit;
      width: 100%;
    }

    .column-label {
      font-weight: bold;
    }
  `,
];

export default styles;
