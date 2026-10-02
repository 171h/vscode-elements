# Nusys UI

本项目基于 VSCode Elements 修改，npm 包名为 `nusys-ui`，组件标签保留 `vscode-` 前缀。面向使用者的中文文档与交互示例在本仓库的 [`docs`](docs/index.md) 中，使用 VitePress 构建。

本文档面向希望参与项目贡献或自行修改代码的开发者。

## 文档

安装依赖并启动文档：

```bash
npm ci
npm run docs:dev
```

打开终端输出的本地地址（默认 `http://localhost:5173`）。命令会先构建当前组件库、生成 API 并准备示例资源。文档修改支持热更新；组件源码修改后重新执行 `npm run docs:prepare` 并刷新预览。

- [快速开始](docs/guide/getting-started.md)：安装、完整导入、按需导入与 Web Components 用法。
- [组件索引](docs/components/index.md)：全部 40 个公开组件的中文说明和交互示例。
- [API 参考](docs/api/index.md)：从当前源码生成属性、方法、事件、插槽与样式接口。
- [常见问题](docs/guide/faq.md)：包名、主题、图标、事件、SSR 与布局保存。
- [文档维护](docs/guide/contributing.md)：构建、子路径部署和示例数据来源。

- [表单控件尺寸](docs/form-size.md)：说明统一的 `small`、`medium`、`large` 尺寸、支持的组件、运行时用法、表单组及图标尺寸。
- [AI 辅助开发指南](AGENTS.md)：说明代理配置、任务示例、验证流程，以及中文文档、注释和 Conventional Commits 提交规范。
- [多选框选中标签](docs/multi-select-labels.md)：说明 `vscode-option` 的 `abbreviation`、`vscode-multi-select` 展示区域的显示优先级，以及折叠和工具提示行为。
- [文本框百分比模式](docs/textfield-percentage.md)：说明 `vscode-textfield` 的 `percentage` 属性、百分号显示、小数形式数值，以及编辑和校验行为。
- [表单已修改状态](docs/form-dirty-highlight.md)：说明 `vscode-form-container` 高亮、持续时间、参与的控件及主题颜色。

VSCode Elements 基于 [Lit](https://lit.dev/) 库。开发环境需要 Node.js 22 或更新版本。若希望在自己的项目中使用本地组件库，可使用 `npm link`。先进入 VSCode Elements 目录执行：

```bash
npm link
```

再进入使用组件库的项目，执行：

```bash
npm link nusys-ui
```

多个包需要链接时应在同一条命令中列出。

使用包前请先执行构建脚本。

## 环境配置

安装依赖：

```bash
npm ci
```

## package.json 中定义的脚本

各脚本均可通过 `npm run <脚本名称>` 执行。项目使用 Wireit 缓存脚本结果。

### build

构建所有发布内容，包括：

- 转译后的 JavaScript、类型声明和源码映射文件。
- 自定义元素清单。
- VS Code 自定义补全数据。
- 将整个组件库打包为单个压缩后的 JavaScript 文件。

### build:ts

将 TypeScript 转译为未压缩的 JavaScript，供使用者的应用导入和优化。

### build:watch

以监视模式运行 TypeScript 编译器，文件修改后自动重新编译。

### clean

删除生成的文件。

### lint

使用 [ESLint](https://eslint.org/) 检查代码风格。

### lint:fix

自动修复代码风格问题。

### prettier

使用 [Prettier](https://prettier.io/) 检查文件格式。

### prettier:fix

自动修复文件格式问题。

### analyze

生成[自定义元素清单](https://custom-elements-manifest.open-wc.org/)。该文件随包发布，文档站点的 API 视图基于此清单生成。

### serve

启动 VitePress 文档开发服务器，与 `docs:dev` 相同。

### start

启动文档与组件预览，与 `docs:dev` 相同。组件源码修改后运行 `docs:prepare` 更新预览资源；持续编译可另开终端运行 `build:watch`。

### docs:dev、docs:build 与 docs:preview

启动开发、构建生产站点与预览生产站点。生产产物位于 `docs/.vitepress/dist`。部署到子目录时设置 `DOCS_BASE`，例如 `/nusys-ui/`。本仓库只提供构建与校验，不自动发布站点。

### docs:prepare、docs:check 与 docs:test

准备当前组件 bundle、Codicon 字体和 API；检查全部组件的覆盖范围、示例代码和本地链接；构建并执行文档浏览器检查。`docs:test` 包含主题、尺寸、键盘、禁用、表单、拖拽、CSP 与移动布局检查。

### test

编译并执行测试。测试使用 TypeScript 编写，因此执行前需要转译。

### test:coverage

执行测试并生成覆盖率报告。

### test:watch

监视文件变化，修改后自动重新编译并执行测试。

### wtr:watch

以监视模式启动 Web Test Runner，不重新构建文件。可在单独终端中运行，以便在开发时发现新错误。

### checksize

显示打包文件 `dist/bundled.js` 经 gzip 压缩后的字节数。

### icons

输出当前 Codicon 包的图标列表，便于检查可用名称。图标配置与用法见 [主题与图标](docs/guide/theming.md)。

### vscode-data

生成 VS Code 代码补全所需的 HTML 和 CSS [自定义数据](https://code.visualstudio.com/blogs/2020/02/24/custom-data-format)。

### release

从干净的工作区运行 `npm run release`。默认建议递增 `patch` 版本；可用 `npm run release -- minor`、`npm run release -- major` 或 `npm run release -- 3.1.0` 指定其他版本。命令会提示确认最终的 `v` 前缀版本标签及发布操作。

发布新版本时，命令会更新 `package.json`、`package-lock.json` 和组件版本，根据上次发布以来的 Git 提交生成 `CHANGELOG.md` 条目，提交这些文件并创建标签。选择当前版本时仅创建或更新标签，保留现有变更日志。

确认推送后，分支和标签会推送到 `origin`，并自动启动 GitHub Actions 的 **Release** 工作流。该工作流构建、测试并将 `nusys-ui` 发布到 npmjs，随后使用 `CHANGELOG.md` 中的说明创建 GitHub 发布。请检查工作流是否完成；本地推送成功不代表 npm 发布已完成。

在仓库 Actions 中配置名为 `NPM_TOKEN` 的密钥，使其具有发布 `nusys-ui` 的权限，并可绕过无人值守发布的双因素认证。工作流通过 `actions/setup-node` 将其作为 `NODE_AUTH_TOKEN` 提供给 npm。GitHub 密钥仅在 Actions 中使用；本地命令需要 Git 推送权限，不需要 npm 令牌。包中的仓库地址必须与本仓库一致，以支持 npm 来源证明。

打标签的提交必须包含最新工作流。发布失败时，可手动运行 **Release**，并将 `version_tag` 设置为已有标签。已发布的 npm 版本会跳过；若包内容发生变化，应发布新版本。

## 文档与提交约定

本项目的文档相关文件与代码注释统一使用中文；命令、API 标识符、链接和工具指令保留原格式。所有后续提交必须遵循 Conventional Commits，提交描述与正文尽可能使用中文。详细要求参见 [AGENTS.md](AGENTS.md)。
