import {css, html} from 'lit';
import {customElement, VscElement} from '../includes/VscElement.js';
import defaultStyles from '../includes/default.styles.js';
import {installFieldsetStyles} from '../includes/fieldset.styles.js';

/**
 * A movable sidebar view. Supply a native fieldset with a legend in the default slot.
 * @tag vscode-fieldset
 * @slot - Native fieldset, legend and arbitrary form controls or content.
 * @cssprop --vscode-sideBar-background
 * @cssprop --vscode-sideBar-foreground
 * @cssprop --vscode-sideBarSectionHeader-foreground
 * @cssprop --vscode-sideBarSectionHeader-border
 * @cssprop --vscode-contrastBorder
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-disabledForeground
 */
@customElement('vscode-fieldset')
export class VscodeFieldset extends VscElement {
  static override styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
    `,
  ];

  override connectedCallback() {
    super.connectedCallback();
    installFieldsetStyles(this);
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-fieldset': VscodeFieldset;
  }
}
