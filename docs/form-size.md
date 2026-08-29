# Form control sizes

Form controls support a common `size` attribute for choosing a compact,
default, or spacious presentation. The accepted values are:

| Value | Purpose |
| --- | --- |
| `small` | Compact layouts. Controls are reduced to fit a 16px-high form row where applicable. |
| `medium` | Default size. Omitting `size` has the same effect. |
| `large` | Larger text, icons, spacing, and controls. |

The shared TypeScript type is `FormControlSize`, defined as
`'small' | 'medium' | 'large'`.

## Supported components

The common form-control sizes are available on:

- `vscode-button`
- `vscode-textfield`
- `vscode-textarea`
- `vscode-checkbox`
- `vscode-radio`
- `vscode-single-select`
- `vscode-multi-select`
- `vscode-form-group`

`medium` remains the default for backward compatibility.

## Set a size in markup

Set `size` independently on each control:

```html
<vscode-textfield size="small">Compact field</vscode-textfield>
<vscode-single-select size="medium"></vscode-single-select>
<vscode-button size="large">Large action</vscode-button>
```

Controls can use different sizes in the same form. For a consistent layout,
give related controls the same value:

```html
<vscode-textfield size="small"></vscode-textfield>
<vscode-checkbox size="small">Remember me</vscode-checkbox>
<vscode-button size="small">Save</vscode-button>
```

## Change a size at runtime

The `size` property and attribute are reflected, so either can be changed at
runtime:

```js
const field = document.querySelector('vscode-textfield');

field.size = 'large';
field.setAttribute('size', 'small');
```

The existing pages under `dev/` include **small**, **medium**, and **large**
buttons for interactively checking the supported components. Start the local
development server and open the relevant component example:

```bash
npm run serve
```

## Form groups

`vscode-form-group` uses its `size` to adjust group spacing, label width, and
the inherited `--vsc-form-control-font-size` custom property. Set the same
`size` on the controls when their complete dimensions should match the group:

```html
<vscode-form-group size="small" variant="vertical">
  <vscode-label for="query">Query</vscode-label>
  <vscode-textfield id="query" size="small"></vscode-textfield>
  <vscode-button size="small">Search</vscode-button>
</vscode-form-group>
```

The automatic font sizes are 11px for `small`, the configured VS Code font
size (13px by default) for `medium`, and 15px for `large`. You can override the
font size for a form group or an individual control with
`--vsc-form-control-font-size`.

## Buttons with icons

Icons created by `vscode-button` follow the button size automatically:

| Button size | Generated icon size |
| --- | --- |
| `small` | 12px |
| `medium` | 16px |
| `large` | 20px |

Small icon-only buttons are 16px square. This applies to both leading and
trailing generated icons:

```html
<vscode-button size="small" icon="account" aria-label="Account"></vscode-button>
<vscode-button size="small" icon-after="add" aria-label="Add"></vscode-button>
```

## Standalone icons

`vscode-icon` also has a `size` property. It accepts the presets `small`
(14px), `medium` (16px, the default), and `large` (20px), or a numeric pixel
value:

```html
<vscode-icon name="account" size="small"></vscode-icon>
<vscode-icon name="account" size="24"></vscode-icon>
```

```js
const icon = document.querySelector('vscode-icon');
icon.size = 24;
```

When an icon is generated through the `icon` or `icon-after` property of a
`vscode-button`, set the button's `size`; the button supplies the corresponding
numeric icon size.
