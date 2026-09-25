import {css, CSSResultGroup, unsafeCSS} from 'lit';

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

const MARKABLE_FORM_CONTROL_TAG_NAMES: ReadonlySet<string> = new Set(
  MARKABLE_FORM_CONTROL_TAGS
);

/**
 * Whether an element is a form control which takes part in the modified state
 * of a form container.
 */
export const isMarkableFormControl = (node: Element): boolean =>
  MARKABLE_FORM_CONTROL_TAG_NAMES.has(node.localName);

/** The parent of a node, which crosses the boundary of a shadow root. */
const parentOf = (node: Element): Element | null => {
  if (node.parentElement) {
    return node.parentElement;
  }

  const root = node.getRootNode();

  return root instanceof ShadowRoot ? root.host : null;
};

/**
 * The form container which owns a control, or `null` when the control does not
 * belong to a form.
 */
const owningForm = (control: Element): Element | null => {
  let node = parentOf(control);

  while (node) {
    if (node.localName === 'vscode-form-container') {
      return node;
    }

    node = parentOf(node);
  }

  return null;
};

/**
 * The controls of a form. The controls of a nested form container belong to the
 * nested form, so the outer form does not mark them.
 */
const controlsOf = (form: HTMLElement): MarkableFormControl[] =>
  [
    ...form.querySelectorAll<MarkableFormControl>(
      MARKABLE_FORM_CONTROL_SELECTOR
    ),
  ].filter((control) => owningForm(control) === form);

/**
 * Marks the form controls of a form as modified.
 */
export const markFormControls = (form: HTMLElement): void => {
  controlsOf(form).forEach((control) => {
    control.dirty = true;
  });
};

/**
 * Restores the form controls of a form to their normal state.
 */
export const unmarkFormControls = (form: HTMLElement): void => {
  controlsOf(form).forEach((control) => {
    control.dirty = false;
  });
};

interface DirtyColors {
  background: string;
  peak: string;
  border: string;
  ring: string;
}

/**
 * The colors of the modified state of a light theme, the default of the
 * palette.
 */
const LIGHT: DirtyColors = {
  background: '#eff3ff',
  peak: '#dbe4ff',
  border: '#93a9f0',
  ring: '#6784de',
};

/**
 * The colors of the modified state of a dark theme: the hue of the light
 * theme with the lightness of the surfaces of a dark theme.
 */
const DARK: DirtyColors = {
  background: '#243a5e',
  peak: '#2f4c7a',
  border: '#4a6ea8',
  ring: 'rgba(74, 110, 168, 0.55)',
};

/**
 * The colors of the modified state of a high contrast theme. The state is
 * opaque and it is separated from the background of the control by a border,
 * so it stays visible when the theme hides the subtle differences.
 */
const HIGH_CONTRAST_DARK: DirtyColors = {
  background: '#243a5e',
  peak: '#3a5c8f',
  border: '#7aa2e3',
  ring: '#7aa2e3',
};

const HIGH_CONTRAST_LIGHT: DirtyColors = {
  background: '#dbe4ff',
  peak: '#b9c9ff',
  border: '#0a3d91',
  ring: '#0a3d91',
};

const body = (kind: string) =>
  `:host-context(body[data-vscode-theme-kind='${kind}']), :host-context(body.${kind})`;

/**
 * The value of a color of the modified state.
 *
 * The public custom property is read first, so the color can be replaced on
 * the form container, on an ancestor, on the `body` element or on the control
 * itself. The colors of the theme palette are declared with the separate
 * `--vsc-form-control-dirty-palette-*` names: a declaration with the public
 * name would shadow the value which the control inherits, and the color could
 * not be replaced above the control any more.
 */
const dirtyColor = (name: string, fallback: string) => css`var(
    --vsc-form-control-dirty-${unsafeCSS(name)},
    var(
      --vsc-form-control-dirty-palette-${unsafeCSS(name)},
      ${unsafeCSS(fallback)}
    )
  )`;

/**
 * The colors of the modified state of a theme. The kind of the theme is
 * published by VS Code and by the webview playground on the `body` element,
 * and `:host-context` is used, because it also matches from a shadow root.
 *
 * The palette is an internal fallback of the public custom properties, see
 * {@link dirtyColor}.
 */
