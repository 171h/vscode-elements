import {css, html} from 'lit';
import {property} from 'lit/decorators.js';
import {FormControlSize} from '../includes/form-control-size.js';
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
 * @cssprop [--vsc-form-control-border-radius=4px] - Border radius; small uses 1px and large uses 6px.
 */
@customElement('vscode-fieldset')
export class VscodeFieldset extends VscElement {
  /** The fieldset size, matching the project's form controls. */
  @property({reflect: true})
  size: FormControlSize = 'medium';

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
