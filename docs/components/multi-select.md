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

JavaScript `value` 是字符串数组，`selected-indexes` 对应多个索引。各选项通过 `selected` 设置初始选择。组合框模式支持过滤与创建选项，读取表单同名值使用 `FormData.getAll()`。

展示区按 `abbreviation`、标签、业务值的顺序选择文字，空间不足时折叠并提供完整提示。详见 [多选标签](../multi-select-labels)。动态构建选项时避免把过滤输入当作已选业务值。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
