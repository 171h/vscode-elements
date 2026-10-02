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

## 属性

| HTML 属性        | JavaScript 属性 | 类型                                    | 默认值      | 说明                       |
| ---------------- | --------------- | --------------------------------------- | ----------- | -------------------------- |
| `checkbox`       | `checkbox`      | boolean                                 | `false`     | 在边框上显示复选框。       |
| `checkbox-label` | `checkboxLabel` | string                                  | `''`        | 复选框标签。               |
| `checked`        | `checked`       | boolean                                 | `false`     | 勾选状态；勾选时启用内容。 |
| `unchecked-mode` | `uncheckedMode` | `'visible' \| 'collapsed' \| 'minimal'` | `'visible'` | 未勾选时的展示方式。       |

`checkbox`、`checked` 和 `unchecked-mode` 会反映到 HTML 属性，可用 `vscode-fieldset[checked]` 选择器设置样式。`checkboxLabel` 不会自动反映到 HTML 属性。

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

minimal 模式隐藏原生 fieldset，因此不能通过 legend 拖动视图。需要保留拖拽入口时使用 collapsed。

交互示例：[复选框测试页面](checkbox.html)，运行 `pnpm start` 后访问。
