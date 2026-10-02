# 标签页溢出显示

`vscode-tabs` 使用 `overflow` 选择标题溢出时的行为。默认 `wrap` 自动换行，标题栏高度随内容增长。`wrap-alignment="start"` 左对齐（默认），`wrap-alignment="center"` 居中对齐。右侧 `addons` 插槽仍保留可用空间。

```html
<vscode-tabs overflow="wrap" wrap-alignment="center">
  <vscode-tab-header>标题</vscode-tab-header>
  <vscode-tab-panel>内容</vscode-tab-panel>
</vscode-tabs>
```

## 水平滚动

设置 `overflow="scroll"` 保持单行标题。悬停组件时，8px 高的滚动条覆盖在标题和面板的分隔线上，不改变布局高度。选择标签或使用左右方向键移动焦点时，目标标题自动滚入视口。触摸和触控板也可直接滚动标题。
