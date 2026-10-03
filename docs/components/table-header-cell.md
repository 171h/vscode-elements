# 表头单元格 TableHeaderCell

设置列标题与最小列宽。

[API 参考](../api/generated/table-header-cell)

## 导入

```js
import 'nusys-ui/dist/vscode-table-header-cell/index.js';
import 'nusys-ui/dist/vscode-table/index.js';
import 'nusys-ui/dist/vscode-table-header/index.js';
import 'nusys-ui/dist/vscode-table-body/index.js';
import 'nusys-ui/dist/vscode-table-row/index.js';
import 'nusys-ui/dist/vscode-table-cell/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

放在 TableHeader 内，默认插槽提供列名；可设置列的最小宽度。启用调整宽度由父 Table 的 resizable 控制。避免直接调用列宽控制器的内部通讯方法。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="table-header-cell" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
