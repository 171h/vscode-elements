const palette = (
  background: string,
  foreground: string,
  input: string,
  border: string,
  focus: string
) => ({
  '--vscode-editor-background': background,
  '--vscode-foreground': foreground,
  '--vscode-font-family': 'Segoe UI, sans-serif',
  '--vscode-font-size': '13px',
  '--vscode-input-background': input,
  '--vscode-input-foreground': foreground,
  '--vscode-input-border': border,
  '--vscode-dropdown-background': input,
  '--vscode-dropdown-foreground': foreground,
  '--vscode-dropdown-border': border,
  '--vscode-focusBorder': focus,
  '--vscode-sideBar-background': background,
  '--vscode-sideBar-foreground': foreground,
  '--vscode-sideBarSectionHeader-background': input,
  '--vscode-sideBarSectionHeader-foreground': foreground,
  '--vscode-sideBarSectionHeader-border': border,
  '--vscode-panel-border': border,
  '--vscode-widget-border': border,
  '--vscode-button-background': focus,
  '--vscode-button-foreground': '#ffffff',
  '--vscode-button-hoverBackground': focus,
  '--vscode-button-secondaryBackground': input,
  '--vscode-button-secondaryForeground': foreground,
  '--vscode-checkbox-background': input,
  '--vscode-checkbox-foreground': foreground,
  '--vscode-checkbox-border': border,
  '--vscode-list-activeSelectionBackground': focus,
  '--vscode-list-activeSelectionForeground': '#ffffff',
  '--vscode-list-hoverBackground': input,
  '--vscode-descriptionForeground': foreground,
  '--vscode-disabledForeground': '#888888',
  '--vscode-scrollbarSlider-background': border,
});

export const themes: Record<string, Record<string, string>> = {
  'dark-v2': palette('#1f1f1f', '#cccccc', '#313131', '#454545', '#0078d4'),
  'light-v2': palette('#ffffff', '#333333', '#f3f3f3', '#cecece', '#005fb8'),
  'hc-black': {
    ...palette('#000000', '#ffffff', '#000000', '#ffffff', '#f38518'),
    '--vscode-contrastBorder': '#ffffff',
  },
  'hc-light': {
    ...palette('#ffffff', '#000000', '#ffffff', '#000000', '#0f4a85'),
    '--vscode-contrastBorder': '#000000',
  },
};

export function applyTheme(id: string) {
  for (const key of Object.keys(themes['hc-black']))
    document.documentElement.style.removeProperty(key);
  for (const [key, value] of Object.entries(themes[id]))
    document.documentElement.style.setProperty(key, value);
  document.documentElement.dataset.theme = id;
}
