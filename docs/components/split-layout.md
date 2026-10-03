# 分栏 SplitLayout

拖动分隔条，限制最小尺寸与固定面板。

[API 参考](../api/generated/split-layout)

## 导入

```js
import 'nusys-ui/dist/vscode-split-layout/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

通过 `start` 与 `end` 插槽提供面板。`split="vertical"` 为竖直分隔条，左右排列；`horizontal` 为水平分隔条，上下排列。容器需有明确尺寸。

`initial-handle-position` 设置初始位置，`handle-position` 可程序控制；位置支持 px 或 %。`min-start`、`min-end` 限制最小面板，`fixed-pane` 控制容器变化时保持的一侧。`reset-on-dbl-click` 启用双击复位。监听 `vsc-split-layout-change` 读取像素和百分比位置。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="split-layout" />

```html
<vscode-split-layout
  split="vertical"
  min-start="100px"
  min-end="100px"
  reset-on-dbl-click
  style="height: 200px"
>
  <div slot="start">资源管理器</div>
  <div slot="end">编辑器<br />拖动中间分隔条，双击恢复。</div>
</vscode-split-layout>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="split-layout" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
