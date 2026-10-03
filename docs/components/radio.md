# 单选按钮 Radio

同名按钮中的单一选项。

[API 参考](../api/generated/radio)

## 导入

```js
import 'nusys-ui/dist/vscode-radio/index.js';
import 'nusys-ui/dist/vscode-radio-group/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

同一组按钮使用相同 `name`、不同 `value`，选中状态使用 `checked`。建议放入 [RadioGroup](./radio-group)，得到一致的键盘导航。给每个按钮设置 `label`；表单只提交选中的同名按钮。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="radio-group" />

```html
<vscode-radio-group aria-label="保存方式">
  <vscode-radio name="save-mode" value="auto" label="自动" checked>
  </vscode-radio>
  <vscode-radio name="save-mode" value="manual" label="手动"> </vscode-radio>
</vscode-radio-group>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="radio" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
