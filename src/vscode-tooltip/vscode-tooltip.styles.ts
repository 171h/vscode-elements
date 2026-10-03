import {css} from 'lit';

export default css`
  :host {
    display: inline-block;
  }
  :host([hidden]) {
    display: none;
  }
  :host([for]:not([for='']):not([hidden])) {
    display: contents;
  }
  .tooltip {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 3px 7px;
    box-sizing: border-box;
    min-width: min(var(--vsc-tooltip-min-width, 0px), calc(100vw - 16px));
    max-width: min(var(--vsc-tooltip-max-width, 320px), calc(100vw - 16px));
    max-height: calc(100vh - 16px);
    overflow: visible;
    overflow-wrap: anywhere;
    background: var(
      --vscode-editorHoverWidget-background,
      var(--vscode-editor-background, #252526)
    );
    color: var(
      --vscode-editorHoverWidget-foreground,
      var(--vscode-foreground, #cccccc)
    );
    border: 1px solid
      var(
        --vscode-editorHoverWidget-border,
        var(--vscode-contrastBorder, #454545)
      );
    outline: 1px solid var(--vscode-contrastBorder, transparent);
    border-radius: 3px;
    box-shadow: 0 2px 8px var(--vscode-widget-shadow, rgba(0, 0, 0, 0.36));
    font-family: var(--vscode-font-family, sans-serif);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    white-space: normal;
    cursor: default;
  }
  slot[name='_description'] {
    display: block;
    white-space: pre-wrap;
    max-height: calc(100vh - 26px);
    overflow: auto;
  }
  .tooltip::before {
    content: '';
    position: absolute;
    width: 7px;
    height: 7px;
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
  }
  .tooltip[data-placement='right']::before {
    left: -5px;
    top: calc(var(--arrow-offset) - 4px);
    border-top: 0;
    border-right: 0;
  }
  .tooltip[data-placement='left']::before {
    right: -5px;
    top: calc(var(--arrow-offset) - 4px);
    border-bottom: 0;
    border-left: 0;
  }
  .tooltip[data-placement='top']::before {
    bottom: -5px;
    left: calc(var(--arrow-offset) - 4px);
    border-top: 0;
    border-left: 0;
  }
  .tooltip[data-placement='bottom']::before {
    top: -5px;
    left: calc(var(--arrow-offset) - 4px);
    border-bottom: 0;
    border-right: 0;
  }
`;
