# 文档维护

## 本地运行

在仓库根目录执行：

```sh
npm ci
npm run docs:dev
```

开发命令先构建组件、生成 API 和复制示例资源，再启动 VitePress。修改组件源码后重新运行 `npm run docs:prepare` 并刷新示例；修改 Markdown、主题或示例数据由 VitePress 热更新。

```sh
npm run docs:check
npm run docs:build
npm run docs:preview
```

构建输出在 `docs/.vitepress/dist`。部署到子路径时设置 `DOCS_BASE`（例如 `/nusys-ui/`）；预览、示例和资源均跟随该路径。未配置任何自动发布或远程推送。

## 目录与数据来源

| 路径                       | 用途                                      |
| -------------------------- | ----------------------------------------- |
| `docs/guide/`              | 安装、集成、主题、表单与常见问题          |
| `docs/components/`         | 组件使用说明与示例引用                    |
| `docs/data/components.mjs` | 组件名称、分类与摘要                      |
| `docs/data/examples.mjs`   | 经审核的本地 HTML、CSS、JavaScript 示例   |
| `docs/data/scenarios.mjs`  | 全部组件的功能场景与覆盖说明              |
| `docs/data/showcase.mjs`   | 综合页的演示分类与去重                    |
| `docs/api/generated/`      | 从当前自定义元素清单生成的 API，不提交    |
| `docs/public/assets/`      | 当前库 bundle 与 Codicon 静态资源，不提交 |
| `docs/.vitepress/`         | 配置、主题和示例预览组件                  |
| `scripts/docs-*.mjs`       | API、资源生成及完整性与交互检查           |

公开 API 内容来源于源码 JSDoc 和生成的 `custom-elements.json`，修正 API 应修改源码描述。生成页只展示公开成员，排除私有成员、内部成员和 Lit 生命周期方法。源码未声明的行为应在组件指南中说明，不把自动分析结果视为额外兼容性承诺。

## 添加组件或示例

同步 `src/main.ts`、组件目录、分类数据、组件 Markdown 和示例数据。所有自然语言说明使用中文。示例代码只来自仓库维护者审核的静态数据，预览不执行外部用户输入。

每个组件提供用途、导入方式、组合约束、可运行代码与 API 链接。优先展示常见行为，再在专题中记录复杂边界。更新组件后运行完整性检查与生产构建，并检查明暗主题、键盘、焦点和禁用状态。

每个组件还必须在 `componentScenarios` 中登记功能场景；场景的 `features` 明确列出状态、属性、事件、方法和组合方式。关联的子组件共用符合结构约束的场景。新增公共功能时同步场景，而不是只增加 API 列表。交互涉及表单提交时验证真实 `FormData`，不要只读取控件的 `value`。

[综合体验](../examples/showcase)复用同一份示例数据，组件场景直接展示。主题选择器来自 `@vscode-elements/webview-playground`，只在全局布局中挂载；通过消息更新所有预览的主题变量与尺寸，保留用户操作状态。不要在组件页面或示例内新增主题选择器。

仓库 `.vscode/settings.json` 设置 `vite.autoStart: false`，禁用 Vite 扩展打开文件夹时自动执行 `npx vite --port=4000`。需要预览时手动执行 `npm run docs:dev`。
