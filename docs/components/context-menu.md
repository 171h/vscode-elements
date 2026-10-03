# 上下文菜单 ContextMenu

展示操作列表并响应键盘选择。

[API 参考](../api/generated/context-menu)

## 导入

```js
import 'nusys-ui/dist/vscode-context-menu/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
import 'nusys-ui/dist/vscode-context-menu-item/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

用 `show` 控制显示，通过 JavaScript `data` 数组提供菜单项。当前实现默认 `data` 为数组并优先渲染该数组，不能依赖手写的插槽菜单项自动显示。菜单项使用 `label`，`prevent-close` 可阻止选择后自动关闭。菜单位置由应用 CSS 控制。

当前实现派发 `vsc-context-menu-select`，详情包含 `value`、`label`、`keybinding` 等字段；上游旧说明中的 `vsc-menu-select` 不适用于本项目。使用方向键、Enter 和 Escape 检查菜单操作。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="context-menu" />

```html
<vscode-button id="open">显示菜单</vscode-button>
<vscode-context-menu></vscode-context-menu>
<output aria-live="polite"> </output>
```

```js
const menu = document.querySelector('vscode-context-menu');
menu.data = [
  {label: '复制', value: 'copy', keybinding: 'Ctrl+C'},
  {label: '粘贴', value: 'paste', keybinding: 'Ctrl+V'},
];
menu.show = true;
document.querySelector('#open').addEventListener('click', (event) => {
  event.stopPropagation();
  menu.show = true;
});
menu.addEventListener('vsc-context-menu-select', (event) => {
  document.querySelector('output').textContent = '操作：' + event.detail.value;
});
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="context-menu" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
