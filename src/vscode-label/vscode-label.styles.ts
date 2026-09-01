import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      display: block;
    }

    :host([size='small']),
    :host-context(vscode-form-group[size='small']) {
      --vsc-form-control-font-size: 11px;
    }

    :host([size='large']),
    :host-context(vscode-form-group[size='large']) {
      --vsc-form-control-font-size: 15px;
    }

    .wrapper {
      color: var(--vscode-foreground, #cccccc);
      cursor: default;
      display: block;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(
        --vsc-form-control-font-size,
        var(--vscode-font-size, 13px)
      );
      font-weight: 600;
      line-height: 16px;
      padding: 5px 0;
    }

    :host([size='small']) .wrapper,
    :host-context(vscode-form-group[size='small']) .wrapper {
      line-height: 12px;
      padding: 2px 0;
    }

    :host([size='large']) .wrapper,
    :host-context(vscode-form-group[size='large']) .wrapper {
      line-height: 20px;
      padding: 5px 0;
    }

    .wrapper.required:after {
      content: ' *';
    }

    ::slotted(.normal) {
      font-weight: normal;
    }

    ::slotted(.lightened) {
      color: var(--vscode-foreground, #cccccc);
      opacity: 0.9;
    }
  `,
];

export default styles;
