import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';
import {INPUT_LINE_HEIGHT_RATIO} from '../includes/helpers.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      display: block;
    }

    .wrapper {
      box-sizing: border-box;
      color: var(--vscode-foreground, #cccccc);
      cursor: default;
      display: block;
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(
        --vsc-form-control-font-size,
        var(--vscode-font-size, 13px)
      );
      font-weight: 600;
      line-height: ${INPUT_LINE_HEIGHT_RATIO};
      padding: 5px 0;
    }

    :host([size='small']) {
      --vsc-form-control-font-size: 11px;
    }

    :host([size='large']) {
      --vsc-form-control-font-size: 15px;
    }

    :host([size='small']) .wrapper {
      height: 16px;
      line-height: 14px;
      padding: 1px 0;
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
