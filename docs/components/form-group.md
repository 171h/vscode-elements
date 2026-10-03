# 表单组 FormGroup

排列字段、标签和辅助说明。

[API 参考](../api/generated/form-group)

## 导入

```js
import 'nusys-ui/dist/vscode-form-group/index.js';
import 'nusys-ui/dist/vscode-form-container/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
import 'nusys-ui/dist/vscode-form-helper/index.js';
import 'nusys-ui/dist/vscode-checkbox/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽通常按标签、控件、辅助说明的顺序提供。`variant` 设置排列方式；`size` 调整间距、标签宽度与继承字号，控件整体尺寸应在控件上同步设置。各字段仍需独立名称和约束。参见 [统一尺寸](../form-size)。

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

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
