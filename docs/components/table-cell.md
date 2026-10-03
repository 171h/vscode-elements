# 单元格 TableCell

承载表格内容。

[API 参考](../api/generated/table-cell)

## 导入

```js
import 'nusys-ui/dist/vscode-table-cell/index.js';
import 'nusys-ui/dist/vscode-table/index.js';
import 'nusys-ui/dist/vscode-table-header/index.js';
import 'nusys-ui/dist/vscode-table-header-cell/index.js';
import 'nusys-ui/dist/vscode-table-body/index.js';
import 'nusys-ui/dist/vscode-table-row/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

作为 TableRow 的子组件，默认插槽可包含文字、图标或按钮。列宽和布局由父 Table 管理；长内容可由应用在内部容器设置换行或省略样式。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="table" />

```html
<vscode-table resizable bordered-columns>
  <vscode-table-header>
    <vscode-table-header-cell>文件</vscode-table-header-cell>
    <vscode-table-header-cell>类型</vscode-table-header-cell>
  </vscode-table-header>
  <vscode-table-body>
    <vscode-table-row>
      <vscode-table-cell>index.ts</vscode-table-cell>
      <vscode-table-cell>TypeScript</vscode-table-cell>
    </vscode-table-row>
    <vscode-table-row>
      <vscode-table-cell>README.md</vscode-table-cell>
      <vscode-table-cell>Markdown</vscode-table-cell>
    </vscode-table-row>
  </vscode-table-body>
</vscode-table>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
