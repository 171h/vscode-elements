# 按钮 Button

主按钮、次按钮、图标按钮及表单提交。

[API 参考](../api/generated/button)

## 导入

```js
import 'nusys-ui/dist/vscode-button/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

使用 `secondary` 显示次按钮，`disabled` 阻止操作，`icon` 与 `icon-after` 在文字两侧添加图标。纯图标按钮应提供 `aria-label` 或 `title`；自定义图标放入默认插槽时使用 `icon-only`。

表单中的保存按钮显式设置 `type="submit"`，重置按钮使用 `type="reset"`，普通操作使用 `type="button"`。`size` 支持三个统一尺寸。按 Tab 检查焦点，使用 Enter 或空格触发。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="button" />

```html
<vscode-button icon="save">保存</vscode-button>
<vscode-button secondary>取消</vscode-button>
<vscode-button disabled>已禁用</vscode-button>
<vscode-button icon="refresh" aria-label="刷新"> </vscode-button>
```

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
