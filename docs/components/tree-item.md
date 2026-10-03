# 树项目 TreeItem

嵌套树节点、图标、描述和操作。

[API 参考](../api/generated/tree-item)

## 导入

```js
import 'nusys-ui/dist/vscode-tree-item/index.js';
import 'nusys-ui/dist/vscode-tree/index.js';
import 'nusys-ui/dist/vscode-icon/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

放入 Tree 或另一个 TreeItem 表示层级。默认内容是节点标签，嵌套子项目构成分支。open 表示展开，selected 表示选中，active 用于活动项。

使用 icon-branch、icon-branch-opened、icon-leaf 自定义图标；description 提供说明，actions 放操作，decoration 放右侧装饰。操作应提供独立名称并检查焦点可见性。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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
