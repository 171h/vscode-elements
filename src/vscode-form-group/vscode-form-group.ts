import {html, TemplateResult} from 'lit';
import {property} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {FormControlSize} from '../includes/form-control-size.js';
import styles from './vscode-form-group.styles.js';

export type FormGroupVariant = 'horizontal' | 'vertical' | 'settings-group';

export type FormGroupSize = FormControlSize;

/**
 * @tag vscode-form-group
 *
 * @cssprop [--label-width=150px] - 水平模式中的标签宽度
 * @cssprop [--label-right-margin=14px] - 水平模式中的标签右侧间距
 * @cssprop [--vsc-form-control-font-size] - 插槽中表单控件的字号，由 `size` 属性自动设置。
 */
@customElement('vscode-form-group')
export class VscodeFormGroup extends VscElement {
  static override styles = styles;

  @property({reflect: true})
  variant: FormGroupVariant = 'horizontal';

  /**
   * 表单组尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormGroupSize = 'medium';

  override render(): TemplateResult {
    return html`
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-form-group': VscodeFormGroup;
  }
}
