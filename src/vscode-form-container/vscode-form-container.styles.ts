import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    :host {
      --vsc-form-control-dirty-duration: 5000ms;

      display: block;
      max-width: 727px;
    }
  `,
];

export default styles;
