import {html, PropertyValues, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import styles from './vscode-option.styles.js';

/**
 * @tag vscode-option
 */
@customElement('vscode-option')
export class VscodeOption extends VscElement {
  static override styles = styles;

  @property({type: String})
  value?: string | undefined;

  /**
   * 标签缩写。
   *
   * 选项选中时，`vscode-multi-select` 的展示区域
   * 显示缩写而非标签。完整标签仍保留在
   * 选项列表和选中标签的工具提示中。
   */
  @property({type: String})
  abbreviation = '';

  @property({type: String})
  description = '';

  @property({type: Boolean, reflect: true})
  selected = false;

  @property({type: Boolean, reflect: true})
  disabled = false;

  private _initialized = false;

  override connectedCallback(): void {
    super.connectedCallback();

    this.updateComplete.then(() => {
      this._initialized = true;
    });
  }

  protected override willUpdate(changedProperties: PropertyValues): void {
    if (
      this._initialized &&
      (changedProperties.has('description') ||
        changedProperties.has('abbreviation') ||
        changedProperties.has('value') ||
        changedProperties.has('selected') ||
        changedProperties.has('disabled'))
    ) {
      /** @internal */
      this.dispatchEvent(new Event('vsc-option-state-change', {bubbles: true}));
    }
  }

  private _handleSlotChange = () => {
    if (this._initialized) {
      /** @internal */
      this.dispatchEvent(new Event('vsc-option-state-change', {bubbles: true}));
    }
  };

  override render(): TemplateResult {
    return html`<slot @slotchange=${this._handleSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-option': VscodeOption;
  }
}
