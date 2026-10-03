# 辅助说明 FormHelper

提供表单字段的补充说明。

[API 参考](../api/generated/form-helper)

## 导入

```js
import 'nusys-ui/dist/vscode-form-helper/index.js';
import 'nusys-ui/dist/vscode-form-container/index.js';
import 'nusys-ui/dist/vscode-form-group/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
import 'nusys-ui/dist/vscode-checkbox/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

将辅助说明放在 FormGroup 中，与标签和控件一起排列。组件提供较弱的文字颜色和段落间距，不是错误校验器。需要屏幕阅读器读取时，为说明设置 id 并由控件使用 `aria-describedby` 关联。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="form" />

```html
<form>
  <vscode-form-container mark-duration="2s">
    <vscode-form-group variant="vertical">
      <vscode-label for="project" required>项目名称</vscode-label>
      <vscode-textfield id="project" name="project" value="示例项目" required>
      </vscode-textfield>
      <vscode-form-helper>修改后表单控件短暂高亮。</vscode-form-helper>
    </vscode-form-group>
    <vscode-checkbox name="enabled" value="yes" label="启用项目" checked>
    </vscode-checkbox>
    <vscode-button type="submit">保存</vscode-button>
    <vscode-button type="reset" secondary>重置</vscode-button>
  </vscode-form-container>
</form>
<output aria-live="polite"> </output>
```

```js
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('output').textContent = JSON.stringify(
    Array.from(new FormData(event.target))
  );
});
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="form-helper" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
