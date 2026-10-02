import {css, CSSResultGroup, unsafeCSS} from 'lit';

/**
 * 参与 `vscode-form-container` 已修改状态的表单控件。
 * `dirty` 属性会反射为同名 HTML 特性，
 * 作为已修改状态样式的选择依据。
 */
export interface MarkableFormControl extends HTMLElement {
  dirty: boolean;
}

/** 表单容器中的表单控件标签名。 */
export const MARKABLE_FORM_CONTROL_TAGS = [
  'vscode-checkbox',
  'vscode-multi-select',
  'vscode-radio',
  'vscode-single-select',
  'vscode-textarea',
  'vscode-textfield',
] as const;

/** 表单容器中的表单控件选择器。 */
export const MARKABLE_FORM_CONTROL_SELECTOR =
  MARKABLE_FORM_CONTROL_TAGS.join(',');

const MARKABLE_FORM_CONTROL_TAG_NAMES: ReadonlySet<string> = new Set(
  MARKABLE_FORM_CONTROL_TAGS
);

/**
 * 判断元素是否为参与表单容器已修改状态的
 * 表单控件。
 */
export const isMarkableFormControl = (node: Element): boolean =>
  MARKABLE_FORM_CONTROL_TAG_NAMES.has(node.localName);

/** 获取节点的父节点，跨越 Shadow Root 边界。 */
const parentOf = (node: Element): Element | null => {
  if (node.parentElement) {
    return node.parentElement;
  }

  const root = node.getRootNode();

  return root instanceof ShadowRoot ? root.host : null;
};

/**
 * 获取控件所属的表单容器；不属于任何表单时
 * 返回 `null`。
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
 * 获取表单控件。嵌套表单容器中的控件归属于嵌套表单，
 * 外层表单不会标记这些控件。
 */
const controlsOf = (form: HTMLElement): MarkableFormControl[] =>
  [
    ...form.querySelectorAll<MarkableFormControl>(
      MARKABLE_FORM_CONTROL_SELECTOR
    ),
  ].filter((control) => owningForm(control) === form);

/**
 * 将表单中的控件标记为已修改。
 */
export const markFormControls = (form: HTMLElement): void => {
  controlsOf(form).forEach((control) => {
    control.dirty = true;
  });
};

/**
 * 将表单中的控件恢复为正常状态。
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
 * 浅色主题的已修改状态颜色，
 * 作为调色板默认值。
 */
const LIGHT: DirtyColors = {
  background: '#eff3ff',
  peak: '#dbe4ff',
  border: '#93a9f0',
  ring: '#6784de',
};

/**
 * 深色主题的已修改状态颜色：沿用浅色主题色相，
 * 并匹配深色主题表面的明度。
 */
const DARK: DirtyColors = {
  background: '#243a5e',
  peak: '#2f4c7a',
  border: '#4a6ea8',
  ring: 'rgba(74, 110, 168, 0.55)',
};

/**
 * 高对比度主题的已修改状态颜色。状态使用不透明颜色，
 * 并通过边框与控件背景区分，
 * 确保主题隐藏细微颜色差异时仍可见。
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
 * 已修改状态的颜色值。
 *
 * 优先读取公共自定义属性，因此可在表单容器、
 * 祖先节点、`body` 或控件自身上覆盖颜色。
 * 主题调色板使用独立的
 * `--vsc-form-control-dirty-palette-*` 名称；若使用公共属性名声明，
 * 就会遮蔽控件继承的值，
 * 导致无法在控件上层覆盖颜色。
 */
const dirtyColor = (name: string, fallback: string) => css`var(
    --vsc-form-control-dirty-${unsafeCSS(name)},
    var(
      --vsc-form-control-dirty-palette-${unsafeCSS(name)},
      ${unsafeCSS(fallback)}
    )
  )`;

/**
 * 主题的已修改状态颜色。VS Code 和组件预览工具
 * 通过 `body` 标识主题类型；
 * 使用 `:host-context` 以便从 Shadow Root 内匹配。
 *
 * 调色板是公共自定义属性的内部回退值，参见
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

/** 各类 VS Code 主题的已修改状态颜色。 */
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
 * 控件共享的已修改状态淡出动画。
 * 背景从峰值颜色渐变至主题的静止颜色，
 * 状态移除时再恢复为控件原来的背景。
 * 此时淡出结束。
 */
export const formControlDirtyVariables = css`
  @keyframes vsc-form-control-dirty-fade {
    from {
      background-color: ${dirtyColor('background-peak', LIGHT.peak)};
    }
  }
`;

/**
 * 铺满整个表面的控件的已修改状态颜色，
 * 例如文本框、多行文本框或下拉框。
 *
 * 只修改背景，因此获得焦点的控件边框
 * 保留焦点颜色。
 */
const dirtySurface = css`
  animation: vsc-form-control-dirty-fade
    var(--vsc-form-control-dirty-duration, 5000ms)
    cubic-bezier(0.33, 0, 0.67, 1) both;
  background-color: ${dirtyColor('background', LIGHT.background)};
  transition: background-color 320ms ease-out;
`;

/**
 * 仅在小方框而非整个表面绘制背景的控件的
 * 已修改状态颜色，例如复选框或
 * 单选按钮。方框较小，因此额外使用外环显示状态。
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
 * 铺满整个表面的控件的已修改状态。
 *
 * 显示错误的控件保留错误颜色，不绘制已修改状态，
 * 避免在整个高亮过程中
 * 淡色背景覆盖错误提示。
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
 * 仅在小方框而非整个表面绘制背景的
 * 小型控件的已修改状态。
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
