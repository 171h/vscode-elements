import {CSSResultGroup, css} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      --vsc-form-control-font-size: var(--vscode-font-size, 13px);
      --vsc-tree-item-height: 22px;
      --vsc-tree-item-arrow-display: flex;
      --internal-selectionBackground: var(
        --vscode-list-inactiveSelectionBackground,
        #37373d
      );
      --internal-selectionForeground: var(--vscode-foreground, #cccccc);
      --internal-selectionIconForeground: var(
        --vscode-icon-foreground,
        #cccccc
      );
      --internal-defaultIndentGuideDisplay: none;
      --internal-highlightedIndentGuideDisplay: block;

      display: block;
    }

    :host([size='small']) {
      --vsc-form-control-font-size: 11px;
      --vsc-tree-item-height: 16px;
    }

    :host([size='large']) {
      --vsc-form-control-font-size: 15px;
      --vsc-tree-item-height: 28px;
    }

    :host(:hover) {
      --internal-defaultIndentGuideDisplay: block;
      --internal-highlightedIndentGuideDisplay: block;
    }

    :host(:focus-within) {
      --internal-selectionBackground: var(
        --vscode-list-activeSelectionBackground,
        #04395e
      );
      --internal-selectionForeground: var(
        --vscode-list-activeSelectionForeground,
        #ffffff
      );
      --internal-selectionIconForeground: var(
        --vscode-list-activeSelectionIconForeground,
        #ffffff
      );
    }

    :host([hide-arrows]) {
      --vsc-tree-item-arrow-display: none;
    }

    :host([indent-guides='none']),
    :host([indent-guides='none']:hover) {
      --internal-defaultIndentGuideDisplay: none;
      --internal-highlightedIndentGuideDisplay: none;
    }

    :host([indent-guides='always']),
    :host([indent-guides='always']:hover) {
      --internal-defaultIndentGuideDisplay: block;
      --internal-highlightedIndentGuideDisplay: block;
    }
  `,
];

export default styles;
