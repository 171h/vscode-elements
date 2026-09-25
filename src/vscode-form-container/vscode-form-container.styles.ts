import {css, CSSResultGroup} from 'lit';
import defaultStyles from '../includes/default.styles.js';

const styles: CSSResultGroup = [
  defaultStyles,
  css`
    @keyframes vsc-form-dirty-fade {
      from {
        background-color: var(--vsc-form-dirty-color-peak);
        box-shadow: 0 0 0 6px var(--vsc-form-dirty-ring-color-peak);
      }
    }

    :host {
      --vsc-form-dirty-color: #2ea0431a;
      --vsc-form-dirty-color-peak: #2ea04340;
      --vsc-form-dirty-ring-color: #2ea04300;
      --vsc-form-dirty-ring-color-peak: #2ea04366;
      --vsc-form-dirty-border-radius: 4px;

      border-radius: var(--vsc-form-dirty-border-radius);
      box-shadow: 0 0 0 0 transparent;
      display: block;
      max-width: 727px;
      transition:
        background-color 320ms ease-out,
        box-shadow 320ms ease-out;
    }

    :host([hidden]) {
      display: none;
    }

    /*
     * The background color is applied only when the form is marked, so a form
     * that has never been modified keeps its original background.
     */
    :host([dirty]) {
      animation: vsc-form-dirty-fade var(--vsc-form-dirty-duration, 5000ms)
        cubic-bezier(0.33, 0, 0.67, 1) both;
      background-color: var(--vsc-form-dirty-color);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: none;
      }

      :host([dirty]) {
        animation: none;
      }
    }
  `,
];

export default styles;
