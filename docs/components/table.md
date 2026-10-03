# 表格 Table

组织表格、调整列宽及响应式布局。

[API 参考](../api/generated/table)

## 导入

```js
import 'nusys-ui/dist/vscode-table/index.js';
import 'nusys-ui/dist/vscode-table-header/index.js';
import 'nusys-ui/dist/vscode-table-header-cell/index.js';
import 'nusys-ui/dist/vscode-table-body/index.js';
import 'nusys-ui/dist/vscode-table-row/index.js';
import 'nusys-ui/dist/vscode-table-cell/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

Header 直接包含 HeaderCell；Body 包含 Row，Row 包含 Cell。该组件组采用 CSS Grid 组织行列，不能直接混入原生 tr/td。

`resizable` 启用列宽拖动；`columns` 通过 JavaScript 传入宽度数组，支持像素、百分比和 auto；`min-column-width` 设置最小宽度。`responsive` 和 `breakpoint` 控制窄屏行为，边框可按行、列分别设置。`size` 统一行与文字尺寸。

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

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="table" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
