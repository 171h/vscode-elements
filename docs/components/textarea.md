# 文本域 Textarea

多行输入及长度约束。

[API 参考](../api/generated/textarea)

## 导入

```js
import 'nusys-ui/dist/vscode-textarea/index.js';
import 'nusys-ui/dist/vscode-label/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

使用 `rows` 控制初始可见行数，`name` 参与表单，`maxlength` 与 `minlength` 约束文本长度。提供关联标签。监听 `input` 获取编辑过程，监听 `change` 处理确认后的变化。与文本框相同，禁用和只读状态应区分使用。

## 交互示例

选择主题和尺寸，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="textarea" />

```html
<vscode-label for="description">项目说明</vscode-label>
<vscode-textarea
  id="description"
  name="description"
  rows="4"
  maxlength="140"
  placeholder="最多 140 个字符"
>
</vscode-textarea>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
