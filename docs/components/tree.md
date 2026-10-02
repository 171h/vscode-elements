# 树 Tree

层级导航、选择、缩进线和展开方式。

[API 参考](../api/generated/tree)

## 导入

```js
import 'nusys-ui/dist/vscode-tree/index.js';
import 'nusys-ui/dist/vscode-tree-item/index.js';
import 'nusys-ui/dist/vscode-icon/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

通过嵌套 TreeItem 表示层级，分支可用 open 初始化展开。`multi-select` 允许多选；`expand-mode` 为 singleClick 或 doubleClick；`indent` 控制缩进，`indent-guides` 为 none、onHover、always；`hide-arrows` 隐藏展开箭头。

`vsc-tree-select` 的运行时 detail 是 `VscodeTreeItem[]`，直接读取 `event.detail.length`。现有导出类型 `VscTreeSelectEvent` 声明为 `{selectedItems}`，与运行时不一致，集成时应以数组行为为准。数组包含节点元素，不要把元素直接当作可持久化业务值。方向键导航、展开和收起，Enter 或空格选择；使用 Ctrl/Cmd 和 Shift 检查多选。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="tree" />

```html
<vscode-tree multi-select indent-guides="always" aria-label="项目文件">
  <vscode-tree-item open>
    <vscode-icon slot="icon-branch" name="folder"> </vscode-icon>
    <vscode-icon slot="icon-branch-opened" name="folder-opened"> </vscode-icon
    >src<vscode-tree-item>
      <vscode-icon slot="icon-leaf" name="file-code"> </vscode-icon
      >index.ts<span slot="description">入口</span>
    </vscode-tree-item>
    <vscode-tree-item>styles.ts</vscode-tree-item>
  </vscode-tree-item>
  <vscode-tree-item>README.md</vscode-tree-item>
</vscode-tree>
<output aria-live="polite"> </output>
```

```js
document
  .querySelector('vscode-tree')
  .addEventListener('vsc-tree-select', (event) => {
    document.querySelector('output').textContent =
      '选中数量：' + event.detail.length;
  });
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
