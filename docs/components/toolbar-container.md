# 工具栏 ToolbarContainer

横向排列操作与装饰内容。

[API 参考](../api/generated/toolbar-container)

## 导入

```js
import 'nusys-ui/dist/vscode-toolbar-container/index.js';
import 'nusys-ui/dist/vscode-toolbar-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽承载 ToolbarButton 或其他操作。组件负责水平布局，各操作自行设置名称与事件。复杂工具栏需自行规划焦点顺序，不应假设容器实现整套方向键导航。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="toolbar" />

```html
<vscode-toolbar-container>
  <vscode-toolbar-button icon="new-file" label="新建文件">
  </vscode-toolbar-button>
  <vscode-toolbar-button icon="refresh" label="刷新"> </vscode-toolbar-button>
  <vscode-toolbar-button icon="pin" label="固定" toggleable>
  </vscode-toolbar-button>
</vscode-toolbar-container>
<output aria-live="polite"> </output>
```

```js
const button = document.querySelector('[toggleable]');
button.addEventListener('change', () => {
  document.querySelector('output').textContent = button.checked
    ? '已固定'
    : '已取消固定';
});
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
