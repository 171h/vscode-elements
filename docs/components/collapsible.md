# 折叠区 Collapsible

包含标题、操作、装饰和可折叠内容。

[API 参考](../api/generated/collapsible)

## 导入

```js
import 'nusys-ui/dist/vscode-collapsible/index.js';
import 'nusys-ui/dist/vscode-badge/index.js';
import 'nusys-ui/dist/vscode-toolbar-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

`title` 设置标题，`open` 控制展开。默认插槽承载内容，`decorations` 放始终可见的徽章等装饰，`actions` 放标题操作。`always-show-header-actions` 可让标题操作在收起时仍显示。

操作区域点击与标题切换分离；监听 `vsc-collapsible-toggle` 读取 `detail.open`。复杂表单的启用与禁用请使用 Fieldset，避免混淆展开状态和表单状态。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="collapsible" />

```html
<vscode-collapsible title="资源管理器" open>
  <vscode-badge variant="counter" slot="decorations">2</vscode-badge>
  <vscode-toolbar-button slot="actions" icon="new-file" label="新建文件">
  </vscode-toolbar-button>
  <p>index.ts</p>
  <p>package.json</p>
</vscode-collapsible>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
