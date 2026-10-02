# Fieldset checkbox

`vscode-fieldset` can show a checkbox on the top-right corner of the border.
The checkbox is vertically aligned with the legend and, by default, enables or
disables the fieldset content.

```html
<vscode-fieldset checkbox checkbox-label="Wind load" unchecked-mode="collapsed">
  <fieldset>
    <legend>Wind load</legend>
    <label>Basic wind pressure <input /></label>
  </fieldset>
</vscode-fieldset>
```

The component expects a native `fieldset` with a `legend` in its default slot.
The checkbox is rendered inside the component, so the light DOM keeps its
native form semantics.

## Attributes and properties

| Attribute        | Property        | Type                                    | Default     | Description                                          |
| ---------------- | --------------- | --------------------------------------- | ----------- | ---------------------------------------------------- |
| `checkbox`       | `checkbox`      | boolean                                 | `false`     | Shows the checkbox on the border.                    |
| `checkbox-label` | `checkboxLabel` | string                                  | `''`        | Label text of the checkbox.                          |
| `checked`        | `checked`       | boolean                                 | `false`     | Checked state. The content is enabled while checked. |
| `unchecked-mode` | `uncheckedMode` | `'visible' \| 'collapsed' \| 'minimal'` | `'visible'` | Presentation of the content while unchecked.         |

All attributes are reflected, so `vscode-fieldset[checked]` can be used in CSS.

## Unchecked modes

| Mode        | Unchecked presentation                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `visible`   | The content is disabled but stays visible.                                                       |
| `collapsed` | The content is disabled and hidden. The legend, the border and the checkbox stay visible.        |
| `minimal`   | The content, the legend and the border are hidden. Only the checkbox and its label stay visible. |

Without the `checkbox` attribute the component does not render a checkbox and
does not change the `disabled` state of the native fieldset.

## Custom behavior

Toggling the checkbox dispatches a cancelable
`vsc-fieldset-checked-change` event with a `{checked}` detail. Calling
`preventDefault()` skips the default behavior, so the content can be enabled,
disabled or hidden in an application-specific way.

```js
const fieldset = document.querySelector('vscode-fieldset');

fieldset.addEventListener('vsc-fieldset-checked-change', (event) => {
  if (!event.detail.checked && hasUnsavedChanges()) {
    event.preventDefault();
    showWarning();
  }
});
```

The same hook is available as a callback property. Returning `false` has the
same effect as `preventDefault()`:

```js
fieldset.checkedChange = (checked) => {
  console.log('checkbox is now', checked);
};
```

Changing the `checked` property programmatically applies the same default
behavior. The native element can be reached through the `fieldsetElement`
getter for custom handling.

## Animation

When a mode change affects the height of the component, the height is animated
with a 180 ms transition. Users with `prefers-reduced-motion: reduce` get the
final state immediately.

A `min-height` set by the application on the native fieldset limits how far the
component can collapse.

## Form behavior

While the checkbox is unchecked the native fieldset is `disabled`, so its form
controls are disabled and are not submitted. If the native fieldset is authored
with the `disabled` attribute, it stays disabled and the checkbox itself is
disabled too.

In `minimal` mode the native fieldset is hidden while unchecked, so the view
cannot be dragged by its legend. Use `collapsed` when the view must stay
draggable.

Interactive demo: `dev/vscode-fieldset/checkbox.html` (run `npm run serve`).
