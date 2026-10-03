# 菜单项 ContextMenuItem

菜单标签、快捷键和值。

[API 参考](../api/generated/context-menu-item)

## 导入

```js
import 'nusys-ui/dist/vscode-context-menu-item/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
import 'nusys-ui/dist/vscode-context-menu/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

由 ContextMenu 根据 `data` 数组创建；通过 `label`、`value`、`keybinding` 提供操作名称、业务标识与快捷键提示。快捷键文字只是提示，不会注册实际快捷键。`separator` 显示分隔线。不要依赖手写菜单项插槽自动显示，见 [ContextMenu](./context-menu)。

应用监听菜单容器的 `vsc-context-menu-select`；菜单项的内部通讯事件不作为应用层接口。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
