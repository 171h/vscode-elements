# 进度条 ProgressBar

显示确定进度或不确定的运行状态。

[API 参考](../api/generated/progress-bar)

## 导入

```js
import 'nusys-ui/dist/vscode-progress-bar/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

`value` 和 `max` 表示确定进度，默认 `max` 为 100。组件限制显示值在 0 到有效最大值之间。未设置 `value`、数值无效或设置 `indeterminate` 时显示不确定进度。

`long-running-threshold` 控制不确定动画切换为平缓状态的毫秒数。用 `aria-label` 描述正在执行的任务，不要把旋转动画当作实际百分比。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="progress-bar" />

```html
<vscode-progress-bar value="45" max="100" aria-label="下载进度">
</vscode-progress-bar>
<p>下载进度：45%</p>
<vscode-progress-bar indeterminate aria-label="正在处理"> </vscode-progress-bar>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="progress-bar" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
