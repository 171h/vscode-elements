import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      display: block;
      min-width: 0;
    }

    .header {
      align-items: center;
      display: flex;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      width: 100%;
      position: relative;
    }

    .header {
      border-bottom-color: var(--vscode-settings-headerBorder, #2b2b2b);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .header.panel {
      background-color: var(--vscode-panel-background, #181818);
      border-bottom-width: 0;
      box-sizing: border-box;
      padding-left: 8px;
      padding-right: 8px;
    }

    .tablist {
      display: flex;
      flex: 1;
      min-width: 0;
      margin-bottom: -1px;
    }

    .tablist ::slotted(vscode-tab-header) {
      flex: 0 0 auto;
    }

    :host([overflow='wrap']) .tablist {
      flex-wrap: wrap;
    }

    :host([overflow='wrap'][wrap-alignment='center']) .tablist {
      justify-content: center;
    }

    :host([overflow='scroll']) .tablist {
      overflow-x: auto;
      scrollbar-width: none;
    }

    :host([overflow='scroll']) .tablist::-webkit-scrollbar {
      display: none;
    }

    .scrollbar {
      display: none;
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 8px;
      overflow-x: scroll;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: var(--vscode-scrollbarSlider-background, #79797966)
        transparent;
      z-index: 1;
      opacity: 0;
      pointer-events: none;
    }

    :host([overflow='scroll']) .scrollbar {
      display: block;
    }

    :host([overflow='scroll']:hover) .scrollbar {
      opacity: 1;
      pointer-events: auto;
    }

    .scrollbar::-webkit-scrollbar {
      height: 8px;
    }

    .scrollbar::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background, #79797966);
    }

    .scrollbar::-webkit-scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, #646464b3);
    }

    .tablist ::slotted([hidden]) {
      display: none;
    }

    :host([overflow='menu']) .tablist {
      overflow: hidden;
    }

    .tablist ::slotted([data-vsc-overflow-hidden]) {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    }

    .tablist ::slotted([data-vsc-overflow-last]) {
      order: 1;
      max-width: 100%;
      overflow: hidden;
    }

    .overflow-button {
      flex: 0 0 32px;
      width: 32px;
      align-self: stretch;
      border: 0;
      background: transparent;
      color: var(--vscode-foreground, #cccccc);
      font: inherit;
      cursor: pointer;
    }

    .overflow-button[hidden] {
      display: none;
    }

    .overflow-button:hover {
      background: var(--vscode-toolbar-hoverBackground, #5a5d5d4f);
    }

    .overflow-button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: -2px;
    }

    .menu-layer {
      position: fixed;
      inset: auto;
      margin: 0;
      border: 0;
      padding: 0;
      background: transparent;
      max-width: 100vw;
      max-height: 100vh;
      overflow: auto;
    }

    slot[name='addons'] {
      display: block;
      margin-left: auto;
      flex: 0 0 auto;
    }
  `,
];

export default styles;
