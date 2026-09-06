This directory contains HTML files containing your element for development. By running `npm run start` you can edit and see changes without bundling.

## Unified component gallery

Open [`index.html`](./index.html) (or `http://localhost:8000/dev/index.html` after running `npm run start`) to use the unified development gallery. It contains all public components and their common interaction scenarios in one page.

The toolbar at the top applies one of the ten bundled VS Code themes, component size, and icon size globally. Use the component filter to focus on one family; the event log at the bottom captures bubbling component events. The per-component folders below are retained as focused regression fixtures and historical examples.

You can use the following files as a starting point:

- \_template.html - Default template. All VSCode theme variables, codicons, and components are available.
- \_template-csp.html - Template with strict CSP settings. All VSCode theme variables, codicons, and components are available.
- \_template-fallback-styles.html - Template for demoing the default styles. Codicons and all components are available, however theme variables are not.
