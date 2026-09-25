import {css} from 'lit';

/**
 * The form controls which take part in the modified state of a
 * `vscode-form-container`. The `dirty` property is reflected as the `dirty`
 * attribute, which is the hook of the modified state styles.
 */
export interface MarkableFormControl extends HTMLElement {
  dirty: boolean;
}

/** The tag names of the form controls of a form container. */
export const MARKABLE_FORM_CONTROL_TAGS = [
  'vscode-checkbox',
  'vscode-multi-select',
  'vscode-radio',
  'vscode-single-select',
  'vscode-textarea',
  'vscode-textfield',
] as const;

/** The selector of the form controls of a form container. */
export const MARKABLE_FORM_CONTROL_SELECTOR =
  MARKABLE_FORM_CONTROL_TAGS.join(',');

/**
 * Marks the form controls of a form as modified.
 */
export const markFormControls = (form: HTMLElement): void => {
  const controls = form.querySelectorAll<MarkableFormControl>(
    MARKABLE_FORM_CONTROL_SELECTOR
  );

  controls.forEach((control) => {
    control.dirty = true;
  });
};

/**
 * Restores the form controls of a form to their normal state.
 */
export const unmarkFormControls = (form: HTMLElement): void => {
  const controls = form.querySelectorAll<MarkableFormControl>(
    MARKABLE_FORM_CONTROL_SELECTOR
  );

  controls.forEach((control) => {
    control.dirty = false;
  });
};

/**
 * The fading animation of the modified state, which the controls share. The
 * background fades from a stronger green to a subtle green, and it fades back
 * to the original background of the control when the state is removed.
 *
 * The custom properties come from the form container. The default is the last
 * member of the fallback chain, so a value of the container or of an ancestor
 * is never overridden.
 */
export const formControlDirtyVariables = css`
  @keyframes vsc-form-control-dirty-fade {
    from {
      background-color: var(
        --vsc-form-control-dirty-background-peak,
        rgba(46, 160, 67, 0.55)
      );
    }
  }
`;

/**
 * The modified state of a control which fills its whole surface, e.g. a
 * textfield, a textarea or a dropdown.
 *
 * Only the background is changed, so the border of a focused control keeps
 * the focus color.
 */
export const FORM_CONTROL_DIRTY_SURFACE_STYLES = css`
  :host([dirty]) .root,
  :host([dirty]) .combobox-face,
  :host([dirty]) .select-face,
  :host([dirty]) textarea {
    animation: vsc-form-control-dirty-fade
      var(--vsc-form-control-dirty-duration, 5000ms)
      cubic-bezier(0.33, 0, 0.67, 1) both;
    background-color: var(
      --vsc-form-control-dirty-background,
      rgba(46, 160, 67, 0.3)
    );
    transition:
      background-color 320ms ease-out,
      box-shadow 320ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([dirty]) .root,
    :host([dirty]) .combobox-face,
    :host([dirty]) .select-face,
    :host([dirty]) textarea {
      animation: none;
      transition: none;
    }
  }
`;

/**
 * The modified state of the small controls which draw the background on a box
 * instead of the whole surface, e.g. a checkbox or a radio button. The box is
 * translucent, so a ring carries the state as well.
 */
export const FORM_CONTROL_DIRTY_BOX_STYLES = css`
  @keyframes vsc-form-control-dirty-ring {
    from {
      box-shadow: 0 0 0 4px
        var(--vsc-form-control-dirty-ring-color, rgba(63, 185, 80, 0.45));
    }
  }

  :host([dirty]) .icon {
    animation:
      vsc-form-control-dirty-fade var(--vsc-form-control-dirty-duration, 5000ms)
        cubic-bezier(0.33, 0, 0.67, 1) both,
      vsc-form-control-dirty-ring var(--vsc-form-control-dirty-duration, 5000ms)
        cubic-bezier(0.33, 0, 0.67, 1) both;
    background-color: var(
      --vsc-form-control-dirty-background,
      rgba(46, 160, 67, 0.3)
    );
    border-color: var(
      --vsc-form-control-dirty-border-color,
      rgba(63, 185, 80, 0.5)
    );
    box-shadow: 0 0 0 2px
      var(--vsc-form-control-dirty-ring-color, rgba(63, 185, 80, 0.45));
    transition:
      background-color 320ms ease-out,
      border-color 320ms ease-out,
      box-shadow 320ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([dirty]) .icon {
      animation: none;
      transition: none;
    }
  }
`;
