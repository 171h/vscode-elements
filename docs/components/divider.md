# 分隔线 Divider

分隔内容与操作区域。

[API 参考](../api/generated/divider)

## 导入

```js
import 'nusys-ui/dist/vscode-divider/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

将分隔线放在不同内容区域之间。组件使用主题边框颜色；外部间距由布局容器或应用 CSS 设置。分隔线不承载操作，也不替代标题语义。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="divider" />

```html
<p>文件操作</p>
<vscode-divider> </vscode-divider>
<p>项目设置</p>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="divider" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
