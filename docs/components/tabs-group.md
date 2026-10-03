# 标签页组 TabsGroup

排列标签页组件并支持组间拖拽。

[API 参考](../api/generated/tabs-group)

## 导入

```js
import 'nusys-ui/dist/vscode-tabs-group/index.js';
import 'nusys-ui/dist/vscode-tabs/index.js';
import 'nusys-ui/dist/vscode-tab-header/index.js';
import 'nusys-ui/dist/vscode-tab-panel/index.js';
```

也可以使用 `import 'nusys-ui'` 注册全部组件。

## 使用说明

默认插槽接收多个 Tabs，纵向排列。拖动标题栏空白区可移动整个 Tabs；拖入标题或 fieldset 可生成新的标签页组。`empty-text` 配置空容器提示。

`vsc-tabs-group-layout-change` 的 detail 描述 source、destination、tabs 以及可选 header、views。组件不自动持久化布局。应用应使用稳定标识记录移动后的组织关系，见 [拖拽布局](../tabs-drag-drop)。

## 交互示例

使用页面底部的全站主题和示例尺寸选择，使用鼠标或键盘操作。代码视图包含此预览实际执行的 HTML、CSS 与 JavaScript。

<ExamplePreview example="tabs-group" />

```html
<div class="groups">
  <vscode-tabs-group>
    <vscode-tabs>
      <vscode-tab-header>文件</vscode-tab-header>
      <vscode-tab-panel>
        <fieldset>
          <legend>文件列表</legend>
          <p>index.ts</p>
        </fieldset>
      </vscode-tab-panel>
      <vscode-tab-header>大纲</vscode-tab-header>
      <vscode-tab-panel>
        <fieldset>
          <legend>符号</legend>
          <p>组件定义</p>
        </fieldset>
      </vscode-tab-panel>
    </vscode-tabs>
  </vscode-tabs-group>
  <vscode-tabs-group empty-text="拖动标题栏空白处，将整组移入此处">
  </vscode-tabs-group>
</div>
```

## 功能场景

下列场景补充状态、组合约束、数据操作和交互边界。每项列出覆盖的公开功能，代码视图可直接查阅实际运行代码。

<ComponentExamples component="tabs-group" />

## 相关指南

[主题与图标](../guide/theming) · [表单与校验](../guide/forms) · [常见问题](../guide/faq)
