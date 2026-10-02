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

## 溢出菜单

设置 `overflow="menu"`，仅在标题无法完整放入容器时显示右侧 `...` 按钮。按钮打开 `vscode-context-menu`，列出所有未显示标题。选择菜单项后激活对应面板，将该标题显示在标题栏最后一个位置，并更新菜单。

菜单支持方向键、Enter、Escape 和外部点击关闭。左右方向键在可见标题中移动，隐藏标题可通过菜单访问。程序修改 `selectedIndex` 也会显示对应标题。容器缩放、标题内容变化和添加删除标签后自动重新计算。菜单使用浏览器 Popover 顶层，避免被父容器裁剪。

显示顺序不会改变标题与面板的 DOM 顺序，`selectedIndex` 和 `vsc-tabs-select` 仍使用原有索引。单个标题宽于可用空间时，菜单模式截断该标题，保持菜单按钮可访问。

## 标题图标

每个 `vscode-tab-header` 可单独配置：

| 设置            | 取值                                                          | 默认        |
| --------------- | ------------------------------------------------------------- | ----------- |
| `icon`          | Codicon 名称                                                  | 无图标      |
| `icon-position` | `start`（标题左侧）、`end`（标题右侧）                        | `start`     |
| `icon-display`  | `icon`（仅图标）、`icon-text`（图标加文字）、`text`（仅文字） | `icon-text` |

字体图标需要按既有 `vscode-icon` 约定引入带 `id="vscode-codicon-stylesheet"` 的 Codicon 样式表。任意自定义字体图标可放入 `icon` 插槽，其字体样式由使用者提供。自定义 SVG 使用相同插槽，优先于 `icon` 属性；建议提供 `viewBox` 并使用 `currentColor`。

```html
<vscode-tab-header icon="gear" icon-position="end">设置</vscode-tab-header>
<vscode-tab-header icon-display="icon">
  <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 2h12v12H2z" />
  </svg>
  工具
</vscode-tab-header>
<vscode-tab-header>
  <span slot="icon" class="my-font-icon" aria-hidden="true">&#xe001;</span>
  自定义字体
</vscode-tab-header>
```

图标尺寸为标题内容高度的 80%，随主题字体、面板风格和 `--vsc-tab-header-height` 自动调整。此 CSS 变量控制标题内容最小高度，默认 20px（面板风格 31px）。图标不参与无障碍名称计算；纯图标模式仍保留默认插槽中的标题文字，必须提供有意义的文字或 `aria-label`。没有图标时建议使用 `text` 或默认模式。

完整示例见 [溢出与图标示例](../dev/vscode-tabs/overflow-icons.html)。
