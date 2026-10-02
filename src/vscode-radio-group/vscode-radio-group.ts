import {html, TemplateResult} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {VscodeRadio} from '../vscode-radio/index.js';
import styles from './vscode-radio-group.styles.js';

/**
 * @tag vscode-radio-group
 *
 * @fires {Event} change - 子单选按钮变化时派发。
 */
@customElement('vscode-radio-group')
export class VscodeRadioGroup extends VscElement {
  static override styles = styles;

  //#region 属性

  @property({reflect: true})
  variant: 'horizontal' | 'vertical' = 'horizontal';

  /** @internal */
  @property({reflect: true})
  override role = 'radiogroup';

  //#endregion

  //#region 私有变量

  @queryAssignedElements({selector: 'vscode-radio'})
  private _radios!: VscodeRadio[];

  @state()
  private _focusedRadio = -1;

  @state()
  private _checkedRadio = -1;

  private _firstContentLoaded = false;

  //#endregion

  //#region 生命周期方法

  constructor() {
    super();

    this.addEventListener('keydown', this._handleKeyDown);
  }

  //#endregion

  //#region 私有方法

  private _uncheckPreviousChecked(prevChecked: number, prevFocused: number) {
    if (prevChecked !== -1) {
      this._radios[prevChecked].checked = false;
    }

    if (prevFocused !== -1) {
      this._radios[prevFocused].tabIndex = -1;
    }
  }

  private _afterCheck() {
    this._focusedRadio = this._checkedRadio;
    this._radios[this._checkedRadio].checked = true;
    this._radios[this._checkedRadio].tabIndex = 0;
    this._radios[this._checkedRadio].focus();
  }

  private _checkPrev() {
    const prevChecked = this._radios.findIndex((r) => r.checked);
    const prevFocused = this._radios.findIndex((r) => r.focused);
    const startPos = prevFocused !== -1 ? prevFocused : prevChecked;

    this._uncheckPreviousChecked(prevChecked, prevFocused);

    if (startPos === -1) {
      this._checkedRadio = this._radios.length - 1;
    } else if (startPos - 1 >= 0) {
      this._checkedRadio = startPos - 1;
    } else {
      this._checkedRadio = this._radios.length - 1;
    }

    this._afterCheck();
  }

  private _checkNext() {
    const prevChecked = this._radios.findIndex((r) => r.checked);
    const prevFocused = this._radios.findIndex((r) => r.focused);
    const startPos = prevFocused !== -1 ? prevFocused : prevChecked;

    this._uncheckPreviousChecked(prevChecked, prevFocused);

    if (startPos === -1) {
      this._checkedRadio = 0;
    } else if (startPos + 1 < this._radios.length) {
      this._checkedRadio = startPos + 1;
    } else {
      this._checkedRadio = 0;
    }

    this._afterCheck();
  }

  //#endregion

  //#region 事件处理

  private _handleKeyDown = (ev: KeyboardEvent) => {
    const {key} = ev;
    const listenedKeys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

    if (listenedKeys.includes(key)) {
      ev.preventDefault();
    } else {
      return;
    }

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      this._checkNext();
    }

    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      this._checkPrev();
    }

    const checkedRadio = this._radios.find((r) => r.checked);
    if (checkedRadio) {
      checkedRadio.dispatchEvent(
        new Event('change', {bubbles: true, composed: true})
      );
    }
  };

  private _handleChange(ev: CustomEvent) {
    const clickedIndex = this._radios.findIndex((r) => r === ev.target);

    if (clickedIndex !== -1) {
      if (this._focusedRadio !== -1) {
        this._radios[this._focusedRadio].tabIndex = -1;
      }

      if (this._checkedRadio !== -1 && this._checkedRadio !== clickedIndex) {
        this._radios[this._checkedRadio].checked = false;
      }

      this._focusedRadio = clickedIndex;
      this._checkedRadio = clickedIndex;
      this._radios[clickedIndex].tabIndex = 0;
    }
  }

  private _handleSlotChange() {
    if (!this._firstContentLoaded) {
      const autoFocusedRadio = this._radios.findIndex((r) => r.autofocus);

      if (autoFocusedRadio > -1) {
        this._focusedRadio = autoFocusedRadio;
      }

      this._firstContentLoaded = true;
    }

    let indexOfDefaultCheckedRadio = -1;

    this._radios.forEach((r, i) => {
      // 未设置 _focusedRadio 时，第一个单选按钮应可聚焦
      if (this._focusedRadio > -1) {
        r.tabIndex = i === this._focusedRadio ? 0 : -1;
      } else {
        r.tabIndex = i === 0 ? 0 : -1;
      }

      if (r.defaultChecked) {
        if (indexOfDefaultCheckedRadio > -1) {
          this._radios[indexOfDefaultCheckedRadio].defaultChecked = false;
        }

        indexOfDefaultCheckedRadio = i;
      }
    });

    if (indexOfDefaultCheckedRadio > -1) {
      this._radios[indexOfDefaultCheckedRadio].checked = true;
    }
  }

  //#endregion

  override render(): TemplateResult {
    return html`
      <div class="wrapper">
        <slot
          @slotchange=${this._handleSlotChange}
          @change=${this._handleChange}
        ></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-radio-group': VscodeRadioGroup;
  }
}
