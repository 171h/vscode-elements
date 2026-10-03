import {css} from 'lit';

// legend 位于 light DOM，::slotted(fieldset) 无法选中其后代。
// 在所属 DOM 根节点中安装作用范围明确、优先级较低的样式。
const styles = css`
  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset) {
    box-sizing: border-box;
    min-width: 0;
    margin: 0 0 8px;
    padding: 10px 12px 12px;
    color: var(
      --vscode-sideBar-foreground,
      var(--vscode-foreground, CanvasText)
    );
    background: var(
      --vscode-sideBar-background,
      var(--vscode-editor-background, Canvas)
    );
    border: 1px solid
      var(
        --vscode-contrastBorder,
        var(
          --vscode-sideBarSectionHeader-border,
          var(--vscode-panel-border, var(--vscode-widget-border, currentColor))
        )
      );
    border-radius: var(--vsc-form-control-border-radius, 4px);
    font-family: var(--vscode-font-family, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    font-weight: var(--vscode-font-weight, normal);
  }

  :where(
    vscode-tab-panel > fieldset[size='small'],
    vscode-fieldset > fieldset[size='small']
  ) {
    --vsc-form-control-border-radius: 1px;
  }

  :where(
    vscode-tab-panel > fieldset[size='large'],
    vscode-fieldset > fieldset[size='large']
  ) {
    --vsc-form-control-border-radius: 6px;
  }

  /* 单独绘制顶部边框，只裁剪装饰线，不裁剪内容、焦点轮廓或弹出层。 */
  :where(vscode-fieldset > fieldset[data-vsc-checkbox-border]) {
    position: relative;
    border-top-color: transparent !important;
  }

  :where(vscode-fieldset > fieldset[data-vsc-checkbox-border])::before {
    content: '';
    pointer-events: none;
    position: absolute;
    top: var(--_vsc-fieldset-border-top);
    left: -1px;
    right: -1px;
    height: var(--vsc-form-control-border-radius, 4px);
    border: 1px solid
      var(
        --_vsc-fieldset-border-color,
        var(
          --vscode-contrastBorder,
          var(
            --vscode-sideBarSectionHeader-border,
            var(
              --vscode-panel-border,
              var(--vscode-widget-border, currentColor)
            )
          )
        )
      );
    border-bottom: 0;
    border-radius: inherit;
    mask-image: linear-gradient(
      to right,
      black 0 var(--_vsc-fieldset-legend-start),
      transparent var(--_vsc-fieldset-legend-start)
        var(--_vsc-fieldset-legend-end),
      black var(--_vsc-fieldset-legend-end) var(--_vsc-fieldset-checkbox-start),
      transparent var(--_vsc-fieldset-checkbox-start)
        var(--_vsc-fieldset-checkbox-end),
      black var(--_vsc-fieldset-checkbox-end) 100%
    );
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset) > legend {
    box-sizing: border-box;
    max-width: 100%;
    padding: 4px 8px;
    color: var(
      --vscode-sideBarSectionHeader-foreground,
      var(
        --vscode-sideBarTitle-foreground,
        var(--vscode-foreground, CanvasText)
      )
    );
    /* 标题与右上角启用框共用背景变量，默认透明，不绘制背景颜色。 */
    background: var(--vsc-fieldset-header-background, transparent);
    border: 0;
    font-family: inherit;
    font-size: 11px;
    font-weight: bold;
    line-height: 18px;
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset)
    > legend[draggable='true'] {
    cursor: grab;
    user-select: none;
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset)
    > legend:focus-visible {
    outline: 1px solid var(--vscode-focusBorder, Highlight);
    outline-offset: -1px;
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset):disabled,
  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset):disabled
    > legend {
    color: var(--vscode-disabledForeground, GrayText);
  }

  /** vscode-fieldset 复选框控制内容折叠。隐藏元素并将裸文本字号设为零，使标题成为 fieldset 唯一可见部分。minimal 模式隐藏整个 fieldset，仅保留复选框。 */
  :where(vscode-fieldset[data-vsc-collapsed] > fieldset) {
    font-size: 0;
  }

  :where(vscode-fieldset[data-vsc-collapsed] > fieldset) > :not(legend) {
    display: none;
  }

  :where(
    vscode-fieldset[data-vsc-collapsed][unchecked-mode='minimal'] > fieldset
  ) {
    display: none;
  }

  @media (forced-colors: active) {
    :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset) {
      border-color: CanvasText;
    }
    :where(vscode-fieldset > fieldset[data-vsc-checkbox-border])::before {
      border-color: CanvasText;
    }
  }
`;

const installed = new WeakMap<Document | ShadowRoot, HTMLStyleElement>();

/** 为包装组件中的 fieldset 和侧栏直属原生 fieldset 应用相同主题。 */
export function installFieldsetStyles(element: HTMLElement) {
  const root = element.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) {
    return;
  }
  if (installed.get(root)?.isConnected) {
    return;
  }
  const style = element.ownerDocument.createElement('style');
  style.dataset.vscFieldsetStyles = '';
  style.textContent = styles.cssText;
  (root instanceof Document ? root.head : root).append(style);
  installed.set(root, style);
  // innerHTML 在替换根节点原有子节点之前升级自定义元素。
  // connectedCallback 中添加的样式可能被该替换操作移除。
  queueMicrotask(() => {
    if (element.isConnected && !style.isConnected) {
      installFieldsetStyles(element);
    }
  });
}
