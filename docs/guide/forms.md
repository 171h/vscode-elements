# 表单与校验

文本框、文本域、选择框、复选框、单选按钮和按钮支持原生表单关联。`vscode-form-container` 负责布局和已修改状态；提交与原生校验仍由外层 `<form>` 负责。

## 标签、名称与提交

```html
<form id="settings">
  <vscode-form-container>
    <vscode-form-group variant="vertical">
      <vscode-label for="project" required>项目名称</vscode-label>
      <vscode-textfield id="project" name="project" required></vscode-textfield>
      <vscode-form-helper>用于显示在资源管理器中。</vscode-form-helper>
    </vscode-form-group>
    <vscode-checkbox
      name="enabled"
      value="yes"
      label="启用"
      checked
    ></vscode-checkbox>
    <vscode-button type="submit">保存</vscode-button>
    <vscode-button type="reset" secondary>重置</vscode-button>
  </vscode-form-container>
</form>
<pre id="result" aria-live="polite"></pre>
```

```js
const form = document.querySelector('#settings');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#result').textContent = JSON.stringify(
    Array.from(new FormData(form).entries()),
    null,
    2
  );
});
```

只有有 `name` 且未禁用的成功控件进入 `FormData`。未选中的复选框、单选按钮不会提交。多选值请使用 `formData.getAll(name)`，避免用 `Object.fromEntries()` 丢失同名值。

## 校验

`required`、`min`、`max`、`step`、`pattern` 等约束按组件支持范围使用。`vscode-label` 的 `required` 只显示必填标记，实际约束须设置在控件上。

```js
const field = document.querySelector('#project');
field.setCustomValidity('');
if (field.value.trim() === '') {
  field.setCustomValidity('请填写项目名称');
}
field.reportValidity();
```

`checkValidity()` 返回结果，`reportValidity()` 同时请求浏览器显示提示。验证后可通过 `validity` 和 `validationMessage` 读取具体原因。修正后记得清空自定义错误。

## 本项目的表单扩展

- [统一尺寸](../form-size)：`small`、`medium`、`large`，可按控件或全局设置。
- [百分比输入](../textfield-percentage)：界面 `12.5%` 对应程序值与提交值 `'0.125'`；`min`、`max`、`step` 也使用小数单位。
- [多选标签](../multi-select-labels)：使用 `abbreviation` 缩写，优先级为缩写、标签、值。
- [表单已修改状态](../form-dirty-highlight)：仅标识最近交互过的表单；高亮消失不等于数据保存成功。
- [fieldset 复选框](../fieldset-checkbox)：统一控制内容的禁用、折叠和恢复。

## 无障碍与键盘

为每个输入控件提供可访问名称，优先使用关联的 `vscode-label`，复选框与单选按钮使用 `label`。用 Tab 检查焦点顺序，验证禁用控件无法交互。单选按钮组的 `name` 必须一致；组合框输入用于过滤，不应当作已经选择的表单值。
