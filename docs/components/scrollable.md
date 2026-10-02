# 滚动容器 Scrollable

使用 VS Code 风格滚动条展示溢出内容。

[API 参考](../api/generated/scrollable)

## 导入

```js
import 'nusys-ui/dist/vscode-scrollable/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

在组件或外层明确限制高度和宽度，默认插槽提供内容。没有尺寸约束时内容可能自然扩展，无法出现滚动条。`scrollPos` 控制滚动位置，`scrollMax` 返回当前最大位置。

监听 `vsc-scrollable-scroll` 获取组件滚动通知；滚动容器应保留键盘可到达的内容和可见焦点。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="scrollable" />

```html
<vscode-scrollable style="height: 160px; width: 100%">
  <div style="height: 380px; padding: 12px">
    文件列表
    <p>向下滚动查看剩余内容。</p>
    <p style="margin-top: 220px">列表底部</p>
  </div>
</vscode-scrollable>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
