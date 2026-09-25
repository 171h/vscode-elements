# Modified state of a form

`vscode-form-container` highlights itself with a light green background when
one of its form controls is modified. The highlight makes the change visible
even when the modified control is outside of the viewport, and it disappears
automatically after a timeout.

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

The state is visible on the element as the `dirty` attribute and on the
`dirty` property:

```js
const form = document.querySelector('vscode-form-container');

form.dirty; // false
form.dirty; // true after the user types into the textfield
```

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

// Highlight the form and start the countdown.
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

The highlight fades from a stronger green to a subtle green over the whole
duration of the state, and the removal of the state is animated as well. The
animation is disabled when the user prefers the reduced motion.

The colors can be customized with CSS custom properties:

| Property | Default | Purpose |
| --- | --- | --- |
| `--vsc-form-dirty-color` | `#2ea0431a` | Background color of the modified state |
| `--vsc-form-dirty-color-peak` | `#2ea04340` | Background color at the beginning of the animation |
| `--vsc-form-dirty-ring-color` | `#2ea04300` | Start and end color of the ring |
| `--vsc-form-dirty-ring-color-peak` | `#2ea04366` | Ring color at the beginning of the animation |
| `--vsc-form-dirty-border-radius` | `4px` | Corner radius of the highlight |

```css
vscode-form-container {
  --vsc-form-dirty-color: #3fb95033;
  --vsc-form-dirty-color-peak: #3fb95066;
}
```

The background color is applied only in the modified state, so a form that has
never been modified keeps its original background.
