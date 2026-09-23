# Multi-select face labels

The face of `vscode-multi-select` displays the labels of the selected options
instead of a single `N Selected` counter. The labels are shown in the order in
which the options were selected.

This document describes which text is displayed for an option, how the
`abbreviation` attribute of `vscode-option` shortens it, and how the component
behaves when the labels do not fit into the face.

## Display priority

An option can provide up to three texts. The face uses the first one which is
available:

| Priority | Source | Example | Face | Option list | Tooltip |
| --- | --- | --- | --- | --- | --- |
| 1 | `abbreviation` attribute or property of `vscode-option` | `DB` | yes | no | no |
| 2 | Label: the text content of `vscode-option`, or the `label` field of the `options` property | `Database` | yes | yes | yes |
| 3 | `value` attribute or property | `db` | yes | no | yes |

The abbreviation is only used in the face of `vscode-multi-select`. Everywhere
else - the option list of the dropdown, the tooltip of the selected labels, and
the face of `vscode-single-select` - the complete label is displayed.

## Abbreviate an option

Add the `abbreviation` attribute to a `vscode-option` element:

```html
<vscode-multi-select>
  <vscode-option abbreviation="DB">Database</vscode-option>
  <vscode-option abbreviation="SRV">Server</vscode-option>
  <vscode-option>Cache</vscode-option>
</vscode-multi-select>
```

With `Database` and `Server` selected, the face displays `DB` and `SRV`. An
option without an abbreviation, such as `Cache`, is displayed with its label.

The same field is available when the options are set with the `options`
property, which is useful for frameworks that render the component from data:

```js
const select = document.querySelector('vscode-multi-select');

select.options = [
  {label: 'Database', value: 'db', abbreviation: 'DB', selected: true},
  {label: 'Server', value: 'srv', abbreviation: 'SRV', selected: true},
];
```

The property can also be changed at runtime. The face updates as soon as the
option reports its new state:

```js
const option = document.querySelector('vscode-option');

option.abbreviation = 'DB'; // the face displays "DB" instead of "Database"
option.abbreviation = ''; // the face falls back to the label
```

Removing the abbreviation - by setting it to an empty string or by removing the
attribute - restores the label, so the abbreviation is always optional.

## Collapsed labels and tooltip

The labels are placed in a single row which is kept inside the face. When the
selected labels do not fit:

1. as many complete labels are displayed as fit into the row,
2. the remaining labels are collapsed and summarized by a `+N` badge, where `N`
   is the number of the collapsed labels,
3. the complete list of the selected options is available as a tooltip when the
   mouse hovers over the row.

```html
<vscode-multi-select style="width: 160px">
  <vscode-option selected>Apple</vscode-option>
  <vscode-option selected>Banana</vscode-option>
  <vscode-option selected>Cherry</vscode-option>
  <vscode-option selected>Strawberry</vscode-option>
</vscode-multi-select>
```

The face displays `Apple` `Banana` `+2`, and hovering it shows:

```
Apple
Banana
Cherry
Strawberry
```

The number of the selected options is always readable: it is the number of the
displayed labels plus `N`. The tooltip is only added when it contains
information which the face does not show:

- at least one label is collapsed into the `+N` badge,
- a displayed label is truncated with an ellipsis because it is longer than the
  face,
- at least one displayed label is an abbreviation, so the tooltip reveals the
  complete labels.

A label which is too long for the available space is displayed truncated rather
than being collapsed, so a single long selection is still visible.

## Behaviour notes

- The fitting is recalculated when the component is resized, so the collapsed
  labels reappear when the face becomes wider.
- The abbreviation is not used for searching. The combobox mode filters the
  options by their complete labels.
- The labels follow the order of the selection. Options which are marked as
  `selected` in the markup are listed in the order of the option elements.
- The height of the face does not depend on the number of the selected options,
  and it is the same for the `small`, `medium`, and `large` sizes as before.

## Live example

The `dev/vscode-multi-select/selected-labels.html` page contains the empty,
partially selected, collapsed, truncated, and abbreviated cases in both the
select and the combobox mode. Start the development server and open the page:

```bash
npm run start
# http://localhost:8000/dev/vscode-multi-select/selected-labels.html
```
