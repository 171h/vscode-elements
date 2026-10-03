# 徽章 Badge

显示计数、状态与紧凑的装饰信息。

[API 参考](../api/generated/badge)

## 导入

```js
import 'nusys-ui/dist/vscode-badge/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认样式用于紧凑标签；`variant="counter"` 显示列表计数，`activity-bar-counter` 用于活动栏风格的计数。内容由默认插槽提供，应用负责更新数值。徽章不是交互按钮，不应承担点击操作。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="badge" />

```html
<vscode-badge>进行中</vscode-badge>
<vscode-badge variant="counter">12</vscode-badge>
<vscode-badge variant="activity-bar-counter">3</vscode-badge>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="badge" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
