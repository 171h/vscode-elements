# 多选框选中标签

`vscode-multi-select` 的展示区域按选择顺序显示选中项标签，替代单一的选中数量计数。

本文说明选项文字的显示规则、`vscode-option` 的 `abbreviation` 缩写属性，以及标签无法完全放入展示区域时的行为。

## 显示优先级

一个选项最多提供三种文字，展示区域按以下优先级使用首个可用值：

| 优先级 | 来源                                                                 | 示例     | 展示区域 | 选项列表 | 工具提示 |
| ------ | -------------------------------------------------------------------- | -------- | -------- | -------- | -------- |
| 1      | `vscode-option` 的 `abbreviation` 特性或属性                         | `DB`     | 是       | 否       | 否       |
| 2      | 标签：`vscode-option` 的文本内容，或 `options` 属性中的 `label` 字段 | `数据库` | 是       | 是       | 是       |
| 3      | `value` 特性或属性                                                   | `db`     | 是       | 否       | 是       |

缩写仅用于 `vscode-multi-select` 的展示区域。下拉选项列表、选中标签的工具提示和 `vscode-single-select` 的展示区域均显示完整标签。

## 设置选项缩写

为 `vscode-option` 添加 `abbreviation` 特性：

```html
<vscode-multi-select>
  <vscode-option abbreviation="DB">数据库</vscode-option>
  <vscode-option abbreviation="SRV">服务器</vscode-option>
  <vscode-option>缓存</vscode-option>
</vscode-multi-select>
```

选中数据库与服务器时，展示区域显示 `DB` 和 `SRV`。没有缩写的选项（如缓存）显示标签本身。

通过 `options` 属性设置选项时，也可使用同一字段，适合基于数据渲染组件的框架：

```js
const select = document.querySelector('vscode-multi-select');

select.options = [
  {label: '数据库', value: 'db', abbreviation: 'DB', selected: true},
  {label: '服务器', value: 'srv', abbreviation: 'SRV', selected: true},
];
```

可在运行时修改该属性；选项报告新状态后，展示区域立即更新：

```js
const option = document.querySelector('vscode-option');

option.abbreviation = 'DB'; // 展示区域显示 "DB"，替代“数据库”
option.abbreviation = ''; // 展示区域恢复为标签
```

设置空字符串或移除特性即可恢复完整标签，缩写始终是可选的。

## 标签折叠与工具提示

标签排列在展示区域内的单行中。无法容纳全部选中标签时：

1. 尽可能显示完整标签。
2. 剩余标签折叠为 `+N` 徽章，`N` 为折叠数量。
3. 鼠标悬停于该行时，工具提示提供完整的选中项列表。

```html
<vscode-multi-select style="width: 160px">
  <vscode-option selected>苹果</vscode-option>
  <vscode-option selected>香蕉</vscode-option>
  <vscode-option selected>樱桃</vscode-option>
  <vscode-option selected>草莓</vscode-option>
</vscode-multi-select>
```

若只能容纳前两个标签，展示区域显示“苹果”“香蕉”和 `+2`；悬停时显示：

```text
苹果
香蕉
樱桃
草莓
```

选中项总数始终可由可见标签数加 `N` 得出。仅当工具提示包含展示区域未显示的信息时，才添加工具提示：

- 至少一个标签折叠为 `+N` 徽章。
- 至少一个标签过长，使用省略号截断。
- 至少一个标签使用缩写，需要提供完整标签。

单个标签超过可用宽度时，会截断而非完全折叠，使单个较长选中项仍然可见。

## 行为说明

- 组件尺寸变化时重新计算布局，展示区域变宽后，折叠标签可重新显示。
- 搜索不使用缩写，组合框模式按完整标签过滤选项。
- 标签跟随选择顺序；在标记中设置 `selected` 的选项按元素顺序显示。
- 展示区域高度不受选中项数量影响，`small`、`medium` 和 `large` 的高度保持原有行为。

## 交互示例

在以下示例中选择选项，检查完整文字、缩写和当前业务值。改变浏览器宽度可检查标签折叠：

<ExamplePreview example="multi-select" />

更多属性见 [MultiSelect API](./api/generated/multi-select)。
