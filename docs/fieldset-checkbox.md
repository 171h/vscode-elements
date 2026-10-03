# Fieldset 复选框

`vscode-fieldset` 可在边框右上角显示与 legend 垂直对齐的复选框，默认控制内容的启用状态。

```html
<vscode-fieldset checkbox checkbox-label="风荷载" unchecked-mode="collapsed">
  <fieldset>
    <legend>风荷载</legend>
    <label>基本风压 <input /></label>
  </fieldset>
</vscode-fieldset>
```

默认插槽应包含带 legend 的原生 fieldset。复选框在组件内部渲染，内容保留原生表单语义。

标题默认加粗。复选框及其标签位于右上角边框线上，与当前标题垂直居中对齐；标签字号跟随标题，使用常规字重和略淡的标题颜色。切换组件尺寸或自定义标题字号后，仍保持此对齐关系。

标题和复选框标签的背景共用 `--vsc-fieldset-header-background`，默认取 `--vscode-sideBar-background`，再回退到 `--vscode-editor-background`。在编辑区参数页或自定义容器中，将此变量设置在 `vscode-fieldset` 或其祖先上，以匹配实际承载表面：

```css
vscode-fieldset {
  --vsc-fieldset-header-background: var(--vscode-editor-background);
}
```

输入框获得焦点时，分区不增加外侧焦点框；输入控件自身和可聚焦标题仍保留焦点提示。

## 属性

| HTML 属性        | JavaScript 属性 | 类型                                    | 默认值      | 说明                       |
| ---------------- | --------------- | --------------------------------------- | ----------- | -------------------------- |
| `checkbox`       | `checkbox`      | boolean                                 | `false`     | 在边框上显示复选框。       |
| `checkbox-label` | `checkboxLabel` | string                                  | `''`        | 复选框标签。               |
| `checked`        | `checked`       | boolean                                 | `false`     | 勾选状态；勾选时启用内容。 |
| `disabled`       | `disabled`      | boolean                                 | `false`     | 禁用整个分区及标题复选框。 |
| `unchecked-mode` | `uncheckedMode` | `'visible' \| 'collapsed' \| 'minimal'` | `'visible'` | 未勾选时的展示方式。       |

`checkbox`、`checked`、`disabled` 和 `unchecked-mode` 会反映到 HTML 属性，可用 `vscode-fieldset[checked]` 选择器设置样式。`checkboxLabel` 不会自动反映到 HTML 属性。

## 未勾选时的展示方式

| 模式        | 展示方式                                     |
| ----------- | -------------------------------------------- |
| `visible`   | 禁用内容，但保持可见。                       |
| `collapsed` | 禁用并隐藏内容，保留标题、边框和复选框。     |
| `minimal`   | 隐藏内容、标题和边框，仅保留复选框及其标签。 |

没有 checkbox 属性时，组件不显示复选框，也不会修改原生 fieldset 的禁用状态。

## 自定义行为

切换复选框时派发可取消的 `vsc-fieldset-checked-change` 事件，其 detail 为 `{checked}`。调用 `preventDefault()` 可跳过默认的启用、禁用和折叠行为，由应用自行处理。

```js
const fieldset = document.querySelector('vscode-fieldset');

fieldset.addEventListener('vsc-fieldset-checked-change', (event) => {
  if (!event.detail.checked && hasUnsavedChanges()) {
    event.preventDefault();
    showWarning();
  }
});
```

`checkedChange` 回调属性提供相同入口，返回 false 的效果与 `preventDefault()` 相同：

```js
fieldset.checkedChange = (checked) => {
  console.log('复选框当前状态', checked);
};
```

取消默认处理后的内容状态在拖拽或重新连接后保留；之后通过代码修改 checked、checkbox 或 uncheckedMode 属性会重新应用默认行为。

通过代码修改 checked 属性会应用默认行为。自定义处理可通过 fieldsetElement 获取原生元素。

## 动画与布局

展示方式改变组件高度时，使用 180 ms 动画。偏好 `prefers-reduced-motion: reduce` 的用户直接看到最终状态。

应用设置的 min-height 会限制折叠高度。调用方提供的内联 height、overflow 及其 !important 优先级，在初始化以及动画结束或中断后均会保留。动画只临时覆盖所需样式。

## 表单行为

