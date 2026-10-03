# 快速开始

Nusys UI 是基于 VSCode Elements 修改的 Lit Web Components 组件库。npm 包名为 `nusys-ui`，HTML 标签保留 `vscode-` 前缀。这里的说明针对本仓库，包含统一尺寸、百分比输入和视图拖拽等扩展功能。

## 安装

```sh
npm install nusys-ui @vscode/codicons
```

源码开发需要 Node.js 22 或更新版本；使用已经构建的组件时，运行环境是支持 Custom Elements、Shadow DOM 和表单关联自定义元素的现代浏览器。主要验证环境为 Chromium 和 VS Code Webview。

## 导入

打包工具项目可导入全部组件：

```js
import 'nusys-ui';
```

按需导入可减小应用包体积。组合组件需要一并导入其子组件，除非对应入口已自动注册依赖：

```js
import 'nusys-ui/dist/vscode-button/index.js';
import 'nusys-ui/dist/vscode-textfield/index.js';
```

不使用打包工具时，把 `dist/bundled.js` 复制到应用的静态资源目录，以模块方式加载。浏览器不能直接解析 `nusys-ui` 这类裸模块名。

```html
<script type="module" src="./assets/nusys-ui.js"></script>
<vscode-button>保存</vscode-button>
```

VS Code Webview 应通过 `webview.asWebviewUri()` 转换资源路径，详见 [Webview 与 CSP](./webview)。

## 属性与 HTML 特性

HTML 特性通常使用连字符，JavaScript 属性使用驼峰命名。是否反射到特性请查阅各组件 API。

```html
<vscode-textfield id="rate" percentage value="0.125"></vscode-textfield>
<vscode-button disabled>无法操作</vscode-button>
```

```js
await customElements.whenDefined('vscode-textfield');
const field = document.querySelector('#rate');
field.value = '0.25';
await field.updateComplete;
console.log(field.value); // '0.25'，界面显示 25%
```

布尔特性以“是否存在”判断，`disabled="false"` 仍然表示禁用。需要启用时移除特性或设置 `element.disabled = false`。数组、对象和回调通常应通过 JavaScript 属性传入。

## 事件与插槽

输入控件优先使用原生 `input`、`change` 事件；额外行为使用 `vsc-` 事件。设置属性通常不会模拟用户交互事件，调用方应自行更新应用状态。

```js
const field = document.querySelector('#rate');
field.addEventListener('input', () => {
  console.log(field.value);
});
```

默认插槽接收标签内的内容，命名插槽使用 `slot` 特性：

```html
<vscode-collapsible title="任务">
  <vscode-badge slot="decorations" variant="counter">3</vscode-badge>
  <p>当前任务列表</p>
</vscode-collapsible>
```

## 下一步

- 在 [组件索引](../components/) 中查找使用说明和交互示例。
- 阅读 [表单与校验](./forms)、[主题与图标](./theming) 和 [框架集成](./frameworks)。
- 通过 [API 索引](../api/) 查阅属性、方法、事件、插槽及 CSS 接口。
