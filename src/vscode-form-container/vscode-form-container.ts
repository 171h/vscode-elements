import {html, PropertyValues, TemplateResult} from 'lit';
import {property, query, queryAssignedElements, state} from 'lit/decorators.js';
import {
  FOREVER,
  MarkDuration,
  toCssTime,
  toMilliseconds,
} from '../includes/form-mark-duration.js';
import {
  isMarkableFormControl,
  markFormControls,
  unmarkFormControls,
} from '../includes/form-control-dirty.styles.js';
import {customElement, VscElement} from '../includes/VscElement.js';
import {VscodeCheckboxGroup} from '../vscode-checkbox-group/index.js';
import {VscodeFormGroup, FormGroupVariant} from '../vscode-form-group/index.js';
import {VscodeRadioGroup} from '../vscode-radio-group/index.js';
import styles from './vscode-form-container.styles.js';

enum FormGroupLayout {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

type CheckboxOrRadioGroup = VscodeRadioGroup | VscodeCheckboxGroup;

/**
 * How long the modified state of a form is highlighted. A number is
 * interpreted as milliseconds, a string as CSS time, e.g. `2500` or `'2.5s'`.
 * The `forever` value keeps the highlight until another modified form or a
 * `reset()` call removes it.
 */
export type FormMarkDuration = MarkDuration | typeof FOREVER;

/**
 * The automatic marking ignores a new modification for this long. The events
 * which belong to the same keystroke, and the keystrokes which follow each
 * other quickly, would otherwise restart the countdown on every event, so the
 * countdown is restarted about twice a second at the most.
 *
 * The delay is shortened by {@link VscodeFormContainer._automaticMarkDelay}
 * when the duration of the state is shorter, otherwise the countdown would
 * expire before a new modification is able to restart it and the state would
 * blink while the user types.
 */
const RE_MARK_DELAY = 500;

/**
 * The animation length of the durations which cannot be expressed as a CSS
 * time, about a day. It is not an infinite animation: the colors are resolved
 * from the keyframes and the animation rests on the peak color, so a
 * `forever` state is visible and it is removed only by another modified form
 * or by `reset()`.
 */
const UNBOUNDED_DURATION = 86400000;

/**
 * The state of a single `vscode-form-container` at the time of the query.
 */
export interface FormState {
  /** The form container itself. */
  element: VscodeFormContainer;
  /** The `id` attribute of the container, or an empty string. */
  id: string;
  /** The `name` attribute of the container, or an empty string. */
  name: string;
  /** Whether the form is currently highlighted as modified. */
  dirty: boolean;
  /** The duration used when the form is marked as modified. */
  markDuration: FormMarkDuration;
}

/**
 * Detail of the `vsc-dirty-change` event, dispatched when the modified
 * highlight of a form is turned on or off.
 */
export interface FormDirtyChangeDetail {
  form: VscodeFormContainer;
  dirty: boolean;
}

/** Every form container that has been connected, in creation order. */
const formMarkRegistry = new Set<VscodeFormContainer>();

const collectFormContainers = (
  root: Document | ShadowRoot | Element,
  result: Set<VscodeFormContainer> = new Set()
): Set<VscodeFormContainer> => {
  // The walk starts below the root, so the root itself is not returned by the
  // tree walker.
  if (root instanceof VscodeFormContainer) {
    result.add(root);
  }

  const treeWalker = document.createTreeWalker(
    root as Node,
    NodeFilter.SHOW_ELEMENT
  );

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode as Element;

    if (node instanceof VscodeFormContainer) {
      result.add(node);
    }

    if (node.shadowRoot) {
      collectFormContainers(node.shadowRoot, result);
    }
  }

  return result;
};

const isInRoot = (
  form: VscodeFormContainer,
  root: Document | ShadowRoot | Element
): boolean => {
  if (root instanceof Document) {
    return form.isConnected && form.getRootNode() === root;
  }

  return root.contains(form);
};

