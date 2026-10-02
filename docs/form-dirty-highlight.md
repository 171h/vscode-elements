# 表单已修改状态

<ExamplePreview example="form" />

`vscode-form-container` 在表单控件上显示浅蓝色背景，标识表单已修改。即使被修改的控件位于视口之外，高亮也能提示变化，并在超时后自动消失。

容器自身的背景不变。

## 标记表单已修改

容器自动监听插槽中表单控件的 `input` 和 `change` 事件。因此在 `vscode-textfield` 中输入、切换 `vscode-checkbox` 或选择选项，均会标记整个表单。

只有下表列出的控件参与状态。原生 `input`、`select` 或 `textarea` 不会标记表单，因为容器无法在原生控件上显示该状态。控件归属最近的容器，因此嵌套表单中的控件被修改时，不会标记外层表单。

仅用户交互会自动标记表单。通过代码设置 `value` 属性或 HTML 特性不会改变状态。

```html
<vscode-form-container>
  <vscode-form-group variant="vertical">
    <vscode-label for="name">名称</vscode-label>
    <vscode-textfield id="name"></vscode-textfield>
    <vscode-checkbox label="启用"></vscode-checkbox>
  </vscode-form-group>
</vscode-form-container>
```

容器及表单内各控件均可读取状态。控件将状态反射为 `dirty` 特性，作为高亮样式的选择依据：

```js
const form = document.querySelector('vscode-form-container');
const textfield = form.querySelector('vscode-textfield');

form.dirty; // false
textfield.dirty; // false

textfield.dirty; // 用户输入后为 true
form.dirty; // true，文本框所属表单也被标记
```

## 参与状态的表单控件

各控件在自身表面显示浅蓝色背景：

| 控件                   | 高亮区域                                   |
| ---------------------- | ------------------------------------------ |
| `vscode-textfield`     | 输入框                                     |
| `vscode-textarea`      | 多行文本框                                 |
| `vscode-single-select` | 下拉框展示区域，选择模式和组合框模式均适用 |
| `vscode-multi-select`  | 下拉框展示区域，选择模式和组合框模式均适用 |
| `vscode-checkbox`      | 复选框方框及外环                           |
| `vscode-radio`         | 单选按钮方框及外环                         |

下拉框无论显示选中项、多选标签还是空选中占位文字，展示区域都会高亮，选项列表展开时也保持高亮。组合框中输入过滤文字不会标记表单，选择选项才会标记。

高亮期间动态添加的控件同样参与状态，因此动态构建的表单可在新增字段上显示高亮。

小型控件在小方框上绘制背景，并通过外环增强可见性。不属于表单容器的控件（例如独立的 `vscode-textfield`）不会被标记。

显示错误的控件保留错误颜色，不在无效控件上绘制高亮，以免覆盖错误提示。控件重新有效后恢复显示已修改状态。

## 高亮持续时间

高亮默认持续 **5 秒**。`mark-duration` 特性与 `markDuration` 属性接受以下值：

| 值                  | 含义                                                        |
| ------------------- | ----------------------------------------------------------- |
| `5000`              | 数字或不带单位的字符串按毫秒解析                            |
| `'2.5s'`、`'500ms'` | 带 CSS 时间单位的字符串                                     |
| `'forever'`         | 仅在修改另一个表单或调用 `reset()` 时移除高亮               |
| 空值                | 不带值的 `mark-duration` 特性或移除特性，均恢复默认持续时间 |

所有表单控件遵循相同规则；下拉框无论在选择模式还是组合框模式选中选项，行为均与文本框一致。

```html
<!-- 2 秒 -->
<vscode-form-container mark-duration="2000"></vscode-form-container>

<!-- 1.5 秒 -->
<vscode-form-container mark-duration="1.5s"></vscode-form-container>

<!-- 持续高亮 -->
<vscode-form-container mark-duration="forever"></vscode-form-container>

<!-- 默认持续时间，与移除特性相同 -->
<vscode-form-container mark-duration></vscode-form-container>
```

```js
const form = document.querySelector('vscode-form-container');

form.markDuration = 3000;
```

未设置 `mark-duration` 的容器使用 `VscodeFormContainer.defaultMarkDuration` 作为回退值。该值在容器创建时读取，因此修改它仅影响之后创建的容器。

无法解析的值（例如 `'slow'`）会保持高亮直到重置。负数按零处理，立即移除高亮。

每次修改会重启倒计时，但 500ms 内连续修改共用一次重启：同一按键产生的多个事件，以及每秒输入超过两个字符的连续按键，不会每次都重启。高亮在最后一次修改后的 `markDuration` 内消失，用户持续修改时保持可见。

持续时间短于 500ms 时，忽略间隔也会缩短，确保倒计时在过期前重启，避免状态闪烁。此间隔仅适用于自动标记，直接调用 `mark()` 总会重启倒计时。

`'forever'` 的淡出时间远超通常的页面访问时长，因此状态显示期间控件保持动画峰值颜色。

## 同一根节点只高亮一个表单

页面可包含多个表单，但同一根节点中一次仅高亮一个。标记某个表单时，该根节点中的其他表单立即恢复正常状态，使用户知道最近修改的是哪个表单。不同 Shadow Root 中的表单互不影响。

可查询页面各表单的状态：

```js
const states = VscodeFormContainer.getFormStates();

// [
//   {element, id: 'profile', name: 'profile', dirty: false, markDuration: 5000},
//   {element, id: 'account', name: 'account', dirty: true, markDuration: '2s'},
// ]
```

