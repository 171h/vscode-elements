# 单选按钮组 RadioGroup

组织单选按钮并提供方向键导航。

[API 参考](../api/generated/radio-group)

## 导入

```js
import 'nusys-ui/dist/vscode-radio-group/index.js';
import 'nusys-ui/dist/vscode-radio/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽接收 `vscode-radio`；使用相同 `name` 保持表单语义。`variant` 控制横向或纵向排列。方向键切换选项并派发 change，Tab 用于进入或离开组。

监听具体单选按钮的 `change` 或组的变化，再查找选中的子按钮。避免把组本身当作具有 `value` 的表单字段。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="radio-group" />

```html
<vscode-radio-group aria-label="保存方式">
  <vscode-radio name="save-mode" value="auto" label="自动" checked>
  </vscode-radio>
  <vscode-radio name="save-mode" value="manual" label="手动"> </vscode-radio>
</vscode-radio-group>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
