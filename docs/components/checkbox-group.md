# 复选框组 CheckboxGroup

横向或纵向组织复选框。

[API 参考](../api/generated/checkbox-group)

## 导入

```js
import 'nusys-ui/dist/vscode-checkbox-group/index.js';
import 'nusys-ui/dist/vscode-checkbox/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

把相关的 `vscode-checkbox` 放入默认插槽；`variant="horizontal"` 为横向排列，`vertical` 为纵向排列。组负责布局，不是替代原生 form 的值容器，各控件自行设置 `name`、`value`、`checked` 和约束。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="checkbox-group" />

```html
<vscode-checkbox-group variant="vertical" aria-label="导出格式">
  <vscode-checkbox label="HTML" name="format" value="html" checked>
  </vscode-checkbox>
  <vscode-checkbox label="Markdown" name="format" value="md"> </vscode-checkbox>
</vscode-checkbox-group>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
