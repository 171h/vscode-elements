# 文本框 Textfield

单行输入、校验、百分比及文件输入。

[API 参考](../api/generated/textfield)

## 导入

```js
import 'nusys-ui/dist/vscode-textfield/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

`type` 支持 text、password、email、number、file 等输入类型；完整范围见 API。`readonly` 保留读取与焦点，`disabled` 禁止交互与提交。`content-before` 和 `content-after` 插槽可放图标等内容。

用 `name` 参与表单，使用 `required`、`pattern`、`min`、`max`、`step` 与长度约束。`checkValidity()` 判断有效性，`reportValidity()` 显示提示，对 `wrappedElement.setCustomValidity()` 设置应用错误，再调用组件的校验方法同步结果。`invalid` 仅控制样式，不能替代校验。

`percentage` 模式下，界面百分数和 `value` 的小数值单位不同，详见 [百分比输入](../textfield-percentage)。文件输入通过 `wrappedElement.files` 读取文件，不能用程序设置非空文件路径。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="textfield" />

```html
<vscode-label for="name">项目名称</vscode-label>
<vscode-textfield id="name" name="name" placeholder="请输入项目名称" required>
</vscode-textfield>
<vscode-textfield aria-label="禁用示例" value="不可编辑" disabled>
</vscode-textfield>
<vscode-button id="validate" secondary>检查有效性</vscode-button>
<output aria-live="polite"> </output>
```

```js
document.querySelector('#validate').addEventListener('click', () => {
  document.querySelector('output').textContent = document
    .querySelector('#name')
    .reportValidity()
    ? '校验通过'
    : '请填写项目名称';
});
```

## 百分比与程序值

<ExamplePreview example="percentage" />

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="textfield" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
