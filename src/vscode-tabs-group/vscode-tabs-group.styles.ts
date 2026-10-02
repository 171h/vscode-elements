import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    slot {
      display: contents;
    }

    .empty {
      align-items: center;
      border: 1px dashed
        var(
          --vscode-contrastBorder,
          var(--vscode-panel-border, var(--vscode-widget-border, currentColor))
        );
      border-radius: 4px;
      box-sizing: border-box;
      color: var(--vscode-descriptionForeground, #9d9d9d);
      display: flex;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      justify-content: center;
      min-height: 96px;
      padding: 16px;
      text-align: center;
      width: 100%;
    }

    .empty[hidden],
    :host([data-vsc-group-dragover]) .empty {
      display: none;
    }

    ::slotted([data-vsc-group-placeholder]) {
      align-items: center;
      background: var(--vscode-sideBar-dropBackground, rgba(83, 89, 93, 0.5));
      border: 1px dashed var(--vscode-focusBorder, #0078d4);
      border-radius: 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 6px;
      justify-content: center;
      overflow: hidden;
      padding: 8px;
      pointer-events: none;
    }

    ::slotted(vscode-tabs[data-vsc-group-dragging]) {
      opacity: 0.45;
      transition: opacity 120ms ease-out;
    }

    @media (forced-colors: active) {
      .empty,
      ::slotted([data-vsc-group-placeholder]) {
        border-color: CanvasText;
      }
    }
  `,
];

export default styles;
