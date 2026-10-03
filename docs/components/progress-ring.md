# 进度环 ProgressRing

以旋转指示器提示正在处理。

[API 参考](../api/generated/progress-ring)

## 导入

```js
import 'nusys-ui/dist/vscode-progress-ring/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

此组件显示不确定的旋转进度，不接受百分比值。使用 `aria-label` 提供任务名称；`aria-live` 与 `role` 可按场景调整。需要表示数值进度时使用 [ProgressBar](./progress-bar)。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="progress-ring" />

```html
<vscode-progress-ring aria-label="正在加载"> </vscode-progress-ring>
<span>正在加载项目…</span>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
