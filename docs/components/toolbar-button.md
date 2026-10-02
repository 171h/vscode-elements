# 工具栏按钮 ToolbarButton

图标操作与可切换的工具栏状态。

[API 参考](../api/generated/toolbar-button)

## 导入

```js
import 'nusys-ui/dist/vscode-toolbar-button/index.js';
import 'nusys-ui/dist/vscode-toolbar-container/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

`icon` 设置 Codicon，默认插槽放文字，纯图标按钮用 `label` 提供名称。普通操作监听 click；设置 `toggleable` 后按钮表现为 switch，点击切换 `checked` 并派发不冒泡的 change。

工具栏按钮未声明表单 Button 的完整属性，不要假设支持同样的 disabled、type 或提交行为。需要禁用操作时选择具有对应能力的 Button。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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
