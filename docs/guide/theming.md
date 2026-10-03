# 主题与图标

## VS Code 主题变量

组件读取 `--vscode-*` 变量并提供回退值。在 VS Code Webview 中这些变量由宿主提供；普通浏览器应提供主题变量，避免明暗表面的颜色混用。

## 文档的全站主题

页面底部的「全站主题」使用 `@vscode-elements/webview-playground` 的 `vscode-theme-selector`，提供 Light+、Light Modern、Quiet Light、Solarized Light、Dark+、Dark Modern、Solarized Dark、Monokai 以及两种高对比度主题。

文档布局、所有组件预览和综合体验页同步使用选中主题的完整变量。选择自动保存在浏览器本地，跨页面导航和刷新后恢复。每个示例只保留尺寸选择；切换主题不会重建预览，因此输入值、选中项及拖拽布局保持不变。VitePress 默认外观切换已停用。

此功能仅用于文档站点，组件库不依赖 Playground；应用中的主题仍由 VS Code 宿主提供。主题来源及实现参见 [Playground 仓库](https://github.com/vscode-elements/webview-playground)。

```css
:root {
  --vscode-font-family: 'Segoe UI', sans-serif;
  --vscode-font-size: 13px;
  --vscode-foreground: #242424;
  --vscode-editor-background: #ffffff;
  --vscode-input-background: #ffffff;
  --vscode-input-foreground: #242424;
  --vscode-input-border: #b8b8b8;
  --vscode-focusBorder: #0078d4;
  --vscode-button-background: #0078d4;
  --vscode-button-foreground: #ffffff;
}
```

这是一组浏览器演示用变量。生产应用应跟随宿主的完整主题。可用组件公开的 CSS 自定义属性和 `::part()` 调整外观；不要依赖 shadow DOM 的内部类名。每个组件的 [API](../api/) 列出已声明的 CSS 变量和部件。

## Codicon 字体

将 `@vscode/codicons/dist/codicon.css` 与 `codicon.ttf` 放到同一静态目录，添加固定 id 的样式表：

```html
<link
  id="vscode-codicon-stylesheet"
  rel="stylesheet"
  href="./assets/codicon.css"
/>
<vscode-icon name="settings-gear"></vscode-icon>
<vscode-button icon="save">保存</vscode-button>
```

组件会在 shadow DOM 中使用该链接及其 nonce；缺少 id、字体文件或 CSP 授权会使图标无法显示。可用的名称随所安装 Codicon 版本变化，参见 [Codicon 图标列表](https://microsoft.github.io/vscode-codicons/dist/codicon.html)。

## 尺寸与可访问名称

表单、图标、树与表格的尺寸规则见 [统一尺寸](../form-size)。纯图标按钮提供 `aria-label` 或对应组件的 `label`，例如：

```html
<vscode-icon name="refresh" action-icon label="刷新"></vscode-icon>
<vscode-toolbar-button icon="refresh" label="刷新"></vscode-toolbar-button>
```

可操作图标使用 `vsc-click`，工具栏按钮通常监听 `click`；可切换工具栏按钮使用 `toggleable`、`checked` 和 `change`。
