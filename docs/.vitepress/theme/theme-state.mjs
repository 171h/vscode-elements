import {shallowRef} from 'vue';

// 主题只由全局 Playground 选择器更新，预览订阅同一份变量。
export const siteTheme = shallowRef({
  id: '',
  kind: 'vscode-light',
  variables: {},
});

export function readPlaygroundTheme(Selector) {
  const id = Selector.appliedTheme;
  if (!id || !Selector.themes[id]?.data) return;
  const style = document.documentElement.style;
  const variables = Object.fromEntries(
    Array.from(style)
      .filter((name) => name.startsWith('--vscode-'))
      .map((name) => [name, style.getPropertyValue(name)])
  );
  const kind = document.body.dataset.vscodeThemeKind;
  const dark = kind === 'vscode-dark' || kind === 'vscode-high-contrast';
  // 此类仅用于代码高亮；VitePress 自带的外观选择器已禁用。
  if (document.documentElement.classList.contains('dark') !== dark)
    document.documentElement.classList.toggle('dark', dark);
  const colorScheme = dark ? 'dark' : 'light';
  if (style.colorScheme !== colorScheme) style.colorScheme = colorScheme;
  const colors = {
    '--vp-c-bg': '--vscode-editor-background',
    '--vp-c-bg-alt': '--vscode-sideBar-background',
    '--vp-c-bg-elv': '--vscode-editorWidget-background',
    '--vp-c-bg-soft': '--vscode-sideBar-background',
    '--vp-c-text-1': '--vscode-foreground',
    '--vp-c-text-2': '--vscode-descriptionForeground',
    '--vp-c-text-3': '--vscode-disabledForeground',
    '--vp-c-brand-1': '--vscode-textLink-foreground',
    '--vp-c-brand-2': '--vscode-textLink-activeForeground',
    '--vp-c-brand-3': '--vscode-button-background',
    '--vp-c-divider': '--vscode-panel-border',
    '--vp-c-border': '--vscode-input-border',
    '--vp-c-gutter': '--vscode-panel-border',
  };
  for (const [target, source] of Object.entries(colors)) {
    const value =
      variables[source] ||
      variables['--vscode-contrastBorder'] ||
      variables['--vscode-panel-border'];
    if (value && style.getPropertyValue(target) !== value)
      style.setProperty(target, value);
    else if (!value && style.getPropertyValue(target))
      style.removeProperty(target);
  }
  const next = {id, kind, variables};
  if (JSON.stringify(next) !== JSON.stringify(siteTheme.value))
    siteTheme.value = next;
}
