# 文本框百分比模式

`vscode-textfield` 的 `percentage` 属性将组件转换为百分比输入框。可编辑文字始终为百分数，百分号显示在输入框内，而组件向外部提供对应的小数值：

| 输入文字 | 显示文字 | `value` |
| -------- | -------- | ------- |
| `1`      | `1%`     | `0.01`  |
| `12.5`   | `12.5%`  | `0.125` |
| `-3`     | `-3%`    | `-0.03` |

## 启用模式

添加 `percentage` 特性，或设置同名属性：

```html
<vscode-label for="opacity">不透明度</vscode-label>
<vscode-textfield id="opacity" percentage value="0.5"></vscode-textfield>
```

```js
const field = document.querySelector('#opacity');

field.percentage = true;
```

此示例显示 `50%`，因为 `value` 使用小数形式。属性会反射到 HTML 特性，二者可互换使用，也可在运行时切换模式。切换时会转换当前值：值为 `0.25` 的文本框启用后显示 `25%`，禁用后再次显示 `0.25`。启用时，无法表示为百分数的值（例如 `abc`）会被清除。

## 程序读写使用小数值

程序读写均使用小数形式：

| 读写位置                                     | 单位   | `1%` 对应的示例 |
| -------------------------------------------- | ------ | --------------- |
| 输入框显示文字                               | 百分数 | `1%`            |
| `value` 属性与特性                           | 小数   | `0.01`          |
| 表单提交值与 `FormData`                      | 小数   | `0.01`          |
| `defaultValue` 与 `formStateRestoreCallback` | 小数   | `0.01`          |
| `min`、`max`、`step`                         | 小数   | `0.01`          |

```js
field.value = '0.01'; // 输入框显示 "1%"
field.value; // "0.01"
```

```html
<form>
  <vscode-textfield percentage name="opacity" value="0.5"></vscode-textfield>
</form>
```

```js
new FormData(document.querySelector('form')).get('opacity'); // "0.5"
```

空文本框不显示百分号，`value` 与表单提交值均为空字符串。`required` 校验仍正常报告空值。

## 编辑行为

- 数字包含至少一位数字时添加百分号。百分号不是被编辑数字的一部分：按退格键删除末尾数字并保留百分号。
- 输入时仅接受数字、一个小数分隔符和前导负号，忽略其他字符。逗号转换为句点，因此 `1,5` 显示为 `1.5%`。
- 失去焦点、结束编辑时规范化文字：`05` 变为 `5%`，`1.` 变为 `1%`，单独的 `-` 清空文本框。
- 正常派发 `input` 与 `change` 事件。处理事件时，`value` 已是小数形式；表单提交值在输入过程中同步更新。
- 内部 input 使用文本框，因为原生数字输入框不接受百分号。此模式下 `type` 属性不生效，方向键不改变数值。

## 校验

`required`、`pattern`、`minlength` 和 `maxlength` 对包含百分号的显示文字进行校验，与原生文本框一致：

```html
<vscode-textfield percentage required pattern="^\d+%$"></vscode-textfield>
```

`min`、`max` 和 `step` 对小数值进行校验，与 `value` 使用相同单位：

```html
<vscode-textfield
  percentage
  min="0"
  max="1"
  step="0.05"
  value="0.5"
></vscode-textfield>
```

此示例接受 0% 至 100%，步长为 5%。校验提示与原生提示一致，例如提示数值必须小于或等于 1：

```js
field.checkValidity(); // 显示 "150%" 时返回 false
field.validity.rangeOverflow; // true
```

## 交互示例

以下示例提供显示文字与程序值对照，以及带 `min`/`max`/`step` 校验并提交小数值的表单：

<ExamplePreview example="percentage" />

更多属性见 [Textfield API](./api/generated/textfield)。