`VscodeFormContainer.getFormStates(root)` 接受可选的 `Document`、`ShadowRoot` 或 `Element`，结果包含嵌套容器；根节点本身为表单容器时也包含在结果中。传入 `Document` 返回该文档内的表单，传入 Shadow Root 则返回其内部表单。

查询遍历整棵树并深入 Shadow Root，开销较大，不应在频繁执行的路径上调用。

包含已修改下拉框的表单与包含已修改文本框的表单以相同方式报告状态。展示页中的按钮使用该查询查找表单：

```js
// 第二个表单的下拉框被选择，因此第一个表单恢复正常。
VscodeFormContainer.getFormStates().map((state) => [state.id, state.dirty]);
// [['profile', false], ['account', true]]
```

## 手动控制

```js
const form = document.querySelector('vscode-form-container');

// 标记表单并启动倒计时。
form.mark();

// 立即恢复正常状态。
form.reset();
```

表单状态变化时，`vscode-form-container` 派发 `vsc-dirty-change` 事件。事件不冒泡，`detail` 包含 `form` 和新的 `dirty` 值：

```js
form.addEventListener('vsc-dirty-change', (ev) => {
  console.log(ev.detail.form, ev.detail.dirty);
});
```

事件报告状态变化，因此 `mark()` 仅在表单尚未修改时派发；重启已高亮表单的倒计时不会重复派发。已修改表单从 DOM 移除时，状态变为 `false`，同样报告此变化。

可通过 `markable` 特性关闭自动标记，`mark()` 和 `reset()` 仍可使用：

```html
<vscode-form-container markable="false"></vscode-form-container>
```

该状态不写回 DOM，因此 `vscode-form-container[markable]` 仅匹配显式带有此特性的容器。

## 样式

控件背景在整个状态持续时间内，从峰值颜色渐变至静止颜色；状态移除时，再恢复原始背景。用户设置减少动态效果时禁用动画。

背景色仅应用于已修改状态，未修改过的表单保留控件原有背景。

### 主题颜色

状态使用浅蓝色背景，调色板随 VS Code 主题类型变化。浅色主题静止颜色为 `#eff3ff`；深色和高对比度主题使用相同色相，明度匹配各自表面，使状态可见且不刺眼。

| 主题类型                     | 静止颜色  | 峰值颜色  | 边框颜色  | 外环颜色                   |
| ---------------------------- | --------- | --------- | --------- | -------------------------- |
| `vscode-light`（默认）       | `#eff3ff` | `#dbe4ff` | `#93a9f0` | `#6784de`                  |
| `vscode-dark`                | `#243a5e` | `#2f4c7a` | `#4a6ea8` | `rgba(74, 110, 168, 0.55)` |
| `vscode-high-contrast`       | `#243a5e` | `#3a5c8f` | `#7aa2e3` | `#7aa2e3`                  |
| `vscode-high-contrast-light` | `#dbe4ff` | `#b9c9ff` | `#0a3d91` | `#0a3d91`                  |

边框与外环颜色用于复选框和单选按钮。铺满整个表面的控件（例如文本框）只改变背景，使焦点边框保留焦点颜色。

VS Code 在 `body` 上通过 `data-vscode-theme-kind` 特性提供主题类型，值为 `vscode-light`、`vscode-dark`、`vscode-high-contrast` 或 `vscode-high-contrast-light`，并提供 `vscode-light`、`vscode-dark` 和 `vscode-high-contrast` 类。样式使用 `:host-context` 匹配，使颜色跟随页面主题，并在主题切换时重新计算。

`:host-context()` 是已弃用且仅 Chromium 支持的选择器，参见 [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:host-context) 和 [Web 特性浏览器](https://web-platform-dx.github.io/web-features-explorer/features/host-context/)。本组件库面向 VS Code Webview 与 Electron 使用的 Chromium，可使用该调色板。其他浏览器忽略调色板样式，回退到浅色配色。

未提供主题类型的页面，可在 `body` 上添加对应类型的类来启用调色板：

```html
<body class="vscode-dark"></body>
```

### 自定义属性

表单容器将颜色传递给控件。也可在单个控件上设置并覆盖容器值，或在容器祖先、`body` 上设置：

| 属性                                       | 用途                             |
| ------------------------------------------ | -------------------------------- |
| `--vsc-form-control-dirty-background`      | 已修改控件的静止背景色           |
| `--vsc-form-control-dirty-background-peak` | 动画开始时的背景色               |
| `--vsc-form-control-dirty-border-color`    | 已修改复选框和单选按钮的边框颜色 |
| `--vsc-form-control-dirty-ring-color`      | 已修改复选框和单选按钮的外环颜色 |
| `--vsc-form-control-dirty-duration`        | 已修改控件的动画时长             |

持续时间例外：容器将 `markDuration` 的值写入自身，因此在容器祖先或 `body` 上设置的值不会传递到控件。通过 `markDuration` 或 `mark-duration` 设置状态时长；仅需调整单个控件的动画时长时，在该控件上设置自定义属性。

主题颜色来自内部的 `--vsc-form-control-dirty-palette-*` 变量，它们仅作为上述公共属性的回退值。使用不同名称是为了避免控件层级的声明遮蔽继承值，从而保留页面级覆盖颜色的能力。

```css
/* 整个页面 */
body {
  --vsc-form-control-dirty-background: #e8f0ff;
}

/* 单个控件 */
vscode-textfield {
  --vsc-form-control-dirty-background: #f0e8ff;
}
```
