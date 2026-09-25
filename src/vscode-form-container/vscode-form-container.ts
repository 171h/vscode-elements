import {html, PropertyValues, TemplateResult} from 'lit';
import {property, query, queryAssignedElements, state} from 'lit/decorators.js';
import {
  FOREVER,
  MarkDuration,
  toCssTime,
  toMilliseconds,
} from '../includes/form-mark-duration.js';
import {
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
 * Restarting the countdown on every keystroke would make the highlight
 * permanent while the user types, so a new mark is ignored for this long.
 */
const RE_MARK_DELAY = 500;

/**
 * Animation length for the durations that cannot be expressed as a CSS time,
 * effectively about a day.
 */
const FOREVER_DURATION = 86400000;

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
 * a color of the same hue with the lightness of their surfaces.
 *
 * @cssprop [--vsc-form-control-dirty-background=#eff3ff] - Resting background color of the modified form controls
 * @cssprop [--vsc-form-control-dirty-background-peak=#dbe4ff] - Background color of the modified form controls at the beginning of the animation
 * @cssprop [--vsc-form-control-dirty-border-color=#93a9f0] - Border color of the modified form controls
 * @cssprop [--vsc-form-control-dirty-ring-color=#6784de] - Ring color of the modified checkbox and radio buttons
 * @cssprop [--vsc-form-control-dirty-duration=5000ms] - Duration of the modified state, it is set automatically by the `markDuration` property
 */
@customElement('vscode-form-container')
export class VscodeFormContainer extends VscElement {
  static override styles = styles;

  /** Duration of the highlight when the `mark-duration` attribute is absent. */
  static defaultMarkDuration: FormMarkDuration = 5000;

  /**
   * Every form container of a root with its current modified state. The nested
   * form containers are included as well.
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
   * `forever` value disables the automatic reset. Defaults to
   * `VscodeFormContainer.defaultMarkDuration`, 5 seconds.
   */
  @property({attribute: 'mark-duration', reflect: true})
  markDuration: FormMarkDuration = VscodeFormContainer.defaultMarkDuration;

  /**
   * When the property is `false`, the form is not marked automatically on user
   * interaction. It can still be marked by calling `mark()`.
   */
  @property({
    attribute: 'markable',
    converter: {
      fromAttribute: (value: string | null) => value !== 'false',
      toAttribute: (value: boolean) => (value ? '' : 'false'),
    },
    reflect: true,
  })
  markable = true;

  @state()
  private _dirty = false;

  private _resetTimer: ReturnType<typeof setTimeout> | null = null;

  private _lastMarkTime = -Infinity;

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
    this._dirty = false;
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
   * Every other form of the page is restored to its normal state immediately.
   */
  mark(): void {
    if (this.dirty && performance.now() - this._lastMarkTime < RE_MARK_DELAY) {
      return;
    }

    this._lastMarkTime = performance.now();
    this._clearResetTimer();
    this._dirty = true;
    this._unmarkOthers();
    this._reflectDirty();
    this._scheduleResetTimer();

    if (this._firstUpdateComplete) {
      this.requestUpdate();
      void this.updateComplete.then(() => this._dispatchDirtyChange(true));
    } else {
      this._dispatchDirtyChange(true);
    }
  }

  /**
   * Removes the modified highlight immediately and restores the normal state.
   */
  reset(): void {
    this._clearResetTimer();
    this._lastMarkTime = -Infinity;

    if (!this._dirty) {
      return;
    }

    this._dirty = false;
    this._reflectDirty();

    if (this._firstUpdateComplete) {
      this.requestUpdate();
      void this.updateComplete.then(() => this._dispatchDirtyChange(false));
    } else {
      this._dispatchDirtyChange(false);
    }
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
   * The animation of the modified state lasts as long as the state, so the
   * color changes gradually and the end of the countdown is visible.
   */
  private _reflectMarkDuration(): void {
    const cssTime = toCssTime(this.markDuration);

    this.style.setProperty(
      '--vsc-form-control-dirty-duration',
      cssTime ?? `${FOREVER_DURATION}ms`
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

  private _markableFormControl(ev: Event): boolean {
    if (!this.markable) {
      return false;
    }

    for (const node of ev.composedPath()) {
      if (node === this) {
        return false;
      }

      if (node instanceof HTMLElement) {
        const tagName = node.tagName.toLowerCase();

        if (
          tagName.startsWith('vscode-') &&
          !tagName.endsWith('-group') &&
          !tagName.endsWith('-button')
        ) {
          return true;
        }

        if (
          tagName === 'input' ||
          tagName === 'select' ||
          tagName === 'textarea'
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private _handleFormControlStateChange = (ev: Event): void => {
    if (this._markableFormControl(ev)) {
      this.mark();
    }
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
