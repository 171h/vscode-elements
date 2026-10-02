import {html, nothing, PropertyValueMap, TemplateResult} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {FormControlSize} from '../includes/form-control-size.js';
import '../vscode-icon/index.js';
import styles from './vscode-button.styles.js';
import {ifDefined} from 'lit/directives/if-defined.js';

/**
 * 用于触发操作的可点击元素。
 *
 * @tag vscode-button
 *
 * @cssprop [--vscode-button-background=#0078d4]
 * @cssprop [--vscode-button-foreground=#ffffff]
 * @cssprop [--vscode-button-border=var(--vscode-button-background, rgba(255, 255, 255, 0.07))]
 * @cssprop [--vscode-button-hoverBackground=#026ec1]
 * @cssprop [--vscode-font-family=sans-serif] - 无衬线字体，具体字体取决于宿主操作系统。
 * @cssprop [--vscode-font-size=13px]
 * @cssprop [--vscode-font-weight=normal]
 * @cssprop [--vscode-button-secondaryForeground=#cccccc]
 * @cssprop [--vscode-button-secondaryBackground=#313131]
 * @cssprop [--vscode-button-secondaryHoverBackground=#3c3c3c]
 * @cssprop [--vscode-focusBorder=#0078d4]
 * @cssprop [--vsc-form-control-font-size=var(--vscode-font-size, 13px)] - 按钮标签字号，由 `size` 属性自动设置。
 *
 * @csspart base - 组件的主要内容区域。
 *
 * @slot content-before - 主内容前的插槽。
 * @slot content-after - 主内容后的插槽。
 */
@customElement('vscode-button')
export class VscodeButton extends VscElement {
  static override styles = styles;

  /** @internal */
  static formAssociated = true;

  @property({type: Boolean, reflect: true})
  override autofocus = false;

  /** @internal */
  @property({type: Number, reflect: true})
  override tabIndex = 0;

  /**
   * 使用较弱的视觉强调样式。
   */
  @property({type: Boolean, reflect: true})
  secondary = false;

  /**
   * 使按钮填满容器，并使用 VS Code 的块级尺寸，
   * 类似源代码管理中的“提交”操作。
   */
  @property({type: Boolean, reflect: true})
  block = false;

  /** @internal */
  @property({reflect: true})
  override role = 'button';

  @property({type: Boolean, reflect: true})
  disabled = false;

  /**
   * 按钮尺寸，默认为 `medium`。
   */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * 标签前的 [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) 图标
   */
  @property()
  icon = '';

  /**
   * 前置图标的旋转属性
   */
  @property({type: Boolean, reflect: true, attribute: 'icon-spin'})
  iconSpin? = false;

  /**
   * 前置图标的旋转时长
   */
  @property({type: Number, reflect: true, attribute: 'icon-spin-duration'})
  iconSpinDuration?: number;

  /**
   * 标签后的 [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) 图标
   */
  @property({attribute: 'icon-after'})
  iconAfter = '';

  /**
   * 后置图标的旋转属性
   */
  @property({type: Boolean, reflect: true, attribute: 'icon-after-spin'})
  iconAfterSpin = false;

  /**
   * 后置图标的旋转时长
   */
  @property({
    type: Number,
    reflect: true,
    attribute: 'icon-after-spin-duration',
  })
  iconAfterSpinDuration?: number;

  @property({type: Boolean, reflect: true})
  focused = false;

  @property({type: String, reflect: true})
  name: string | undefined = undefined;

  @property({type: Boolean, reflect: true, attribute: 'icon-only'})
  iconOnly = false;

  @property({reflect: true})
  type: 'submit' | 'reset' | 'button' = 'button';

  @property()
  value = '';

  private _prevTabindex = 0;
  private _internals: ElementInternals;

  @state()
  private _hasContentBefore = false;

  @state()
  private _hasContentAfter = false;

  get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  constructor() {
    super();
    this.addEventListener('keydown', this._handleKeyDown.bind(this));
    this.addEventListener('click', this._handleClick.bind(this));
    this._internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.autofocus) {
      if (this.tabIndex < 0) {
        this.tabIndex = 0;
      }

      this.updateComplete.then(() => {
        this.focus();
        this.requestUpdate();
      });
    }

    this.addEventListener('focus', this._handleFocus);
    this.addEventListener('blur', this._handleBlur);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focus', this._handleFocus);
    this.removeEventListener('blur', this._handleBlur);
  }

  override update(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.update(changedProperties);

    if (changedProperties.has('value')) {
      this._internals.setFormValue(this.value);
    }

    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        // 保存可能被用户修改过的原始 tabIndex。
        this._prevTabindex = this.tabIndex;
        // 这是原生属性，无需触发重新渲染。
        // eslint-disable-next-line lit/no-property-change-update
        this.tabIndex = -1;
      } else {
        // eslint-disable-next-line lit/no-property-change-update
        this.tabIndex = this._prevTabindex;
      }
    }
  }

  private _executeAction() {
    if (this.type === 'submit' && this._internals.form) {
      this._internals.form.requestSubmit();
    }

    if (this.type === 'reset' && this._internals.form) {
      this._internals.form.reset();
    }
  }

  private _handleKeyDown(event: KeyboardEvent) {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      !this.hasAttribute('disabled')
    ) {
      const syntheticClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }) as Event & {synthetic?: boolean};

      syntheticClick.synthetic = true;
      this.dispatchEvent(syntheticClick);

      this._executeAction();
    }
  }

  private _handleClick(event: MouseEvent) {
    if ((event as MouseEvent & {synthetic?: boolean}).synthetic) {
      return;
    }
    if (!this.hasAttribute('disabled')) {
      this._executeAction();
    }
  }

  private _handleFocus = () => {
    this.focused = true;
  };

  private _handleBlur = () => {
    this.focused = false;
  };

  private _handleSlotChange(ev: Event) {
    const slot = ev.target as HTMLSlotElement;

    if (slot.name === 'content-before') {
      this._hasContentBefore = slot.assignedElements().length > 0;
    }

    if (slot.name === 'content-after') {
      this._hasContentAfter = slot.assignedElements().length > 0;
    }
  }

  override render(): TemplateResult {
    const hasIcon = this.icon !== '';
    const hasIconAfter = this.iconAfter !== '';
    const iconSize =
      this.size === 'small' ? 14 : this.size === 'large' ? 20 : 16;
    const baseClasses = {
      base: true,
      'icon-only': this.iconOnly,
      'has-content-before': this._hasContentBefore,
      'has-content-after': this._hasContentAfter,
    };

    const iconElem = hasIcon
      ? html`<vscode-icon
          name=${this.icon}
          .size=${iconSize}
          ?spin=${this.iconSpin}
          spin-duration=${ifDefined(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`
      : nothing;

    const iconAfterElem = hasIconAfter
      ? html`<vscode-icon
          name=${this.iconAfter}
          .size=${iconSize}
          ?spin=${this.iconAfterSpin}
          spin-duration=${ifDefined(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`
      : nothing;

    return html`
      <div
        class=${classMap(baseClasses)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${iconElem}
        <slot></slot>
        ${iconAfterElem}
        <slot name="content-after"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-button': VscodeButton;
  }
}