/**
 * @tag vscode-form-container
 *
 * The modified state of the form is shown on its controls with a light blue
 * wash. The colors follow the kind of the VS Code theme: `#eff3ff` is the
 * resting color of the light themes, the dark and the high contrast themes use
 * a color of the same hue with the lightness of their surfaces. A control
 * which shows an error keeps its error colors, the modified state is not
 * painted on it.
 *
 * @fires {CustomEvent<FormDirtyChangeDetail>} vsc-dirty-change - Dispatched when the modified state of the form changes, and not when the countdown of an already modified form is restarted. The event does not bubble, its `detail` contains the `form` and the new `dirty` value. The state of a modified form which is removed from the DOM becomes `false` and the event is dispatched as well.
 * @cssprop [--vsc-form-control-dirty-background=#eff3ff] - Resting background color of the modified form controls
 * @cssprop [--vsc-form-control-dirty-background-peak=#dbe4ff] - Background color of the modified form controls at the beginning of the animation
 * @cssprop [--vsc-form-control-dirty-border-color=#93a9f0] - Border color of the modified form controls
 * @cssprop [--vsc-form-control-dirty-ring-color=#6784de] - Ring color of the modified checkbox and radio buttons
 * @cssprop [--vsc-form-control-dirty-duration=5000ms] - Length of the animation of the modified controls. It is written on the container from the `markDuration` property, so a value of an ancestor of the container does not apply. The countdown of the state follows `markDuration` as well.
 */
@customElement('vscode-form-container')
export class VscodeFormContainer extends VscElement {
  static override styles = styles;

  /** Duration of the highlight when the `mark-duration` attribute is absent. */
  static defaultMarkDuration: FormMarkDuration = 5000;

  /**
   * Every form container of a root with its current modified state. The nested
   * form containers are included as well, and the root itself when it is a
   * form container. A `Document` returns the forms of the document, the forms
   * of a shadow root are returned when the shadow root is passed.
   *
   * The query walks the whole tree and it descends into the shadow roots, so it
   * is not cheap and it should not be called on a hot path.
   *
   * @param root Defaults to the whole document.
   */
  static getFormStates(
    root: Document | ShadowRoot | Element = document
  ): FormState[] {
    return [...collectFormContainers(root)]
      .filter((form) => form.isConnected && isInRoot(form, root))
      .map((form) => ({
        element: form,
        id: form.id,
        name: form.getAttribute('name') ?? '',
        dirty: form.dirty,
        markDuration: form.markDuration,
      }));
  }

  @property({type: Boolean, reflect: true})
  set responsive(isResponsive: boolean) {
    this._responsive = isResponsive;

    if (this._firstUpdateComplete) {
      if (isResponsive) {
        this._activateResponsiveLayout();
      } else {
        this._deactivateResizeObserver();
      }
    }
  }
  get responsive(): boolean {
    return this._responsive;
  }

  @property({type: Number})
  breakpoint = 490;

  /**
   * How long the form stays highlighted after it has been modified. A number
   * is interpreted as milliseconds, a string as CSS time (`'2.5s'`), the
   * `forever` value disables the automatic reset. A negative duration is
   * interpreted as zero. Defaults to
   * `VscodeFormContainer.defaultMarkDuration`, 5 seconds.
   *
   * An empty value, e.g. the bare `mark-duration` attribute, and the removal
   * of the attribute restore the default duration as well.
   */
  @property({
    attribute: 'mark-duration',
    converter: {
      fromAttribute: (value: string | null) =>
        value === null || value.trim() === ''
          ? VscodeFormContainer.defaultMarkDuration
          : value,
    },
  })
  markDuration: FormMarkDuration = VscodeFormContainer.defaultMarkDuration;

  /**
   * When the property is `false`, the form is not marked automatically on user
   * interaction. It can still be marked by calling `mark()`. The attribute is
   * `markable="false"` to turn the automatic marking off, and the state is not
   * written back to the DOM, so `vscode-form-container[markable]` matches the
   * containers with the attribute only.
   */
  @property({
    attribute: 'markable',
    converter: {
      fromAttribute: (value: string | null) => value !== 'false',
    },
  })
  markable = true;

  @state()
  private _dirty = false;

  private _resetTimer: ReturnType<typeof setTimeout> | null = null;

  private _lastMarkTime = -Infinity;

  /** Watches the form while it is modified, so its new controls join the state. */
  private _controlObserver: MutationObserver | null = null;

  private _firstUpdateComplete = false;

  private _resizeObserver!: ResizeObserver | null;

  @query('.wrapper')
  private _wrapperElement!: Element;

  @queryAssignedElements({selector: 'vscode-form-group'})
  private _assignedFormGroups!: VscodeFormGroup[];

