// 仅执行仓库中已审核的静态示例；不接受外部 HTML 或 JavaScript。
export function previewDocument(
  example,
  {base = '/', theme, size = 'medium'} = {}
) {
  const initialTheme = JSON.stringify(
    theme || {kind: 'vscode-light', variables: {}}
  ).replaceAll('<', '\\u003c');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link id="vscode-codicon-stylesheet" rel="stylesheet" href="${base}assets/codicon.css"><style>
  *{box-sizing:border-box}
  body{margin:0;padding:24px;background:var(--vscode-editor-background,#fff);color:var(--vscode-foreground,#242424);font:13px var(--vscode-font-family,sans-serif)}
  p{line-height:1.7} output{display:block;margin-top:16px;white-space:pre-wrap;overflow-wrap:anywhere}
  vscode-textfield,vscode-textarea,vscode-single-select,vscode-multi-select{margin:8px 0;max-width:100%}
  vscode-label{display:block} vscode-tab-panel{padding:12px} fieldset{margin:8px 0} vscode-fieldset{display:block;margin:8px 0}
  .variants{display:flex;flex-wrap:wrap;gap:16px;align-items:center} .stack{display:grid;gap:12px} .columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:16px}
  ${example.css || ''}</style></head><body>${example.html}<script type="module">
  import '${base}assets/nusys-ui.js';
  function applyTheme(theme) {
    const root = document.documentElement;
    Array.from(root.style).filter(name => name.startsWith('--vscode-')).forEach(name => root.style.removeProperty(name));
    Object.entries(theme.variables || {}).forEach(([name,value]) => { if(name.startsWith('--vscode-')) root.style.setProperty(name,value); });
    document.body.className = theme.kind === 'vscode-high-contrast-light' ? 'vscode-high-contrast vscode-high-contrast-light' : theme.kind;
    document.body.dataset.vscodeThemeKind = theme.kind;
    root.dataset.themeId = theme.id || '';
    root.style.colorScheme = ['vscode-dark','vscode-high-contrast'].includes(theme.kind) ? 'dark' : 'light';
  }
  applyTheme(${initialTheme});
  const fixedSizes = new WeakSet(document.querySelectorAll('[size]'));
  function applySize(size) {
    if (!['small','medium','large'].includes(size)) return;
    document.documentElement.dataset.previewSize = size;
    document.querySelectorAll('[class],body').forEach(el => el.style.setProperty('--vsc-form-control-size',size));
    document.querySelectorAll('*').forEach(el => {
      if (fixedSizes.has(el)) return;
      if(el.localName.startsWith('vscode-') && ['small','medium','large'].includes(el.size)) el.size=size;
      if(el.localName==='fieldset') el.setAttribute('size',size);
    });
  }
  window.addEventListener('message', event => {
    if(event.source !== window.parent || event.origin !== new URL(document.baseURI).origin || event.data?.type !== 'nusys-docs-settings') return;
    applyTheme(event.data.theme);
    applySize(event.data.size);
  });
  applySize('${size}');
  await Promise.all(Array.from(document.querySelectorAll('*')).map(el=>el.updateComplete));
  ${example.js || ''}
  await Promise.all(Array.from(document.querySelectorAll('*')).map(el=>el.updateComplete));
  await new Promise(requestAnimationFrame);
  document.documentElement.dataset.ready='true';
  let heightFrame;
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(heightFrame);
    heightFrame = requestAnimationFrame(() => window.parent.postMessage({type:'nusys-docs-height',height:Math.ceil(document.body.getBoundingClientRect().height)},new URL(document.baseURI).origin));
  });
  resize.observe(document.body);
  <\/script></body></html>`;
}
