# 表单控件尺寸

表单控件支持统一的 `size` 特性，用于选择紧凑、默认或宽松的显示尺寸：

| 值       | 用途                                                     |
| -------- | -------------------------------------------------------- |
| `small`  | 紧凑布局；适用的控件缩小到可容纳于 16px 高表单行的尺寸。 |
| `medium` | 默认尺寸，省略 `size` 时效果相同。                       |
| `large`  | 更大的文字、图标、间距和控件。                           |

共享 TypeScript 类型为 `FormControlSize`，定义为 `'small' | 'medium' | 'large'`。

## 支持的组件

以下组件支持统一的表单控件尺寸：

- `vscode-button`
- `vscode-textfield`
- `vscode-textarea`
- `vscode-checkbox`
- `vscode-radio`
- `vscode-single-select`
- `vscode-multi-select`
- `vscode-form-group`
- `vscode-label`

为保持向后兼容，默认值仍为 `medium`。

`vscode-radio-group` 和 `vscode-checkbox-group` 是容器，自身没有 `size` 特性。其高度跟随子控件，因此应在子控件上设置尺寸：

```html
<vscode-radio-group>
  <vscode-radio size="small">选项一</vscode-radio>
  <vscode-radio size="small">选项二</vscode-radio>
</vscode-radio-group>
```

## 在标记中设置尺寸

可分别设置各控件的 `size`：

```html
<vscode-textfield size="small">紧凑文本框</vscode-textfield>
<vscode-single-select size="medium"></vscode-single-select>
<vscode-button size="large">大型操作按钮</vscode-button>
```

同一表单内可使用不同尺寸。若需要一致布局，相关控件应使用相同值：

```html
<vscode-textfield size="small"></vscode-textfield>
<vscode-checkbox size="small">记住我</vscode-checkbox>
<vscode-button size="small">保存</vscode-button>
```

## 运行时切换尺寸

`size` 属性与 HTML 特性相互反射，可在运行时修改任意一种：

```js
const field = document.querySelector('vscode-textfield');

field.size = 'large';
field.setAttribute('size', 'small');
```

各组件页的预览提供 **small**、**medium**、**large** 尺寸切换，可交互检查支持的组件。启动文档站点后打开 [按钮](./components/button) 或 [文本框](./components/textfield)：

```bash
npm run docs:dev
```

## 表单组

`vscode-form-group` 通过 `size` 调整组间距、标签宽度和继承的 `--vsc-form-control-font-size` 自定义属性。控件整体尺寸需要与表单组一致时，也应在控件上设置相同的 `size`：

```html
<vscode-form-group size="small" variant="vertical">
  <vscode-label for="query">查询</vscode-label>
  <vscode-textfield id="query" size="small"></vscode-textfield>
  <vscode-button size="small">搜索</vscode-button>
</vscode-form-group>
```

设置尺寸的表单组内，`vscode-label` 自动缩放，无需单独指定 `size`。在表单组外使用时，也可自行设置该属性。

自动字号分别为：`small` 使用 11px，`medium` 使用配置的 VS Code 字号（默认 13px），`large` 使用 15px。可通过 `--vsc-form-control-font-size` 覆盖表单组或单个控件的字号。

小型文本框在 `content-before` 或 `content-after` 插槽中放入 `vscode-icon` 时，仍保持 16px 高度。插槽图标适应可用内容高度：普通图标为 14px，操作图标使用 12px 字形，并保留焦点边框。

## 带图标的按钮

`vscode-button` 创建的图标自动跟随按钮尺寸：

| 按钮尺寸 | 自动生成的图标尺寸 |
| -------- | ------------------ |
| `small`  | 14px               |
| `medium` | 16px               |
| `large`  | 20px               |

小型纯图标按钮为 16px 正方形，前置和后置图标均适用：

```html
<vscode-button size="small" icon="account" aria-label="账户"></vscode-button>
<vscode-button size="small" icon-after="add" aria-label="添加"></vscode-button>
```

## 独立图标

`vscode-icon` 同样支持 `size` 属性，接受 `small`（14px）、`medium`（16px，默认）、`large`（20px）或像素数：

```html
<vscode-icon name="account" size="small"></vscode-icon>
<vscode-icon name="account" size="24"></vscode-icon>
```

```js
const icon = document.querySelector('vscode-icon');
icon.size = 24;
```

通过 `vscode-button` 的 `icon` 或 `icon-after` 属性生成图标时，应设置按钮的 `size`，由按钮提供对应的图标像素尺寸。
