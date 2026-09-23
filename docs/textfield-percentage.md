# Textfield percentage mode

The `percentage` property of `vscode-textfield` turns the component into a
percent field. The editable text is always a percent number and the percent
sign is displayed inside the input, while the value which the component reports
uses the fraction form of that number:

| Typed in the input | Displayed in the input | `value` |
| --- | --- | --- |
| `1` | `1%` | `0.01` |
| `12.5` | `12.5%` | `0.125` |
| `-3` | `-3%` | `-0.03` |

## Enable the mode

Add the `percentage` attribute, or set the property:

```html
<vscode-label for="opacity">Opacity</vscode-label>
<vscode-textfield id="opacity" percentage value="0.5"></vscode-textfield>
```

```js
const field = document.querySelector('#opacity');

field.percentage = true;
```

The example displays `50%`, because `value` is written in the fraction form.
The property is reflected, so the attribute and the property can be used
interchangeably and the mode can be switched at runtime. The current value is
converted when the mode changes: a field with the value `0.25` displays `25%`
after `percentage` is enabled and `0.25` again after it is disabled. A value
which cannot be represented as a percent number - for example `abc` - is
dropped when the mode is enabled.

## The programmatic value is a fraction

Everything which a program reads or writes uses the fraction form:

| Read or written with | Unit | Example for `1%` |
| --- | --- | --- |
| The displayed text of the input | percent number | `1%` |
| `value` property and attribute | fraction | `0.01` |
| Submitted form value and `FormData` | fraction | `0.01` |
| `defaultValue` and `formStateRestoreCallback` | fraction | `0.01` |
| `min`, `max`, and `step` | fraction | `0.01` |

```js
field.value = '0.01'; // the input displays "1%"
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

An empty field does not display a percent sign, and the empty state is an empty
string both in the `value` property and in the submitted form value. The
`required` validation reports the empty field as usual.

## Editing behaviour

- The percent sign is added as soon as the number contains a digit, and it is
  not part of the number which is edited: pressing Backspace removes the last
  digit and keeps the sign.
- Only the characters of a number are accepted while typing: the digits, a
  single decimal separator, and a leading minus sign. Everything else is
  ignored. A comma is converted to a period, so `1,5` becomes `1.5%`.
- The text is normalized when the editing is finished, which is when the field
  loses the focus: `05` becomes `5%`, `1.` becomes `1%`, and a lone `-` clears
  the field.
- The `input` and `change` events are dispatched as usual. The `value` property
  already holds the fraction form when an event is handled, and the value
  submitted with the form is updated while typing.
- The inner input is rendered as a text field, because a native number field
  does not accept a percent sign. The `type` property therefore has no effect in
  this mode, and the arrow keys do not change the value.

## Validation

`required`, `pattern`, `minlength`, and `maxlength` are checked against the
displayed text, which contains the percent sign, just like in a native text
field:

```html
<vscode-textfield percentage required pattern="^\d+%$"></vscode-textfield>
```

`min`, `max`, and `step` are checked against the fraction value, in the same
unit as the `value` property:

```html
<vscode-textfield
  percentage
  min="0"
  max="1"
  step="0.05"
  value="0.5"
></vscode-textfield>
```

The example accepts 0% - 100% in steps of 5%. The validation messages match the
native messages, for example `Value must be less than or equal to 1.`:

```js
field.checkValidity(); // false when the field displays "150%"
field.validity.rangeOverflow; // true
```

## Live example

The `dev/vscode-textfield/percentage.html` page contains a percent field which
shows the displayed text and the value which is read by the program, an
editable required field, a field with `min`, `max`, and `step`, a runtime
toggle, and a form which submits the fraction values. Start the development
server and open the page:

```bash
npm run start
# http://localhost:8000/dev/vscode-textfield/percentage.html
```
