import {css} from 'lit';

// Legends live in light DOM: ::slotted(fieldset) cannot reach their descendants.
// Install narrowly scoped, low-specificity styles in the containing DOM root.
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
    /* The legend sits in the fieldset border notch, where the fieldset
       background is not painted. An opaque background would cover the
       surface behind the border with a rectangle, which is especially
       visible on dark themes. Transparent blends with the surface and the
       theme foreground keeps the title readable. */
    background: transparent;
    border: 0;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset)
    > legend[draggable='true'] {
    cursor: grab;
    user-select: none;
  }

  :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset):focus-within {
    outline: 1px solid var(--vscode-focusBorder, Highlight);
    outline-offset: -1px;
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

  @media (forced-colors: active) {
    :where(vscode-fieldset > fieldset, vscode-tab-panel > fieldset) {
      border-color: CanvasText;
    }
    :where(
      vscode-fieldset > fieldset,
      vscode-tab-panel > fieldset
    ):focus-within {
      outline-color: Highlight;
    }
  }
`;

const installed = new WeakMap<Document | ShadowRoot, HTMLStyleElement>();

/** Apply the same theme to wrapped and direct native sidebar fieldsets. */
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
  // innerHTML upgrades custom elements before replacing the root's old children.
  // A style appended from connectedCallback can be discarded by that replacement.
  queueMicrotask(() => {
    if (element.isConnected && !style.isConnected) {
      installFieldsetStyles(element);
    }
  });
}
