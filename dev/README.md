此目录包含用于开发和验证组件的 HTML 文件。运行 `pnpm start` 后，可以在不打包的情况下编辑并查看变化。

示例通过 `@vscode-elements/webview-playground` 模拟 VS Code 的主题与全局环境，保留主题、减少动画、链接下划线和视图容器控制。Vite 直接加载组件源码，并负责生产示例及主题资源的构建。

## 统一组件展示页

运行 `pnpm start` 后，访问 `http://localhost:8000/dev` 浏览各组件测试页面，或访问 `http://localhost:8000/dev/index.html` 打开[统一组件展示页](./index.html)。展示页将所有公共组件及常见交互场景放在同一页面中。

顶部工具栏可全局切换十种内置 VS Code 主题、组件尺寸和图标尺寸。组件过滤器可聚焦某一组件类别，底部事件日志捕获冒泡的组件事件。各组件子目录继续保留，用于聚焦的回归验证及历史示例。

可使用以下文件作为起点：

- `_template.html`：默认模板，提供所有 VS Code 主题变量、Codicon 图标和组件。
- `_template-csp.html`：使用严格 CSP 设置的模板，提供所有 VS Code 主题变量、Codicon 图标和组件。
- `_template-fallback-styles.html`：默认回退样式演示模板，提供 Codicon 图标和所有组件，但不提供主题变量。

示例说明、文档与代码注释均使用中文，技术标识符和工具指令保持原样。
