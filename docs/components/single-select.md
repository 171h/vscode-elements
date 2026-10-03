# 单选框 SingleSelect

下拉选择、组合框过滤与新建选项。

[API 参考](../api/generated/single-select)

## 导入

```js
import 'nusys-ui/dist/vscode-single-select/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-option/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

子项使用 `vscode-option`，业务值放在 `value`，默认选择可用 `selected`。`selected-index` 与 JavaScript `value` 可控制选择，程序赋值不模拟用户 change。动态插入选项后等待 `updateComplete` 再读取最终选择。

`combobox` 启用文字过滤；`filter` 可选择包含、前缀或模糊过滤模式。`creatable` 允许创建选项，`vsc-create-option` 事件可由应用接管。过滤输入并不等于选择值。空字符串选项、required 和初始值应结合具体表单检查。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

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

## 组合框过滤与创建

<ExamplePreview example="combobox" />

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="single-select" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
