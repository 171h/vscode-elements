import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';
import baseStyles from '../includes/form-button-widget/base.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  baseStyles,
  css`
    :host(:invalid) .icon,
    :host([invalid]) .icon {
      background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    .icon {
      border-radius: 3px;
    }

    .indeterminate-icon {
      background-color: currentColor;
      position: absolute;
      height: 1px;
      width: 67%;
    }

    .check-icon {
      height: 100%;
      width: 100%;
    }

    :host(:focus):host(:not([disabled])) .icon {
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: -1px;
    }

    /* Toggle appearance */
    :host([toggle]) .icon {
      /* Track */
      width: 36px;
      height: 18px;
      border-radius: 999px;
      background-color: var(--vscode-button-secondaryBackground, #313131);
      border-color: var(--vscode-button-border, transparent);
      justify-content: flex-start;
      position: absolute;
    }

    :host(:focus):host([toggle]):host(:not([disabled])) .icon {
      outline-offset: 2px;
    }

    /* Reserve space for the wider toggle track so text doesn't overlap */
    :host([toggle]) .label-inner {
      padding-left: 45px; /* 36px track + 9px spacing */
    }

    :host([toggle]) .thumb {
      /* Thumb */
      box-sizing: border-box;
      display: block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: var(--vscode-button-secondaryForeground, #cccccc);
      margin-left: 1px;
      transition: transform 120ms ease-in-out;
    }

    :host([toggle][checked]) .icon {
      background-color: var(--vscode-button-background, #04395e);
      border-color: var(--vscode-button-border, transparent);
    }

    :host([toggle][checked]) .thumb {
      transform: translateX(19px);
      background-color: var(--vscode-button-foreground, #ffffff);
    }

    :host([toggle]):host(:invalid) .icon {
      background-color: var(--vscode-inputValidation-errorBackground, #5a1d1d);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    :host([toggle]):host(:invalid) .thumb {
      background-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    :host([toggle]) .check-icon,
    :host([toggle]) .indeterminate-icon {
      display: none;
    }

    :host([toggle]:focus):host(:not([disabled])) .icon {
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: -1px;
    }

    :host([size='small'][toggle]) .icon {
      height: 14px;
      width: 28px;
    }

    :host([size='small'][toggle]) .label-inner {
      padding-left: 37px;
    }

    :host([size='small'][toggle]) .thumb {
      height: 10px;
      width: 10px;
    }

    :host([size='small'][toggle][checked]) .thumb {
      transform: translateX(15px);
    }

    :host([size='large'][toggle]) .icon {
      height: 20px;
      width: 40px;
    }

    :host([size='large'][toggle]) .label-inner {
      padding-left: 49px;
    }

    :host([size='large'][toggle]) .thumb {
      height: 16px;
      width: 16px;
    }

    :host([size='large'][toggle][checked]) .thumb {
      transform: translateX(21px);
    }
  `,
];

export default styles;
