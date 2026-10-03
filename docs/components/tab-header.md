# 标签标题 TabHeader

标签页的可聚焦标题与活动状态。

[API 参考](../api/generated/tab-header)

## 导入

```js
import 'nusys-ui/dist/vscode-tab-header/index.js';
import 'nusys-ui/dist/vscode-tabs/index.js';
import 'nusys-ui/dist/vscode-tab-panel/index.js';
import 'nusys-ui/dist/vscode-fieldset/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

用作 Tabs 的标题，内容放在默认插槽。活动、隐藏和焦点状态由父组件同步，应用通过父组件 selectedIndex 控制选择。标题顺序必须与面板顺序一致。

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

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="tab-header" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
