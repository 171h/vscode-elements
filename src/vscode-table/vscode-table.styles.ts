import {css, CSSResultGroup} from 'lit';
import baseStyles from '../includes/default.styles.js';

export const SPLITTER_HIT_WIDTH = 5;
export const SPLITTER_VISIBLE_WIDTH = 1;

const styles: CSSResultGroup = [
  baseStyles,
  css`
    :host {
      --vsc-form-control-font-size: var(--vscode-font-size, 13px);
      --vsc-table-compact-edge-padding: 10px;
      --vsc-table-compact-padding: 5px;
      --vsc-table-header-height: 30px;
      --vsc-table-header-line-height: 20px;
      --vsc-table-row-height: 24px;
      display: block;
      --vsc-row-even-background: transparent;
      --vsc-row-odd-background: transparent;
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 0;
      --vsc-row-display: table-row;
    }

    :host([size='small']) {
      --vsc-form-control-font-size: 11px;
      --vsc-table-compact-edge-padding: 6px;
      --vsc-table-compact-padding: 3px;
      --vsc-table-header-height: 24px;
      --vsc-table-header-line-height: 14px;
      --vsc-table-row-height: 18px;
    }

    :host([size='large']) {
      --vsc-form-control-font-size: 15px;
      --vsc-table-compact-edge-padding: 14px;
      --vsc-table-compact-padding: 7px;
      --vsc-table-header-height: 36px;
      --vsc-table-header-line-height: 26px;
      --vsc-table-row-height: 30px;
    }

    :host([bordered]),
    :host([bordered-rows]) {
      --vsc-row-border-bottom-width: 1px;
    }

    :host([compact]) {
      --vsc-row-display: block;
    }

    :host([bordered][compact]),
    :host([bordered-rows][compact]) {
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 1px;
    }

    :host([zebra]) {
      --vsc-row-even-background: var(
        --vscode-keybindingTable-rowsBackground,
        rgba(204, 204, 204, 0.04)
      );
    }

    :host([zebra-odd]) {
      --vsc-row-odd-background: var(
        --vscode-keybindingTable-rowsBackground,
        rgba(204, 204, 204, 0.04)
      );
    }

    ::slotted(vscode-table-row) {
      width: 100%;
    }

    .wrapper {
      height: 100%;
      max-width: 100%;
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .wrapper.select-disabled {
      user-select: none;
    }

    .wrapper.resize-cursor {
      cursor: ew-resize;
    }

    .wrapper.compact-view .header-slot-wrapper {
      height: 0;
      overflow: hidden;
    }

    .scrollable {
      height: 100%;
    }

    .scrollable:before {
      background-color: transparent;
      content: '';
      display: block;
      height: 1px;
      position: absolute;
      width: 100%;
    }

    .wrapper:not(.compact-view) .scrollable:not([scrolled]):before {
      background-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
    }

    .sash {
      visibility: hidden;
    }

    :host([bordered-columns]) .sash,
    :host([bordered]) .sash {
      visibility: visible;
    }

    :host([resizable]) .wrapper:hover .sash {
      visibility: visible;
    }

    .sash {
      height: 100%;
      position: absolute;
      top: 0;
      width: 1px;
    }

    .wrapper.compact-view .sash {
      display: none;
    }

    .sash.resizable {
      cursor: ew-resize;
    }

    .sash-visible {
      background-color: var(
        --vscode-editorGroup-border,
        rgba(255, 255, 255, 0.09)
      );
      height: calc(100% - var(--vsc-table-header-height));
      position: absolute;
      top: var(--vsc-table-header-height);
      width: ${SPLITTER_VISIBLE_WIDTH}px;
    }

    .sash.hover .sash-visible {
      background-color: var(--vscode-sash-hoverBorder, #0078d4);
      transition: background-color 50ms linear 300ms;
    }

    .sash .sash-clickable {
      height: 100%;
      left: ${0 - (SPLITTER_HIT_WIDTH - SPLITTER_VISIBLE_WIDTH) / 2}px;
      position: absolute;
      width: ${SPLITTER_HIT_WIDTH}px;
    }
  `,
];

export default styles;
