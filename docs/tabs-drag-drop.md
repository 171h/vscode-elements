# 标签页与侧栏视图拖拽

标签页支持原生 HTML 移动拖拽。导入 `nusys-ui` 主入口，或分别导入 tabs、tab-header、tab-panel 和 fieldset 模块。

```html
<vscode-tabs>
  <vscode-tab-header>资源管理器</vscode-tab-header>
  <vscode-tab-panel>
    <vscode-fieldset>
      <fieldset>
        <legend>文件</legend>
        <label>筛选 <input name="filter" /></label>
      </fieldset>
    </vscode-fieldset>
    <fieldset>
      <legend>大纲</legend>
      任意内容
    </fieldset>
  </vscode-tab-panel>
  <vscode-tab-header>搜索</vscode-tab-header>
  <vscode-tab-panel></vscode-tab-panel>
</vscode-tabs>
```

自定义组件包装调用方提供的原生 fieldset，也可直接使用原生 fieldset。只有标签页面板的直属子节点可作为移动视图。通过视图的第一个 legend 拖拽；嵌套表单 fieldset 和控件不作为拖拽入口。每个可移动视图都应提供 legend。

## 拖拽操作

- 将标签页标题拖到另一标题的任一侧，可对标题和面板成对排序。排序后保持当前面板选中。
- 将 legend 拖到视图的上半区或下半区，可插入到该视图之前或之后。
- 放到面板空白处或空面板，可追加视图。
- 将 legend 悬停在标签页标题中间一半区域 500 ms，可激活面板。在此放置可将视图追加至该面板。
- 将 legend 放到标题左、右边缘或标签栏末尾，可创建以该 legend 命名的新标签页。最后一个视图移出后，自动生成的标签页会被移除；调用方提供的空标签页仍保留，可继续接收视图。
- 将标签页标题拖入另一面板，可按原有顺序移动其全部直属视图。源标题和面板仅在不含其他内容时移除，无关内容保留。悬停在另一标题中间 500 ms 可显示其面板，再继续移入；在标题栏释放仍执行标签页排序。
- 上述移动均支持同一文档中的不同标签页组件。
- 按 Escape、拖拽结束、离开目标或断开源组件时，清除反馈和待执行的激活操作。外部文件或文本拖拽被忽略。
- 拖到可滚动内容的顶部或底部边缘时自动滚动。提示动画遵循 `prefers-reduced-motion`。

## 标签页组

`vscode-tabs-group` 纵向排列 `vscode-tabs` 子节点，并提供组级拖拽。容器为空时显示提示：

```html
<vscode-tabs-group empty-text="将标签页组放到此处">
  <vscode-tabs>
    <vscode-tab-header>资源管理器</vscode-tab-header>
    <vscode-tab-panel>
      <fieldset><legend>文件</legend></fieldset>
    </vscode-tab-panel>
  </vscode-tabs>
  <vscode-tabs>...</vscode-tabs>
</vscode-tabs-group>
```

- 拖拽标签栏中既非标题也非附加控件的空白背景，可移动整组。包含全部标题的拖拽图像随指针移动，占位提示显示插入位置。可在原容器排序，也可移动到另一 `vscode-tabs-group`；相邻组以短动画平滑移开。
- 标题在自身组内保留原有行为。将标题放到容器背景，可在该位置创建独立组。源组最后一个标签页移出后，空的 `vscode-tabs` 会被移除。
- 将 fieldset 的 legend 放到容器，可创建新组，自动生成的标签页以 legend 命名，面板包含该视图。最后一个视图移出后，自动生成的组会被移除。
- 拖拽标签页或视图经过容器时，占位提示显示新组将包含的标题。指针进入已有 `vscode-tabs` 时，改用内部标签页和视图的拖拽行为。
- 可监听冒泡且跨 shadow DOM 的 `vsc-tabs-group-layout-change` 事件保存分组。detail 包含 `source`（原组或 null）、`destination`、`tabs`（移动或创建的组件），以及可选的 `header` 和移动的 `views`。

容器负责布局和接收放置，不提供 VS Code 工作台的持久化机制。应用应根据事件保存布局。`empty-text` 可替换内置提示，默认值为“将标签页组拖到此处”。

## 状态与事件

移动保留原有节点、输入值和事件监听器，不自动存储数据。可监听冒泡且跨 shadow DOM 的 `vsc-tabs-layout-change` 保存布局。detail 包含源和目标标签页元素 `source`、`destination`，移动的视图节点 `views`，以及可选的拖拽标题 `header`。悬停激活会派发 `vsc-tabs-select`。

标题与面板仍按 light DOM 中的对应顺序配对，应用自行修改 DOM 时应保持这种配对关系。

## 主题与尺寸

拖拽使用以下主题变量：`--vscode-activityBar-dropBorder`、`--vscode-sideBar-dropBackground`、`--vscode-sideBarSectionHeader-background`、`--vscode-foreground`、`--vscode-focusBorder` 和 `--vscode-contrastActiveBorder`。

fieldset 和 legend 使用侧栏背景与前景、分区标题前景与边框，以及 `--vscode-contrastBorder`、`--vscode-focusBorder` 和 `--vscode-disabledForeground`。侧栏变量缺失时回退至编辑器和前景变量，再回退至系统颜色。高对比度边框与 Windows 强制颜色模式下仍可见，主题变化即时更新现有视图。

legend 无边框且背景透明，与 fieldset 边框后方表面融合，避免暗色主题中的矩形色块；主题前景色保证其在明暗表面均可读。

在 `vscode-fieldset` 或面板直属的原生 fieldset 上设置 `size="small"`、`size="medium"`（默认）或 `size="large"`。边框圆角与项目表单控件一致，分别为 1px、4px、6px；应用可覆盖 `--vsc-form-control-border-radius`。展示页的全局尺寸按钮和独立示例的尺寸按钮会同步更新包装组件与原生 fieldset。

同一套样式适用于包装组件和面板直属原生 fieldset，不影响嵌套表单 fieldset。低优先级允许应用覆盖 CSS。由于 shadow slot 无法为原生 fieldset 的 legend 后代设置样式，样式会在所属文档或 shadow root 中安装一次。

文档示例提供浅色、深色和高对比度主题。启动文档站点后，运行 `npm run docs:test` 检查预览、键盘、表单与布局，并在 `.wireit/` 下保存截图。

## VS Code 参考

实现参考以下采用 MIT 许可证的 Microsoft 源码中的行为，不复制工作台服务基础设施：

- [compositeBar.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/parts/compositeBar.ts)：原生移动操作、按序插入容器及将视图提升为新容器。
- [viewPaneContainer.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/parts/views/viewPaneContainer.ts)：中点命中检测、半面板放置遮罩和清理。

本库保留横向标签页布局，标题中间和边缘区域分别用于移入已有面板及提升为新标签页。拖拽图像由浏览器绘制并随指针移动，具体外观取决于浏览器和操作系统，与 VS Code 的原生 HTML 拖拽类似。此 API 不提供工作台持久化或跨窗口拖拽。

## 交互示例

拖动标签页标题排序；拖动 legend 将视图移到另一面板或提升为新标签。

<ExamplePreview example="tabs" />

拖动标题栏的空白区域，将整个标签页组移到另一容器。

<ExamplePreview example="tabs-group" />

更多接口见 [Tabs API](./api/generated/tabs) 和 [TabsGroup API](./api/generated/tabs-group)。