const themeColors = (selector: string, value: DirtyColors): CSSResultGroup => [
  css`
    ${unsafeCSS(selector)} {
      --vsc-form-control-dirty-palette-background: ${unsafeCSS(
        value.background
      )};
      --vsc-form-control-dirty-palette-background-peak: ${unsafeCSS(
        value.peak
      )};
      --vsc-form-control-dirty-palette-border-color: ${unsafeCSS(value.border)};
      --vsc-form-control-dirty-palette-ring-color: ${unsafeCSS(value.ring)};
    }
  `,
];

/** The colors of the modified state of each kind of the VS Code themes. */
export const FORM_CONTROL_DIRTY_PALETTE: CSSResultGroup = [
  themeColors(
    `${body('vscode-light')}, :host-context(body:not([data-vscode-theme-kind]))`,
    LIGHT
  ),
  themeColors(body('vscode-dark'), DARK),
  themeColors(body('vscode-high-contrast'), HIGH_CONTRAST_DARK),
  themeColors(body('vscode-high-contrast-light'), HIGH_CONTRAST_LIGHT),
];

/**
 * The fading animation of the modified state, which the controls share. The
 * background fades from the peak color to the resting color of the theme, and
 * it fades back to the original background of the control when the state is
 * removed.
 */
export const formControlDirtyVariables = css`
  @keyframes vsc-form-control-dirty-fade {
    from {
      background-color: ${dirtyColor('background-peak', LIGHT.peak)};
    }
  }
`;

/**
 * The colors of the modified state of a control which fills its whole surface,
 * e.g. a textfield, a textarea or a dropdown.
 *
 * Only the background is changed, so the border of a focused control keeps
 * the focus color.
 */
const dirtySurface = css`
  animation: vsc-form-control-dirty-fade
    var(--vsc-form-control-dirty-duration, 5000ms)
    cubic-bezier(0.33, 0, 0.67, 1) both;
  background-color: ${dirtyColor('background', LIGHT.background)};
  transition: background-color 320ms ease-out;
`;

/**
 * The colors of the modified state of a small control which draws the
 * background on a box instead of the whole surface, e.g. a checkbox or a
 * radio button. The box is small, so a ring carries the state as well.
 */
const dirtyBox = css`
  animation:
    vsc-form-control-dirty-fade var(--vsc-form-control-dirty-duration, 5000ms)
      cubic-bezier(0.33, 0, 0.67, 1) both,
    vsc-form-control-dirty-ring var(--vsc-form-control-dirty-duration, 5000ms)
      cubic-bezier(0.33, 0, 0.67, 1) both;
  background-color: ${dirtyColor('background', LIGHT.background)};
  border-color: ${dirtyColor('border-color', LIGHT.border)};
  box-shadow: 0 0 0 2px ${dirtyColor('ring-color', LIGHT.ring)};
  transition:
    background-color 320ms ease-out,
    border-color 320ms ease-out,
    box-shadow 320ms ease-out;
`;

/**
 * The modified state of a control which fills its whole surface.
 *
 * A control which shows an error keeps the error colors: the modified state is
 * not painted on it, so the error is not covered by the wash during the whole
 * highlight.
 */
export const FORM_CONTROL_DIRTY_SURFACE_STYLES = css`
  :host([dirty]:not([invalid]):not(:invalid)) .root,
  :host([dirty]:not([invalid]):not(:invalid)) .combobox-face,
  :host([dirty]:not([invalid]):not(:invalid)) .select-face,
  :host([dirty]:not([invalid]):not(:invalid)) textarea {
    ${dirtySurface}
  }

  @media (prefers-reduced-motion: reduce) {
    :host([dirty]:not([invalid]):not(:invalid)) .root,
    :host([dirty]:not([invalid]):not(:invalid)) .combobox-face,
    :host([dirty]:not([invalid]):not(:invalid)) .select-face,
    :host([dirty]:not([invalid]):not(:invalid)) textarea {
      animation: none;
      transition: none;
    }
  }
`;

/**
 * The modified state of a small control which draws the background on a box
 * instead of the whole surface.
 */
export const FORM_CONTROL_DIRTY_BOX_STYLES = css`
  @keyframes vsc-form-control-dirty-ring {
    from {
      box-shadow: 0 0 0 4px ${dirtyColor('ring-color', LIGHT.ring)};
    }
  }

  :host([dirty]:not([invalid]):not(:invalid)) .icon {
    ${dirtyBox}
  }

  @media (prefers-reduced-motion: reduce) {
    :host([dirty]:not([invalid]):not(:invalid)) .icon {
      animation: none;
      transition: none;
    }
  }
`;
