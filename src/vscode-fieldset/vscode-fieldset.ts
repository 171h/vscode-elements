import {css, html, nothing, PropertyValues, TemplateResult} from 'lit';
import {property, query} from 'lit/decorators.js';
import {FormControlSize} from '../includes/form-control-size.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import defaultStyles from '../includes/default.styles.js';
import {installFieldsetStyles} from '../includes/fieldset.styles.js';
import '../vscode-checkbox/index.js';
import type {VscodeCheckbox} from '../vscode-checkbox/index.js';

/**
 * What happens to the content while the checkbox of a `vscode-fieldset` is
 * unchecked.
 *
 * - `visible`: the content is disabled but stays visible.
 * - `collapsed`: the content is hidden, the legend and the border stay visible.
 * - `minimal`: the content, the legend and the border are hidden, only the
 *   checkbox and its label stay visible.
 */
export type FieldsetUncheckedMode = 'visible' | 'collapsed' | 'minimal';

export type VscFieldsetCheckedChangeEvent = CustomEvent<{checked: boolean}>;

/**
 * Called when the checkbox is toggled. Return `false` to keep the component
 * from applying the default behavior of the current `unchecked-mode`.
 */
export type FieldsetCheckedChangeCallback = (
  checked: boolean
) => boolean | void;

const COLLAPSED_ATTR = 'data-vsc-collapsed';
const DURATION = 180;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * A movable sidebar view. Supply a native fieldset with a legend in the default slot.
 *
 * Add the `checkbox` attribute to show a checkbox on the top-right corner of the
 * border, aligned with the legend. The checkbox controls the disabled state of
 * the content and, depending on `unchecked-mode`, its visibility. Height changes
 * are animated, unless the user prefers reduced motion.
 *
 * @tag vscode-fieldset
 *
 * @slot - Native fieldset, legend and arbitrary form controls or content.
 *
 * @fires {VscFieldsetCheckedChangeEvent} vsc-fieldset-checked-change - Cancelable event dispatched when the checkbox is toggled. Call `preventDefault()` to skip the default behavior.
 *
 * @cssprop --vscode-sideBar-background
 * @cssprop --vscode-sideBar-foreground
 * @cssprop --vscode-sideBarSectionHeader-foreground
 * @cssprop --vscode-sideBarSectionHeader-border
 * @cssprop --vscode-contrastBorder
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-disabledForeground
 * @cssprop [--vsc-form-control-border-radius=4px] - Border radius; small uses 1px and large uses 6px.
 *
 * @csspart checkbox - Container of the checkbox placed on the border.
 */
@customElement('vscode-fieldset')
export class VscodeFieldset extends VscElement {
  /** The fieldset size, matching the project's form controls. */
  @property({reflect: true})
  size: FormControlSize = 'medium';

  /**
   * Shows a checkbox on the top-right corner of the border. The checkbox
   * enables the content and applies the `unchecked-mode` behavior.
   */
  @property({type: Boolean, reflect: true})
  checkbox = false;

  /**
   * Label of the checkbox. It is empty by default.
   */
  @property({attribute: 'checkbox-label'})
  checkboxLabel = '';

  /**
   * Checked state of the checkbox. The content is enabled while it is checked.
   */
  @property({type: Boolean, reflect: true})
  checked = false;

  /**
   * Presentation of the content while the checkbox is unchecked. See
   * `FieldsetUncheckedMode` for the accepted values.
   */
  @property({attribute: 'unchecked-mode', reflect: true})
  uncheckedMode: FieldsetUncheckedMode = 'visible';

  /**
   * Optional callback invoked when the checkbox is toggled, in addition to the
   * `vsc-fieldset-checked-change` event. Return `false` to skip the default
   * behavior. Set the property directly, it has no attribute.
   */
  @property({attribute: false})
  checkedChange?: FieldsetCheckedChangeCallback = undefined;

  @query('vscode-checkbox')
  private _checkboxEl?: VscodeCheckbox;

  private _trackedFieldset?: HTMLFieldSetElement;

  private _initialDisabled: boolean | undefined;

  private _suppressDefault = false;

  private _rendered = false;

  private _animations: Animation[] = [];

  private _generation = 0;

