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

用 `show` 控制显示，可传入 `data` 数组，或提供菜单项子节点。菜单项使用 `label`，其默认内容不会自动变成标签。`prevent-close` 可阻止选择后自动关闭。菜单位置由应用 CSS 控制。

当前实现派发 `vsc-context-menu-select`，详情包含 `value`、`label`、`keybinding` 等字段；上游旧说明中的 `vsc-menu-select` 不适用于本项目。使用方向键、Enter 和 Escape 检查菜单操作。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="context-menu" />

```html
<vscode-button id="open">显示菜单</vscode-button>
<vscode-context-menu>
  <vscode-context-menu-item value="copy" label="复制" keybinding="Ctrl+C">
  </vscode-context-menu-item>
  <vscode-context-menu-item value="paste" label="粘贴" keybinding="Ctrl+V">
  </vscode-context-menu-item>
</vscode-context-menu>
<output aria-live="polite"> </output>
```

```js
const menu = document.querySelector('vscode-context-menu');
document.querySelector('#open').addEventListener('click', () => {
  menu.show = true;
});
menu.addEventListener('vsc-context-menu-select', (event) => {
  document.querySelector('output').textContent = '操作：' + event.detail.value;
});
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
