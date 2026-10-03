import '@vscode-elements/webview-playground';
import {VscodeDemo} from '@vscode-elements/webview-playground/dist/demo.js';
import {getDefaultStylesCSS} from '@vscode-elements/webview-playground/dist/shared.js';

// 历史示例保留原标签，环境模拟由 playground 提供。
const styles = new CSSStyleSheet();
styles.replaceSync(getDefaultStylesCSS('component-preview[data-vscode-demo] '));
document.adoptedStyleSheets.push(styles);
customElements.define('component-preview', class extends VscodeDemo {});
