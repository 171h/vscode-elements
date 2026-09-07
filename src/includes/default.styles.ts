import {css} from 'lit';

export default css`
  :host([size='small']) {
    --vsc-form-control-border-radius: 1px;
    --vsc-form-control-inner-border-radius: 1px;
  }

  :host([size='large']) {
    --vsc-form-control-border-radius: 6px;
    --vsc-form-control-inner-border-radius: 3px;
  }

  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;
