# 复选框 Checkbox

独立的布尔选择与表单提交。

[API 参考](../api/generated/checkbox)

## 导入

```js
import 'nusys-ui/dist/vscode-checkbox/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

`label` 是可见文字与可访问名称；`checked` 控制选中，`indeterminate` 表示部分选中状态。表单提交使用 `name` 与 `value`，未勾选或禁用时不提交。

`required` 表示必须勾选此控件，不能直接表示“复选框组中至少选择一个”。组级约束应由应用校验。监听 `change` 后读取 `checked`。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="checkbox" />

```html
<vscode-checkbox label="自动保存" checked> </vscode-checkbox>
<vscode-checkbox label="启动时恢复项目"> </vscode-checkbox>
<vscode-checkbox label="已禁用" disabled> </vscode-checkbox>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="checkbox" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
