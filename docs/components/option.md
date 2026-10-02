# 选项 Option

选择框内的值、描述与缩写。

[API 参考](../api/generated/option)

## 导入

```js
import 'nusys-ui/dist/vscode-option/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-single-select/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

用在 SingleSelect 或 MultiSelect 内，不作为独立页面控件。`value` 是程序与提交值，`label` 可覆盖展示标签，默认插槽可提供文字。`description` 增加次要说明；`disabled` 阻止选择；`selected` 表示选中。

`abbreviation` 为多选展示区提供紧凑缩写，不改变提交值。详见 [多选标签](../multi-select-labels)。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="single-select" />

```html
<vscode-label for="language">语言</vscode-label>
<vscode-single-select id="language" name="language">
  <vscode-option value="ts" description="类型安全" selected
    >TypeScript</vscode-option
  >
  <vscode-option value="js">JavaScript</vscode-option>
  <vscode-option value="legacy" disabled>旧版语言</vscode-option>
</vscode-single-select>
<output aria-live="polite">当前值：ts</output>
```

```js
const select = document.querySelector('#language');
select.addEventListener('change', () => {
  document.querySelector('output').textContent = '当前值：' + select.value;
});
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
