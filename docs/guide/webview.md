# Webview 与 CSP

## 资源打包

将 `nusys-ui/dist/bundled.js`、Codicon CSS 和字体复制到扩展资源目录。用 `webview.asWebviewUri()` 生成 URI，并通过 `localResourceRoots` 只授权所需目录。

```ts
const scriptUri = webview.asWebviewUri(
  vscode.Uri.joinPath(extensionUri, 'media', 'nusys-ui.js')
);
const iconUri = webview.asWebviewUri(
  vscode.Uri.joinPath(extensionUri, 'media', 'codicon.css')
);
```

## 内容安全策略

每次生成 Webview HTML 时，使用密码学安全的随机 nonce。将同一 nonce 写入授权的脚本、样式链接与样式块，确保图标链接保留 `vscode-codicon-stylesheet` id。

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; img-src ${webview.cspSource} data:;
  font-src ${webview.cspSource}; style-src ${webview.cspSource} 'nonce-${nonce}';
  script-src 'nonce-${nonce}';"
/>
<link
  id="vscode-codicon-stylesheet"
  rel="stylesheet"
  href="${iconUri}"
  nonce="${nonce}"
/>
<script type="module" src="${scriptUri}" nonce="${nonce}"></script>
```

以上是扩展宿主生成字符串时的模板片段，`${...}` 由宿主替换。应用自己的外部样式、字体、图片与网络连接还需对应授权。不要把文档站点的 CSP 或演示 nonce 直接作为生产策略。

库使用 Lit 样式及部分动态内联样式。策略、Chromium 版本与组件功能组合可能影响实际呈现，应在真实 Webview 中验证；保留的 [CSP 检查模板](../examples/csp.md) 用于浏览器本地排查。

## 与扩展宿主通信

```js
const vscode = acquireVsCodeApi();
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  vscode.postMessage({
    type: 'save-settings',
    entries: Array.from(new FormData(event.target)),
  });
});
```

扩展宿主应校验消息类型与数据结构，将需要权限的操作和服务密钥保留在宿主。显示外部文字使用 `textContent`；不要把不可信内容插入 HTML。

完整宿主 API 参见 [VS Code Webview 指南](https://code.visualstudio.com/api/extension-guides/webview)。
