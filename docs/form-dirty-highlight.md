# Modified state of a form

`vscode-form-container` shows the modified state of a form with a light green
background on its form controls. The highlight makes the change visible even
when the modified control is outside of the viewport, and it disappears
automatically after a timeout.

The background of the container itself is not changed.

## Mark a form as modified

The state is detected automatically: the container listens to the `input` and
`change` events of the slotted form controls, so typing into a
`vscode-textfield`, toggling a `vscode-checkbox`, or selecting an option marks
the whole form.

Only a user interaction marks a form. Setting the `value` property or the
`value` attribute from code does not change the state.

```html
<vscode-form-container>
  <vscode-form-group variant="vertical">
    <vscode-label for="name">Name</vscode-label>
    <vscode-textfield id="name"></vscode-textfield>
    <vscode-checkbox label="Enabled"></vscode-checkbox>
  </vscode-form-group>
</vscode-form-container>
```

The state is available on the container and on every form control of the form.
It is reflected as the `dirty` attribute, which is also the hook of the
highlight styles:

```js
const form = document.querySelector('vscode-form-container');
const textfield = form.querySelector('vscode-textfield');

form.dirty; // false
textfield.dirty; // false

textfield.dirty; // true after the user types into the field
form.dirty; // true, the form of the field is marked as well
```

## The modified form controls

Every control which takes part in the state shows the light green background on
its own surface:

| Control | The highlighted surface |
| --- | --- |
| `vscode-textfield` | The box of the input |
| `vscode-textarea` | The box of the textarea |
| `vscode-single-select` | The face of the dropdown |
| `vscode-multi-select` | The face of the dropdown |
| `vscode-checkbox` | The box of the checkbox, with a ring |
| `vscode-radio` | The box of the radio button, with a ring |

The small controls draw the background on a small box, so a ring makes the
state visible around the box as well. The controls which are not part of a
form container, e.g. a standalone `vscode-textfield`, are never marked.

## Duration of the highlight

The highlight lasts **5 seconds** by default. The `mark-duration` attribute
and the `markDuration` property accept:

| Value | Meaning |
| --- | --- |
| `5000` | A number or a unitless string is interpreted as milliseconds |
| `'2.5s'`, `'500ms'` | A string with a CSS time unit |
| `'forever'` | The highlight is removed only by another modified form or by `reset()` |

```html
<!-- 2 seconds -->
<vscode-form-container mark-duration="2000"></vscode-form-container>

<!-- 1.5 seconds -->
<vscode-form-container mark-duration="1.5s"></vscode-form-container>

<!-- stays highlighted -->
<vscode-form-container mark-duration="forever"></vscode-form-container>
```

```js
const form = document.querySelector('vscode-form-container');

form.markDuration = 3000;
```

`VscodeFormContainer.defaultMarkDuration` is the fallback for the containers
without a `mark-duration` attribute. Changing it affects only the containers
that are marked afterwards.

A value that cannot be interpreted, e.g. `'slow'`, keeps the highlight until
it is reset.

Every modification restarts the countdown, but the events that belong to the
same keystroke — and the keystrokes a user types faster than 500ms — do not
extend the highlight.

## Only one form is highlighted

A page can contain several forms, but only one of them is highlighted at a
time. When a form is marked, every other form of the same root returns to its
normal state immediately, so the user always sees which form was modified
last. Forms in different shadow roots do not affect each other.

The state of every form of a page can be queried:

```js
const states = VscodeFormContainer.getFormStates();

// [
//   {element, id: 'profile', name: 'profile', dirty: false, markDuration: 5000},
//   {element, id: 'account', name: 'account', dirty: true, markDuration: '2s'},
// ]
```

`VscodeFormContainer.getFormStates(root)` accepts a `Document`, a `ShadowRoot`,
or an `Element` as the optional argument, and it includes the nested
containers.

## Manual control

```js
const form = document.querySelector('vscode-form-container');

// Mark the form and start the countdown.
form.mark();

// Restore the normal state immediately.
form.reset();
```

`vscode-form-container` also dispatches a `vsc-dirty-change` event when the
state changes. The event does not bubble, and its `detail` contains the
`form` and the new `dirty` value:

```js
form.addEventListener('vsc-dirty-change', (ev) => {
  console.log(ev.detail.form, ev.detail.dirty);
});
```

Automatic marking can be turned off with the `markable` attribute, while
`mark()` and `reset()` keep working:

```html
<vscode-form-container markable="false"></vscode-form-container>
```

## Styling

The background of the controls fades from a peak color to the resting color
over the whole duration of the state, and it fades back to the original
background of the control when the state is removed. The animation is disabled
when the user prefers the reduced motion.

The background color is applied only in the modified state, so a form that has
never been modified keeps the original background of its controls.

### Colors of the themes

The state is a light blue wash, and the palette follows the kind of the VS Code
theme. `#eff3ff` is the resting color of the light themes; the dark and the
high contrast themes use a color of the same hue with the lightness of their
surfaces, so the state stays visible without glaring.

| Theme kind | Resting color | Peak color | Border and ring |
| --- | --- | --- | --- |
| `vscode-light` (default) | `#eff3ff` | `#dbe4ff` | `#93a9f0`, `#6784de` |
| `vscode-dark` | `#243a5e` | `#2f4c7a` | `#4a6ea8` |
| `vscode-high-contrast` | `#243a5e` | `#3a5c8f` | `#7aa2e3` |
| `vscode-high-contrast-light` | `#dbe4ff` | `#b9c9ff` | `#0a3d91` |

The kind of the theme is published by VS Code on the `body` element as the
`data-vscode-theme-kind` attribute, with the `vscode-light`, `vscode-dark`,
`vscode-high-contrast`, and `vscode-high-contrast-light` values, and the
`vscode-light`, `vscode-dark`, and `vscode-high-contrast` classes. The styles
match with `:host-context`, so the colors follow the theme of the page, and
they are recalculated when the theme changes.

When the kind of the theme is not published, the light palette is used. A dark
page which does not publish the kind of the theme can ask for the dark palette
with the `prefers-color-scheme` media query of the page:

```html
<body class="vscode-dark"></body>
```

### Custom properties

The form container passes the custom properties to its controls. Each of them
can be set on a control as well, which overrides the value of the container:

| Property | Purpose |
| --- | --- |
| `--vsc-form-control-dirty-background` | Resting background color of the modified controls |
| `--vsc-form-control-dirty-background-peak` | Background color at the beginning of the animation |
| `--vsc-form-control-dirty-border-color` | Border color of the modified checkbox and radio buttons |
| `--vsc-form-control-dirty-ring-color` | Ring color of the modified checkbox and radio buttons |
| `--vsc-form-control-dirty-duration` | Duration of the animation, it is set automatically by the `markDuration` property |

```css
/* the whole page */
body {
  --vsc-form-control-dirty-background: #e8f0ff;
}

/* one control */
vscode-textfield {
  --vsc-form-control-dirty-background: #f0e8ff;
}
```
