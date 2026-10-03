# 表单容器 FormContainer

管理表单布局和已修改状态高亮。

[API 参考](../api/generated/form-container)

## 导入

```js
import 'nusys-ui/dist/vscode-form-container/index.js';
import 'nusys-ui/dist/vscode-form-group/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
import 'nusys-ui/dist/vscode-form-helper/index.js';
import 'nusys-ui/dist/vscode-checkbox/index.js';
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

负责表单字段布局和短时交互高亮，本身不是原生 form。需要提交、重置和 FormData 时，放到外层 `<form>` 中。

`mark-duration` 默认 5000ms，也可用 CSS 时间或 `forever`。`mark()` 手动高亮，`reset()` 清除高亮，监听不冒泡的 `vsc-dirty-change`。高亮不表示数据是否保存。完整边界见 [已修改状态](../form-dirty-highlight)。

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

<ComponentExamples component="form-container" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
