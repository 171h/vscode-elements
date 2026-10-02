# 表格主体 TableBody

包含数据行，可限制滚动区域。

[API 参考](../api/generated/table-body)

## 导入

```js
import 'nusys-ui/dist/vscode-table-body/index.js';
import 'nusys-ui/dist/vscode-table/index.js';
import 'nusys-ui/dist/vscode-table-header/index.js';
import 'nusys-ui/dist/vscode-table-header-cell/index.js';
import 'nusys-ui/dist/vscode-table-row/index.js';
import 'nusys-ui/dist/vscode-table-cell/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

放在 Table 内，默认插槽提供 TableRow。需要滚动区域时结合父表格尺寸与主体公开设置；保持每行列数一致。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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
