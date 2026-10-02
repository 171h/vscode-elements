# 分区 Fieldset

包装原生 fieldset，支持复选框与折叠。

[API 参考](../api/generated/fieldset)

## 导入

```js
import 'nusys-ui/dist/vscode-fieldset/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
import 'nusys-ui/dist/vscode-checkbox/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽包裹一个原生 `<fieldset>`，使用 `<legend>` 提供分区标题，保留表单与分区语义。`checkbox` 显示边框复选框，`checked` 启用内容，`unchecked-mode` 控制保持可见、折叠或最小显示。

嵌套分区会保留控件原本的 disabled 状态；取消默认处理后的状态在拖拽后保留。通过 `vsc-fieldset-checked-change` 或 `checkedChange` 可接管行为，见 [fieldset 复选框](../fieldset-checkbox)。分区可用作标签页面板直属视图，见 [拖拽布局](../tabs-drag-drop)。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="fieldset" />

```html
<vscode-fieldset
  checkbox
  checked
  checkbox-label="启用风荷载"
  unchecked-mode="collapsed"
>
  <fieldset>
    <legend>风荷载</legend>
    <vscode-label for="pressure">基本风压</vscode-label>
    <vscode-textfield id="pressure" value="0.5" type="number">
    </vscode-textfield>
    <vscode-checkbox label="考虑阵风" checked> </vscode-checkbox>
  </fieldset>
</vscode-fieldset>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
