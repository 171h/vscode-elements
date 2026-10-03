# 按钮组 ButtonGroup

将相邻按钮组织为一组。

[API 参考](../api/generated/button-group)

## 导入

```js
import 'nusys-ui/dist/vscode-button-group/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽接收 `vscode-button`，常用于主操作与更多操作按钮并排。按钮组只负责布局，各子按钮的类型、禁用状态和点击事件仍单独设置。下拉菜单需要应用自行控制显示。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="button-group" />

```html
<vscode-button-group>
  <vscode-button>运行</vscode-button>
  <vscode-button icon="chevron-down" aria-label="更多运行操作"> </vscode-button>
</vscode-button-group>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="button-group" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