  static override styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        min-width: 0;
        position: relative;
      }

      /* Zero height row, so the checkbox overlaps the top border. The
         checkbox is centered on the legend, which is where the top border
         is drawn. */
      .checkbox-row {
        display: flex;
        height: 0;
        justify-content: flex-end;
        position: relative;
        z-index: 1;
      }

      .checkbox-row vscode-checkbox {
        position: absolute;
        right: 10px;
        top: 13px;
        transform: translateY(-50%);
        white-space: nowrap;
      }

      :host([data-vsc-collapsed][unchecked-mode='minimal']) {
        min-height: 26px;
      }
    `,
  ];

  /** The native fieldset placed in the default slot. */
  get fieldsetElement(): HTMLFieldSetElement | null {
    return this.querySelector('fieldset');
  }

  override connectedCallback() {
    super.connectedCallback();
    installFieldsetStyles(this);
  }

  override updated(changed: PropertyValues): void {
    if (
      !this._rendered ||
      changed.has('checked') ||
      changed.has('checkbox') ||
      changed.has('uncheckedMode')
    ) {
      const animate = this._rendered;

      this._rendered = true;
      if (this._suppressDefault) {
        this._suppressDefault = false;
      } else {
        this._syncCheckedState(animate);
      }
    } else {
      this._rendered = true;
    }
  }

  private _onSlotChange() {
    this._syncCheckedState(false);
  }

  private _onCheckboxChange() {
    const checked = this._checkboxEl?.checked ?? false;
    const allowed = this.dispatchEvent(
      new CustomEvent('vsc-fieldset-checked-change', {
        detail: {checked},
        bubbles: true,
        composed: true,
        cancelable: true,
      }) as VscFieldsetCheckedChangeEvent
    );

    if (!allowed || this.checkedChange?.(checked) === false) {
      this._suppressDefault = true;
    }
    this.checked = checked;
  }

  private _uncheckedMode(): FieldsetUncheckedMode {
    return this.uncheckedMode === 'collapsed' ||
      this.uncheckedMode === 'minimal'
      ? this.uncheckedMode
      : 'visible';
  }

  private _syncCheckedState(animate: boolean) {
    const fieldset = this.fieldsetElement;

    if (!fieldset) {
      return;
    }
    if (fieldset !== this._trackedFieldset) {
      this._trackedFieldset = fieldset;
      this._initialDisabled = undefined;
    }
    if (this._initialDisabled === undefined) {
      this._initialDisabled = fieldset.disabled;
    }
    if (this._checkboxEl) {
      this._checkboxEl.disabled = this._initialDisabled;
    }
    if (!this.checkbox) {
      this._stopAnimation();
      this.removeAttribute(COLLAPSED_ATTR);
      this._clearAnimationStyles(fieldset);
      fieldset.disabled = this._initialDisabled;
      return;
    }
    fieldset.disabled = this._initialDisabled || !this.checked;

    const mode = this._uncheckedMode();

    if (!this.checked && mode === 'minimal') {
      this._collapseMinimal(fieldset, animate);
    } else if (!this.checked && mode === 'collapsed') {
      this._collapseFieldset(fieldset, animate);
    } else {
      this._expand(fieldset, animate);
    }
  }

  /**
   * Hides the fieldset content by collapsing it to the height of its header.
   * The fieldset height is animated, so the border and the legend stay in
   * place while the content is clipped.
   */
  private _collapseFieldset(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const start = fieldset.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles(fieldset);
    this.setAttribute(COLLAPSED_ATTR, '');
    const end = fieldset.getBoundingClientRect().height;

    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      this.setAttribute(COLLAPSED_ATTR, '');
      return;
    }
    const generation = this._generation;

    fieldset.style.overflow = 'hidden';
    fieldset.style.height = `${start}px`;
    const animation = fieldset.animate(
      [{height: `${start}px`}, {height: `${end}px`}],
      {duration: DURATION, easing: 'ease', fill: 'forwards'}
    );

    this._finish(animation, generation, () => {
      this.setAttribute(COLLAPSED_ATTR, '');
      this._clearAnimationStyles(fieldset);
    });
  }

  /**
   * Minimal mode keeps only the checkbox. The host height and the fieldset
   * opacity are animated, so the header disappears while the checkbox slides
   * into the space of the collapsed component.
   */
  private _collapseMinimal(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const start = this.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles(fieldset);
    this.setAttribute(COLLAPSED_ATTR, '');
    const end = this.getBoundingClientRect().height;

    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      this.setAttribute(COLLAPSED_ATTR, '');
      return;
    }
    const generation = this._generation;
    const options: KeyframeAnimationOptions = {
      duration: DURATION,
      easing: 'ease',
      fill: 'forwards',
    };

    this.style.overflow = 'hidden';
    this.style.height = `${start}px`;
    this._finish(
      this.animate([{height: `${start}px`}, {height: `${end}px`}], options),
      generation,
      () => {
        this.setAttribute(COLLAPSED_ATTR, '');
        this._clearAnimationStyles(fieldset);
      }
    );
    this._finish(
      fieldset.animate([{opacity: '1'}, {opacity: '0'}], options),
      generation
    );
  }

  /** Restores the content and animates the fieldset back to its full height. */
  private _expand(fieldset: HTMLFieldSetElement, animate: boolean) {
    if (!this.hasAttribute(COLLAPSED_ATTR) && !this._animations.length) {
      return;
    }
    const minimal = this.uncheckedMode === 'minimal';
    const hostStart = this.getBoundingClientRect().height;
    const fieldsetStart = fieldset.getBoundingClientRect().height;

    this._stopAnimation();
    this._clearAnimationStyles(fieldset);
    this.removeAttribute(COLLAPSED_ATTR);
    if (!animate || this._reducedMotion()) {
      return;
    }
    const generation = this._generation;
    const options: KeyframeAnimationOptions = {
      duration: DURATION,
      easing: 'ease',
      fill: 'forwards',
    };

    if (minimal) {
      const end = this.getBoundingClientRect().height;

      this.style.overflow = 'hidden';
      this.style.height = `${hostStart}px`;
      this._finish(
        this.animate(
          [{height: `${hostStart}px`}, {height: `${end}px`}],
          options
        ),
        generation,
        () => this._clearAnimationStyles(fieldset)
      );
      this._finish(
        fieldset.animate([{opacity: '0'}, {opacity: '1'}], options),
        generation
      );
    } else {
      const end = fieldset.getBoundingClientRect().height;

      fieldset.style.overflow = 'hidden';
      fieldset.style.height = `${fieldsetStart}px`;
      this._finish(
        fieldset.animate(
          [{height: `${fieldsetStart}px`}, {height: `${end}px`}],
          options
        ),
        generation,
        () => this._clearAnimationStyles(fieldset)
      );
    }
  }

  /** Keeps the animation list and the settle callback in sync. */
  private _finish(
    animation: Animation,
    generation: number,
    settle?: () => void
  ) {
    this._animations.push(animation);
    animation.finished
      .then(() => {
        animation.cancel();
        this._animations = this._animations.filter(
          (item) => item !== animation
        );
        if (this._generation !== generation) {
          return;
        }
        settle?.();
      })
      .catch(() => undefined);
  }

  private _stopAnimation() {
    this._generation += 1;
    this._animations.forEach((animation) => animation.cancel());
    this._animations = [];
  }

  private _clearAnimationStyles(fieldset: HTMLFieldSetElement) {
    this.style.removeProperty('height');
    this.style.removeProperty('overflow');
    fieldset.style.removeProperty('height');
    fieldset.style.removeProperty('overflow');
  }

  private _reducedMotion() {
    return matchMedia(REDUCED_MOTION).matches;
  }

  override render(): TemplateResult {
    return html`
      ${this.checkbox
        ? html`
            <div class="checkbox-row" part="checkbox">
              <vscode-checkbox
                label=${this.checkboxLabel}
                ?checked=${this.checked}
                @change=${this._onCheckboxChange}
              ></vscode-checkbox>
            </div>
          `
        : nothing}
      <slot @slotchange=${this._onSlotChange}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-fieldset': VscodeFieldset;
  }

  interface GlobalEventHandlersEventMap {
    'vsc-fieldset-checked-change': VscFieldsetCheckedChangeEvent;
  }
}
