// 等待真实主题模块加载并应用变量，避免只检查提前更新的主题标识。
export async function waitForPlaygroundTheme(page, theme) {
  await page.waitForFunction((id) => {
    const selector = customElements.get('vscode-theme-selector');
    const data = selector?.themes[id]?.data;
    return (
      selector?.appliedTheme === id &&
      data?.length > 0 &&
      data.every(
        ([key, value]) =>
          key.endsWith('font-family') ||
          document.documentElement.style.getPropertyValue(key) === value
      ) &&
      document.body.dataset.vscodeThemeKind === selector.themeInfo[id].themeKind
    );
  }, theme);
}