未勾选时，原生 fieldset 被禁用，其原生表单控件不可操作且不会提交。组件还同步内部库表单控件的 disabled 状态，使 shadow DOM 内的输入框不能通过键盘编辑。重新勾选或移除 checkbox 时恢复各控件原有的 disabled 状态；原先禁用的控件仍保持禁用。动态加入的库控件同样处理，移出此 fieldset 后恢复原状态。

嵌套的 vscode-fieldset 共用控件的原始禁用状态。任意一层仍禁用时，控件继续禁用；所有层启用后恢复控件原有状态。视图移出父级后，由剩余的禁用来源决定状态。

原生 fieldset 初始带 disabled 属性时，内容和标题复选框始终禁用。

需要响应业务权限或父级禁用状态时，动态设置 `vscode-fieldset.disabled`。该属性禁用内容和启用框，但保留 `checked` 和控件取值；恢复后，原本禁用的控件仍然禁用。未勾选只禁用内容，不禁用启用框。

`collapsed` 和 `minimal` 从折叠动画开始就对内容应用 `inert`，让帮助链接、按钮及其他可交互内容退出键盘导航和无障碍树。内容中的焦点移到标题复选框；展开、移出或断开组件连接时恢复内容原有的 `inert` 状态。

minimal 模式隐藏原生 fieldset，因此不能通过 legend 拖动视图。需要保留拖拽入口时使用 collapsed。

## ext-engineer 集成

已参考 [SCFieldset](https://github.com/171h/ext-engineer/blob/main/src/browser/components/safety-calculation/SCFieldset.vue)、[SCEnabledLabel](https://github.com/171h/ext-engineer/blob/main/src/browser/components/safety-calculation/SCEnabledLabel.vue) 和 [布局令牌](https://github.com/171h/ext-engineer/blob/main/src/browser/config/ui/shared/layout.ts)。业务参数、单位格式化和 Vue 状态继续由应用管理，组件负责分区布局、启用状态及折叠。

| SCFieldset 约定               | vscode-fieldset 对应方式                                          |
| ----------------------------- | ----------------------------------------------------------------- |
| `enabled`                     | 启用 `checkbox`，绑定 `checked`。                                 |
| `enabledLabel`                | `checkbox-label`；保持与分区标题独立。                            |
| `disabled`                    | 绑定组件 `disabled`，同时禁用组内容和启用框。                     |
| `uncheckedContent="disable"`  | `unchecked-mode="visible"`。                                      |
| `uncheckedContent="collapse"` | `unchecked-mode="collapsed"`。                                    |
| `uncheckedContent="hide"`     | `unchecked-mode="minimal"`。                                      |
| `update:enabled`              | 监听 `vsc-fieldset-checked-change`，读取 `event.detail.checked`。 |
| `label`、`unit`               | 在原生 `legend` 中渲染应用已格式化的标题。                        |
| `variant`、布局密度           | 保留应用的 fieldset、legend 和内容布局类；`size` 控制库控件尺寸。 |
| `more`、`expanded`            | 在默认内容内保留现有“更多参数”区域和展开按钮，由 Vue 控制。       |

外层分区未勾选时保留参数 DOM 和取值；默认行为不会将勾选状态写入业务对象，应用应在事件中更新模型。启用框在独立的 shadow DOM 中，不会混入原生 fieldset 的 legend 名称。保留现有组件标签及事件接口，无需将业务专用单位、校验或国际化逻辑移入组件库。

`ext-engineer` 的参数页使用编辑区背景，可按上例覆盖背景变量，并沿用其 12px 标题与布局令牌：

```css
.parameter-area vscode-fieldset > fieldset {
  margin: 0;
  padding: var(--sc-form-fieldset-padding-block)
    var(--sc-form-fieldset-padding-inline);
}

.parameter-area vscode-fieldset > fieldset > legend {
  font-size: 12px;
  line-height: 17px;
  padding: 0 var(--sc-form-legend-padding-inline);
}
```

接入时将 `SCFieldset` 的原生 fieldset 放入 `vscode-fieldset`，移除应用重复渲染的启用框及其绝对定位、禁用与关闭动画逻辑，避免同一分区由两套逻辑控制。当前核验基于本机 `ext-engineer` 的 `bbe72966` 提交；本次没有修改该仓库或替换其 npm 依赖，实际 Vue 替换后的 Webview 联调仍须在该项目中进行。

## 交互示例

<ExamplePreview example="fieldset" />

通过预览工具栏切换主题和尺寸。更多属性见 [Fieldset API](./api/generated/fieldset)。
