# 多选框 MultiSelect

多项选择、缩写标签与折叠显示。

[API 参考](../api/generated/multi-select)

## 导入

```js
import 'nusys-ui/dist/vscode-multi-select/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-option/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

JavaScript `value` 是字符串数组，`selectedIndexes` 是仅通过 JavaScript 设置的多个索引。各选项通过 `selected` 设置初始选择。组合框模式支持过滤与创建选项，读取表单同名值使用 `FormData.getAll()`。

展示区按 `abbreviation`、标签、业务值的顺序选择文字，空间不足时折叠并提供完整提示。详见 [多选标签](../multi-select-labels)。动态构建选项时避免把过滤输入当作已选业务值。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="multi-select" />

```html
<vscode-label for="formats">导出格式</vscode-label>
<vscode-multi-select id="formats" name="formats">
  <vscode-option value="html" abbreviation="HTML" selected
    >超文本标记语言</vscode-option
  >
  <vscode-option value="markdown" abbreviation="MD" selected
    >Markdown 文档</vscode-option
  >
  <vscode-option value="json">JSON 数据</vscode-option>
  <vscode-option value="xml">XML 数据</vscode-option>
</vscode-multi-select>
<output aria-live="polite"> </output>
```

```js
const select = document.querySelector('#formats');
const update = () => {
  document.querySelector('output').textContent =
    '选中值：' + JSON.stringify(select.value);
};
select.addEventListener('change', update);
update();
```

## 组合框过滤与创建

<ExamplePreview example="combobox" />

## 功能场景

设置 `value`、`selectedIndexes`，调用 `selectAll()` 或 `selectNone()` 都会同步表单关联值与必填校验。程序设置不会自动触发 `change`；用户点击、键盘选择和下拉全选／清空会触发 `change`。读取渲染后的标签时等待 `await select.updateComplete`。

下拉框的全选操作跳过未选中的 `disabled` 选项，并保留已有选择。程序调用 `selectAll()` 仍会选中全部选项，包括禁用项；应用可按业务需要用 `value` 或 `selectedIndexes` 控制选择。

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="multi-select" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
