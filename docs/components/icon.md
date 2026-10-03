# 图标 Icon

Codicon 图标、尺寸、旋转与操作图标。

[API 参考](../api/generated/icon)

## 导入

```js
import 'nusys-ui/dist/vscode-icon/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

页面必须加载带 `vscode-codicon-stylesheet` id 的 Codicon CSS。`name` 使用 Codicon 名称，`size` 接受像素数或 `small`、`medium`、`large`。启用 `spin` 后可用 `spin-duration` 设置秒数。

`action-icon` 将图标渲染为可操作按钮，使用 `label` 提供可访问名称，监听 `vsc-click`。装饰图标避免重复朗读，可按场景设置 `aria-hidden="true"`。参见 [主题与图标](../guide/theming)。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="icon" />

```html
<vscode-icon name="files"> </vscode-icon>
<vscode-icon name="sync" spin> </vscode-icon>
<vscode-icon name="refresh" action-icon label="刷新"> </vscode-icon>
<output aria-live="polite"> </output>
```

```js
document.querySelector('[action-icon]').addEventListener('vsc-click', () => {
  document.querySelector('output').textContent = '已刷新';
});
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