  private _responsive = false;

  private _currentFormGroupLayout!: FormGroupLayout;

  /** Whether the form is currently highlighted as modified. */
  get dirty(): boolean {
    return this._dirty;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    formMarkRegistry.add(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    formMarkRegistry.delete(this);
    this._clearResetTimer();
    this._stopObservingControls();

    if (this._dirty) {
      this._dirty = false;
      unmarkFormControls(this);
      this._dispatchDirtyChange(false);
    }
  }

  override firstUpdated(): void {
    this._firstUpdateComplete = true;

    if (this._responsive) {
      this._activateResponsiveLayout();
    }

    // The state can be set before the element is rendered.
    this._reflectDirty();
    this._reflectMarkDuration();
  }

  override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('_dirty')) {
      this._reflectDirty();
    }

    if (changedProperties.has('markDuration')) {
      this._reflectMarkDuration();
    }
  }

  /**
   * Highlights the form as modified and starts the countdown of the reset.
   * Every other form of the same root is restored to its normal state
   * immediately. The call always restarts the countdown, the delay which
   * ignores the events of the automatic marking does not apply to it.
   *
   * The `vsc-dirty-change` event is dispatched only when the form was not
   * modified yet: the restart of the countdown does not change the state.
   */
  mark(): void {
    const wasDirty = this._dirty;

    this._lastMarkTime = performance.now();
    this._clearResetTimer();
    this._dirty = true;
    this._unmarkOthers();
    this._reflectDirty();
    this._observeControls();
    this._scheduleResetTimer();

    if (wasDirty) {
      return;
    }

    this._dispatchDirtyChangeWhenUpdated(true);
  }

  /**
   * Removes the modified highlight immediately and restores the normal state.
   */
  reset(): void {
    this._clearResetTimer();
    this._stopObservingControls();
    this._lastMarkTime = -Infinity;

    if (!this._dirty) {
      return;
    }

    this._dirty = false;
    this._reflectDirty();
    this._dispatchDirtyChangeWhenUpdated(false);
  }

  /**
   * The modified state is shown by the form controls of the form. The
   * container itself keeps its own background.
   */
  private _reflectDirty(): void {
    if (this._dirty) {
      markFormControls(this);
    } else {
      unmarkFormControls(this);
    }
  }

  /**
   * The controls which are added to the form while it is modified show the
   * state as well. The observer runs only while the state is on the screen.
   */
  private _observeControls(): void {
    if (this._controlObserver) {
      return;
    }

    this._controlObserver = new MutationObserver(() => {
      if (this._dirty) {
        markFormControls(this);
      }
    });

    this._controlObserver.observe(this, {childList: true, subtree: true});
  }

  private _stopObservingControls(): void {
    this._controlObserver?.disconnect();
    this._controlObserver = null;
  }

  /**
   * The animation of the modified state lasts as long as the state, so the
   * color changes gradually and the end of the countdown is visible.
   */
  private _reflectMarkDuration(): void {
    const cssTime = toCssTime(this.markDuration);

    this.style.setProperty(
      '--vsc-form-control-dirty-duration',
      cssTime ?? `${UNBOUNDED_DURATION}ms`
    );
  }

  private _dispatchDirtyChange(dirty: boolean): void {
    const detail: FormDirtyChangeDetail = {form: this, dirty};

    this.dispatchEvent(
      new CustomEvent<FormDirtyChangeDetail>('vsc-dirty-change', {
        detail,
        composed: true,
      })
    );
  }

  /**
   * The state is reflected to the DOM by the next update, so the event waits
   * for it as well.
   */
  private _dispatchDirtyChangeWhenUpdated(dirty: boolean): void {
    if (this._firstUpdateComplete) {
      this.requestUpdate();
      void this.updateComplete.then(() => this._dispatchDirtyChange(dirty));
    } else {
      this._dispatchDirtyChange(dirty);
    }
  }

  /**
   * A form restores only the forms that belong to the same root, so the
   * documents and the shadow roots do not interfere with each other.
   */
  private _unmarkOthers(): void {
    const root = this.getRootNode();

    for (const form of formMarkRegistry) {
      if (form !== this && form.dirty && form.getRootNode() === root) {
        form.reset();
      }
    }
  }

  private _scheduleResetTimer(): void {
    const milliseconds = toMilliseconds(this.markDuration);

    if (milliseconds === null) {
      return;
    }

    this._resetTimer = setTimeout(() => {
      this._resetTimer = null;
      this.reset();
    }, milliseconds);
  }

  private _clearResetTimer(): void {
    if (this._resetTimer === null) {
      return;
    }

    clearTimeout(this._resetTimer);
    this._resetTimer = null;
  }

  /**
   * Whether the event comes from a form control of this form. The nearest form
   * container owns a control, so the form does not mark itself when the event
   * comes from a control of a nested form container.
   */
  private _markableFormControl(ev: Event): boolean {
    if (!this.markable) {
      return false;
    }

    let controlWasFound = false;

    for (const node of ev.composedPath()) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      if (node.localName === 'vscode-form-container') {
        return node === this && controlWasFound;
      }

      if (isMarkableFormControl(node)) {
        controlWasFound = true;
      }
    }

    return false;
  }

  /**
   * The interval which ignores a new modification of the automatic marking.
   *
   * It is never longer than the half of the duration of the state: the
   * countdown is restarted before it can expire while the user keeps modifying
   * the form, so a duration which is shorter than `RE_MARK_DELAY` does not make
   * the state blink. A duration which never expires keeps the standard delay.
   */
  private _automaticMarkDelay(): number {
    const milliseconds = toMilliseconds(this.markDuration);

    return milliseconds === null
      ? RE_MARK_DELAY
      : Math.min(RE_MARK_DELAY, milliseconds / 2);
  }

  private _handleFormControlStateChange = (ev: Event): void => {
    if (!this._markableFormControl(ev)) {
      return;
    }

    // The events of a keystroke and the keystrokes which follow each other
    // quickly do not restart the countdown.
    if (
      this.dirty &&
      performance.now() - this._lastMarkTime < this._automaticMarkDelay()
    ) {
      return;
    }

    this.mark();
  };

  private _toggleCompactLayout(layout: FormGroupLayout) {
    this._assignedFormGroups.forEach((group) => {
      if (!group.dataset.originalVariant) {
        group.dataset.originalVariant = group.variant;
      }

      const oVariant = group.dataset.originalVariant as FormGroupVariant;

      if (layout === FormGroupLayout.VERTICAL && oVariant === 'horizontal') {
        group.variant = 'vertical';
      } else {
        group.variant = oVariant;
      }

      const checkboxOrRadioGroup = group.querySelectorAll(
        'vscode-checkbox-group, vscode-radio-group'
      ) as NodeListOf<CheckboxOrRadioGroup>;

      checkboxOrRadioGroup.forEach((widgetGroup) => {
        if (!widgetGroup.dataset.originalVariant) {
          widgetGroup.dataset.originalVariant = widgetGroup.variant;
        }

        const originalVariant = widgetGroup.dataset.originalVariant;

        if (
          layout === FormGroupLayout.HORIZONTAL &&
          originalVariant === FormGroupLayout.HORIZONTAL
        ) {
          widgetGroup.variant = 'horizontal';
        } else {
          widgetGroup.variant = 'vertical';
        }
      });
    });
  }

  private _resizeObserverCallback(entries: ResizeObserverEntry[]) {
    let wrapperWidth = 0;

    for (const entry of entries) {
      wrapperWidth = entry.contentRect.width;
    }

    const nextLayout: FormGroupLayout =
      wrapperWidth < this.breakpoint
        ? FormGroupLayout.VERTICAL
        : FormGroupLayout.HORIZONTAL;

    if (nextLayout !== this._currentFormGroupLayout) {
      this._toggleCompactLayout(nextLayout);
      this._currentFormGroupLayout = nextLayout;
    }
  }

  private _resizeObserverCallbackBound =
    this._resizeObserverCallback.bind(this);

  private _activateResponsiveLayout() {
    this._resizeObserver = new ResizeObserver(
      this._resizeObserverCallbackBound
    );
    this._resizeObserver.observe(this._wrapperElement);
  }

  private _deactivateResizeObserver() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  override render(): TemplateResult {
    return html`
      <div
        class="wrapper"
        @input=${this._handleFormControlStateChange}
        @change=${this._handleFormControlStateChange}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vscode-form-container': VscodeFormContainer;
  }
}
