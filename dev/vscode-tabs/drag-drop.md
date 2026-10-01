# Tabs as sidebar view containers

Tabs support native HTML move drag and drop. Import `nusys-ui` (the main bundle)
or the individual tabs, tab-header, tab-panel and fieldset modules.

```html
<vscode-tabs>
  <vscode-tab-header>Explorer</vscode-tab-header>
  <vscode-tab-panel>
    <vscode-fieldset>
      <fieldset>
        <legend>Files</legend>
        <label>Filter <input name="filter" /></label>
      </fieldset>
    </vscode-fieldset>
    <fieldset>
      <legend>Outline</legend>
      Any content
    </fieldset>
  </vscode-tab-panel>
  <vscode-tab-header>Search</vscode-tab-header>
  <vscode-tab-panel></vscode-tab-panel>
</vscode-tabs>
```

The custom component wraps a native fieldset supplied by the caller; direct native
fieldsets also work. Only direct children of a tab panel are movable views.
Drag a view by its first legend. Nested form fieldsets and controls are not drag
handles. Provide a legend for each movable view.

## Gestures

- Drag a tab header to either side of another header to reorder its header/panel
  pair. The active panel stays selected when reordered.
- Drag a legend to the upper or lower half of a view to insert before or after it.
- Drop into panel whitespace or an empty panel to append a view.
- Hover a legend over the middle half of a tab header for 500 ms to activate its
  panel. Drop there to append the view to that panel.
- Drop a legend near a tab header's left/right edge or at the end of the header
  bar to create a tab named after its legend. Moving its last view out removes
  that generated tab. Author-provided empty tabs remain available as drop targets.
- Drop a tab header into another panel to move all its direct views together in
  their existing order. An emptied source pair is removed only when it has no
  other content; unrelated content is retained.
  Hover over another header's center for 500 ms to reveal its panel before
  continuing down into it. Releasing on the header bar still reorders tabs.
- All moves also work across separate tabs components in the same document.
- Escape, drag end, leaving a target, or disconnecting a source clears feedback
  and pending activation. External file/text drags are ignored.
- Scrollable content scrolls when dragged near its top/bottom edge. Indicators
  respect `prefers-reduced-motion`.

## Tabs groups

`vscode-tabs-group` stacks `vscode-tabs` children and adds group level drag and
drop. The container shows a hint while no tabs group is assigned:

```html
<vscode-tabs-group empty-text="Drop a tabs group here">
  <vscode-tabs>
    <vscode-tab-header>Explorer</vscode-tab-header>
    <vscode-tab-panel>
      <fieldset><legend>Files</legend></fieldset>
    </vscode-tab-panel>
  </vscode-tabs>
  <vscode-tabs>...</vscode-tabs>
</vscode-tabs-group>
```

- Drag the empty background of a tab strip (the part of the header bar that is
  not a tab title or an addon control) to move the whole tabs group. A drag
  image with every tab title follows the pointer and a placeholder shows the
  insertion point. Groups can be reordered in place or moved into another
  `vscode-tabs-group`. Sibling groups slide to the side with a short animation.
- Tab titles keep their existing behavior inside their own group. Dropping one
  on the container background promotes it to a new tabs group at that position.
  Removing the source group's last tab removes the emptied `vscode-tabs`.
- Dropping a fieldset legend on the container creates a new tabs group whose
  generated tab is named after the legend and whose panel contains the view.
  Moving the last view out removes the generated group again.
- While a tab or view is dragged over the container, the placeholder shows the
  title(s) that will become the new group. Dropping the pointer over one of the
  existing `vscode-tabs` components keeps the inner tab and view behaviors.
- Listen for `vsc-tabs-group-layout-change` (bubbling/composed) to persist
  grouping. Its detail contains `source` (the previous group or `null`),
  `destination`, `tabs` (the moved or created component), and the optional
  `header` and `views` that were moved.

The container is only a layout and drop target. It does not implement VS Code
workbench persistence; persist the layout from the events. `empty-text` can
replace the built-in hint text.

Moves retain original nodes, input values and listeners. No automatic storage is
performed. Listen for `vsc-tabs-layout-change` (bubbling/composed) to persist layout.
Its detail contains `source` and `destination` tabs elements, `views` (moved view
elements), and optional `header` (the dragged tab header). `vsc-tabs-select` is
emitted on hover activation. Header/panel relationships still use their matching
order in light DOM. Custom DOM changes should preserve that pairing.

Theme tokens: `--vscode-activityBar-dropBorder`, `--vscode-sideBar-dropBackground`,
`--vscode-sideBarSectionHeader-background`, `--vscode-foreground`,
`--vscode-focusBorder`, `--vscode-contrastActiveBorder`.

Fieldsets and their legends use sidebar background/foreground, section header
foreground/border, `--vscode-contrastBorder`, `--vscode-focusBorder`
and `--vscode-disabledForeground`. Missing sidebar tokens fall back to editor
and foreground tokens, then system colors. High contrast borders and Windows
forced colors remain visible. Theme changes update existing views immediately.
Legends have no border and a transparent background, so they blend with the
surface behind the fieldset border instead of painting a dark rectangle in dark
themes; their theme foreground stays readable on light and dark surfaces.
Use `size="small"`, `size="medium"` (default) or `size="large"` on
`vscode-fieldset` or a direct native panel fieldset. Their border radii match the
project's form controls: 1px, 4px and 6px. Applications can override
`--vsc-form-control-border-radius`. The gallery's global Size buttons and the
standalone demo's Size buttons update both wrapped and native fieldsets.
The same styles cover wrapped fieldsets and direct native panel children without
styling nested form fieldsets. Low specificity allows application CSS overrides.
Styles are installed once per containing document or shadow root, because a
shadow slot cannot style the native fieldset's legend descendants.

The standalone demo includes the project's theme selector. Run
`node scripts/test-fieldset-themes.mjs` against the development server to check
all ten bundled themes and produce screenshots under `.wireit/`.

## VS Code references

The implementation follows the behavior in these MIT-licensed Microsoft sources;
it does not copy the workbench service infrastructure:

- [compositeBar.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/parts/compositeBar.ts):
  native move operation, ordered container insertion and promotion of a view into
  a new container.
- [viewPaneContainer.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/browser/parts/views/viewPaneContainer.ts):
  midpoint hit testing, half-pane drop overlays and cleanup.

This library retains its horizontal tabs layout. The center/edge header zones
provide both view promotion and moving into existing panels in that layout.
The browser renders the drag image and moves it with the pointer; exact appearance
depends on the browser/OS, as with native VS Code HTML drag and drop. This API
does not implement VS Code workbench persistence or dragging between windows.

Interactive demo: `dev/vscode-tabs/drag-drop.html` (run `npm run serve`).
