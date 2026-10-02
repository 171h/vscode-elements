import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      cursor: pointer;
      display: block;
      user-select: none;
    }

    .wrapper {
      align-items: center;
      border-bottom: 1px solid transparent;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: var(--vsc-tab-header-height, 20px);
      overflow: hidden;
      padding: 7px 8px;
      position: relative;
      text-overflow: ellipsis;
      white-space: var(--vsc-tab-header-white-space, nowrap);
    }

    :host([active]) .wrapper {
      border-bottom-color: var(--vscode-panelTitle-activeForeground, #cccccc);
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      border-bottom: 0;
      margin-bottom: 0;
      padding: 0;
    }

    :host(:focus-visible) {
      outline: none;
    }

    .wrapper {
      align-items: center;
      color: var(--vscode-foreground, #cccccc);
      display: flex;
      min-height: var(--vsc-tab-header-height, 20px);
      overflow: inherit;
      text-overflow: inherit;
      position: relative;
    }

    .wrapper.panel {
      color: var(--vscode-panelTitle-inactiveForeground, #9d9d9d);
    }

    .wrapper.panel.active,
    .wrapper.panel:hover {
      color: var(--vscode-panelTitle-activeForeground, #cccccc);
    }

    :host([panel]) .wrapper {
      display: flex;
      font-size: 11px;
      min-height: var(--vsc-tab-header-height, 31px);
      padding: 2px 10px;
      text-transform: uppercase;
    }

    .main {
      min-width: 0;
      overflow-wrap: var(--vsc-tab-header-overflow-wrap, normal);
      overflow: inherit;
      text-overflow: inherit;
    }

    .before {
      order: 0;
    }
    .main {
      order: 2;
    }
    .after {
      order: 4;
    }

    .icon {
      order: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      margin-right: 8px;
      line-height: 1;
    }

    .icon.trailing {
      order: 3;
      margin-right: 0;
      margin-left: 8px;
    }

    .icon[hidden] {
      display: none;
    }

    .icon vscode-icon,
    .icon ::slotted(vscode-icon) {
      --vsc-icon-size: 1em;
    }

    .icon ::slotted(*) {
      width: 100%;
      height: 100%;
      font-size: inherit !important;
      fill: currentColor;
    }

    :host([icon-display='icon']) .main {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    :host([icon-display='icon']) .icon {
      margin: 0;
    }

    .active-indicator {
      display: none;
    }

    .active-indicator.panel.active {
      border-top: 1px solid var(--vscode-panelTitle-activeBorder, #0078d4);
      bottom: 4px;
      display: block;
      left: 8px;
      pointer-events: none;
      position: absolute;
      right: 8px;
    }

    :host(:focus-visible) .wrapper {
      outline-color: var(--vscode-focusBorder, #0078d4);
      outline-offset: var(--vsc-tab-focus-offset, 3px);
      outline-style: solid;
      outline-width: 1px;
    }

    :host(:focus-visible) .wrapper.panel {
      outline-offset: -2px;
    }

    slot[name='content-before']::slotted(vscode-badge) {
      margin-right: 8px;
    }

    slot[name='content-after']::slotted(vscode-badge) {
      margin-left: 8px;
    }
  `,
];

export default styles;
