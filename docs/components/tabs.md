# 标签页 Tabs

切换成对的标题与面板，移动标签和视图。

[API 参考](../api/generated/tabs)

## 导入

```js
import 'nusys-ui/dist/vscode-tabs/index.js';
import 'nusys-ui/dist/vscode-tab-header/index.js';
import 'nusys-ui/dist/vscode-tab-panel/index.js';
import 'nusys-ui/dist/vscode-fieldset/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

标题与面板按各自在 light DOM 中的顺序一一配对。标题可以放在默认插槽，组件会移到 `header` 插槽。`addons` 插槽承载标题栏右侧操作。`selected-index` 控制当前标签，`panel` 切换面板风格。

方向键移动标题焦点，Enter 激活，`vsc-tabs-select` 的 detail 为 `{selectedIndex}`。该事件不冒泡；布局变化事件会冒泡并跨 shadow DOM。拖动标题排序，拖动面板直属 fieldset 的 legend 移动视图；完整规则见 [拖拽布局](../tabs-drag-drop)。

## 交互示例

使用右上角导航栏的全站主题和尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="tabs" />

```html
<vscode-tabs>
  <vscode-tab-header>文件</vscode-tab-header>
  <vscode-tab-panel>
    <vscode-fieldset>
      <fieldset>
        <legend>资源管理器</legend>
        <vscode-textfield aria-label="文件筛选" placeholder="筛选文件">
        </vscode-textfield>
        <p>index.ts</p>
      </fieldset>
    </vscode-fieldset>
    <fieldset>
      <legend>大纲</legend>
      <p>ProjectSettings</p>
    </fieldset>
  </vscode-tab-panel>
  <vscode-tab-header>搜索</vscode-tab-header>
  <vscode-tab-panel>
    <fieldset>
      <legend>搜索结果</legend>
      <p>拖动标题或分区 legend 调整布局。</p>
    </fieldset>
  </vscode-tab-panel>
</vscode-tabs>
<output aria-live="polite"> </output>
```

```js
const tabs = document.querySelector('vscode-tabs');
tabs.addEventListener('vsc-tabs-select', (event) => {
  document.querySelector('output').textContent =
    '当前标签索引：' + event.detail.selectedIndex;
});
tabs.addEventListener('vsc-tabs-layout-change', (event) => {
  document.querySelector('output').textContent =
    '已移动视图：' + event.detail.views.length;
});
```

## 溢出布局设置

容器宽度不足时，通过 `overflow` 选择标题显示方式。默认从原有单行标题改为自动换行；需要保留单行布局时设置 `scroll` 或 `menu`。

| 设置             | 取值                                              | 默认    |
| ---------------- | ------------------------------------------------- | ------- |
| `overflow`       | `wrap` 换行、`scroll` 水平滚动、`menu` 隐藏项菜单 | `wrap`  |
| `wrap-alignment` | `start` 左对齐、`center` 居中，仅对换行有效       | `start` |

换行时标题栏随内容增高，超长标题也可折行。滚动条仅在溢出且悬停组件时覆盖标题和面板分隔线，不增加布局高度。菜单模式在右端显示 `...`；选择隐藏标签后，该标签出现在可见标题末位，菜单更新为其他隐藏项。DOM 顺序、`selectedIndex` 和选择事件索引保持原有对应关系。

```html
<vscode-tabs overflow="menu" wrap-alignment="center">
  <vscode-tab-header icon="files">文件</vscode-tab-header>
  <vscode-tab-panel>文件内容</vscode-tab-panel>
  <vscode-tab-header icon="search">搜索</vscode-tab-header>
  <vscode-tab-panel>搜索内容</vscode-tab-panel>
</vscode-tabs>
```

程序设置 `selectedIndex` 同样展示目标标题。滚动模式下自动滚入视口；菜单模式下自动显示在可见末位。方向键移动标题焦点，Enter 激活；菜单可用方向键和 Enter 选择，Escape 关闭并恢复焦点。`addons` 中的应用操作仍会占用标题栏空间。

## 溢出与标题图标

选择换行、水平滚动或上下文菜单，调整容器宽度、换行对齐、图文显示和图标位置。菜单中的隐藏标签被选中后会显示在标题栏末位。此示例同时提供 Codicon、自定义 SVG 和字体图标。

<ExamplePreview example="tabs-overflow" />

完整设置见 [标签页溢出与图标](../tabs-overflow)。

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="tabs" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
