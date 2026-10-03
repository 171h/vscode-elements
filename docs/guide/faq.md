# 常见问题

## 安装哪个包？

本项目为 `nusys-ui`。上游 `@vscode-elements/elements` 与本项目共享标签名，不能在同一页面混用。参考旧文档时，应检查包路径和行为是否适用于当前版本。

## 为什么组件没有样式或图标？

先确认模块成功加载、`customElements.get('vscode-button')` 已注册。图标还需 `vscode-codicon-stylesheet` 链接和字体文件。普通浏览器需要配置主题变量；Webview 需检查资源 URI 与 CSP 控制台错误。见 [主题与图标](./theming)。

## `disabled="false"` 为什么仍然禁用？

布尔特性只看存在与否。删除 `disabled` 或设置 `element.disabled = false`。

## 为什么代码改了属性却没有 `change` 事件？

设置属性更新组件状态，通常不会模拟用户操作事件。应用同步状态时应显式更新自己的数据，不依赖程序赋值触发 `change`。

## 为什么百分比值变成小数？

`percentage` 模式下显示 `25%`，程序与表单使用 `'0.25'`。范围和步长也使用小数。见 [百分比输入](../textfield-percentage)。

## 多选值和显示文字为什么不同？

`value` 是业务值，展示文字可以由 `label`、内容或 `abbreviation` 决定。读取多选表单数据使用 `FormData.getAll()`。见 [多选标签](../multi-select-labels)。

## 表单高亮消失是否表示保存成功？

不是。`dirty` 用于短时交互提示，默认 5 秒消失；它不追踪初始值，不自动保存，也不是持久化的未保存标记。保存状态应由应用独立管理。

## 服务端渲染报 `customElements is not defined`？

把组件库导入放到客户端挂载阶段。个别文件的 SSR 防护并不等于整个入口支持在服务器中注册组件。VitePress 的示例在客户端 iframe 中加载构建产物。

## 拖拽后的布局如何保存？

监听 `vsc-tabs-layout-change`、`vsc-tabs-group-layout-change`，把节点映射到应用的稳定标识并保存。组件不提供跨窗口移动或工作台持久化。见 [标签页与视图拖拽](../tabs-drag-drop)。

## API 页为什么没有某个 HTMLElement 方法？

API 页列出本项目公开接口以及源码声明的事件、插槽和样式接口，不重复完整浏览器或 Lit API。`updateComplete` 是 Lit 的更新完成 Promise；`addEventListener()` 等继承自浏览器平台。
