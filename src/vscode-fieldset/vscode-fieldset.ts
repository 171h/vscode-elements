import {css, html} from 'lit';
import {customElement, VscElement} from '../includes/VscElement.js';

/**
 * A movable sidebar view. Supply a native fieldset with a legend in the default slot.
 * @tag vscode-fieldset
 * @slot - Native fieldset, legend and arbitrary form controls or content.
 */
@customElement('vscode-fieldset')
export class VscodeFieldset extends VscElement {
  static override styles = css`
    :host {
      display: block;
      min-width: 0;
    }
    ::slotted(fieldset) {
      min-width: 0;
      margin: 0;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-fieldset': VscodeFieldset;
  }
}
