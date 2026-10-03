# nusys-ui

基于 Lit 的 Web Components 组件库，用于开发 VS Code 扩展，组件标签保留 `vscode-` 前缀。本仓库独立维护，项目地址为 [171h/vscode-elements](https://github.com/171h/vscode-elements)。

## 环境配置

使用 Node.js 22.12+（22.x）、24.x 或 26+，推荐 Node.js 24。项目固定使用 pnpm 12.8.1、Vite 8.3.2 和 Vitest 5.0.3。

安装 pnpm 后执行：

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm test:install
```

`packageManager` 字段固定 pnpm 版本，`pnpm-lock.yaml` 锁定依赖；浏览器安装单独执行，不在依赖安装时隐式下载。Linux 的浏览器安装可能需要安装系统依赖的权限。

VS Code 工作区设置禁用 Vite 扩展的自动启动，打开项目不会自动执行 `npx vite --port=4000`。需要开发服务器时，手动运行 `pnpm start`。

## 开发、构建与测试

所有命令均在仓库根目录执行：

| 命令                                  | 用途                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm start` / `pnpm docs:dev`        | 构建组件并启动 VitePress 中文文档站点                                                       |
| `pnpm dev`                            | 与 `pnpm docs:dev` 相同，启动 VitePress 中文文档站点                                        |
| `pnpm build`                          | Vite 构建模块入口与单文件压缩包，TypeScript 生成类型声明，再生成组件清单和 VS Code 补全数据 |
| `pnpm preview`                        | 与 `pnpm docs:preview` 相同，预览生产文档站点                                               |
| `pnpm typecheck`                      | 检查组件和测试的 TypeScript 类型                                                            |
| `pnpm test`                           | Vitest 执行 Chromium 组件测试与 Node.js 发布工具测试                                        |
| `pnpm test:watch`                     | Vitest 监视模式                                                                             |
| `pnpm test:coverage`                  | 执行测试并生成 V8 覆盖率报告                                                                |
| `pnpm test:release`                   | 仅执行发布工具测试                                                                          |
| `pnpm test:build`                     | 验证模块导入、组件清单与单文件产物                                                          |
| `pnpm test:install`                   | 安装 Playwright Chromium 与所需系统依赖                                                     |
| `pnpm lint` / `pnpm lint:fix`         | ESLint 检查 / 修复源码                                                                      |
| `pnpm prettier` / `pnpm prettier:fix` | Prettier 检查 / 格式化仓库文件                                                              |
| `pnpm analyze`                        | 生成自定义元素清单                                                                          |
| `pnpm vscode-data`                    | 从清单生成 VS Code HTML 和 CSS 补全数据                                                     |
| `pnpm icons`                          | 输出当前 Codicon 图标示例                                                                   |
| `pnpm checksize`                      | 构建并报告单文件包的 gzip 字节数，支持 Windows                                              |
| `pnpm clean`                          | 删除生成产物                                                                                |

Vite 负责开发、生产构建和生产预览；不再使用 Wireit、Rollup 配置、Web Dev Server 或 Web Test Runner。组件库输出保留 `dist/main.js`、各组件入口、类型声明及 `dist/bundled.js`。模块构建将 Lit 等运行时依赖保留为外部导入，单文件构建包含运行时依赖。示例保留 `@vscode-elements/webview-playground`，提供十种 VS Code 主题以及减少动画、链接下划线和视图容器切换，保持与文档网站一致的环境模拟。

本地项目可使用 `pnpm link` 链接组件库，链接前先执行 `pnpm build`。浏览器测试使用真实 Chromium，保留布局、表单关联、焦点、键盘和原生鼠标行为；测试辅助库只提供 Lit fixture 和 DOM 结构比较。

## 文档

中文文档站点位于 [docs](docs/index.md)，包含 [快速开始](docs/guide/getting-started.md)、[全部组件](docs/components/index.md)、[源码 API](docs/api/index.md) 和 [文档维护](docs/guide/contributing.md)。执行 `pnpm dev` 或 `pnpm docs:dev` 后访问终端输出的地址（默认 `http://localhost:5173`）。Markdown、Vue 主题和示例数据支持热更新；组件源码和样式保存后自动重新构建并重载文档页，示例临时输入会重置。修改公共 API 或 JSDoc 后执行 `pnpm docs:prepare` 更新 API 文档。

`pnpm docs:check` 检查组件覆盖、示例与链接；`pnpm docs:build` 构建生产站点；`pnpm docs:preview` 预览站点；`pnpm docs:test` 构建并执行文档浏览器交互检查。输出位于 `docs/.vitepress/dist/`，通过 `DOCS_BASE` 支持子路径部署。[综合体验](docs/examples/showcase.md) 复用全部组件场景，导航栏统一管理主题和尺寸并保留预览状态。组件示例统一维护在 `docs/`，开发预览使用 `pnpm dev` 或 `pnpm docs:dev`。

`pnpm docs:test:dev` 在独立副本中验证 Markdown 热更新、组件源码和样式自动重载，以及编译错误后的恢复，不修改开发者的源码。

开发要求参见 [AGENTS.md](AGENTS.md) 和 [CONTRIBUTING.md](CONTRIBUTING.md)。工具链迁移与功能、性能验证结果参见 [迁移报告](docs/toolchain-migration.md)。

标签页新增功能与交互约定参见 [标签页溢出显示](docs/tabs-overflow.md)，涵盖换行、滚动、溢出菜单与标题图标布局。

### release

从干净的工作区运行 `pnpm release`。默认建议递增 `patch` 版本；可用 `pnpm release -- minor`、`pnpm release -- major` 或 `pnpm release -- 3.1.0` 指定其他版本。命令会提示确认最终的 `v` 前缀版本标签及发布操作。

发布新版本时，命令会更新 `package.json` 和组件版本（pnpm 锁文件不记录根包版本），根据上次发布以来的 Git 提交生成 `CHANGELOG.md` 条目，提交这些文件并创建标签。选择当前版本时仅创建或更新标签，保留现有变更日志。

确认推送后，分支和标签会推送到 `origin`，并自动启动 GitHub Actions 的 **Release** 工作流。该工作流构建、测试并将 `nusys-ui` 发布到 npmjs，随后使用 `CHANGELOG.md` 中的说明创建 GitHub 发布。请检查工作流是否完成；本地推送成功不代表 npm 发布已完成。

在仓库 Actions 中配置名为 `NPM_TOKEN` 的密钥，使其具有发布 `nusys-ui` 的权限，并可绕过无人值守发布的双因素认证。工作流通过 `actions/setup-node` 将其作为 `NODE_AUTH_TOKEN` 提供给 pnpm。GitHub 密钥仅在 Actions 中使用；本地命令需要 Git 推送权限，不需要 npm 令牌。包中的仓库地址必须与本仓库一致，以支持 npm 来源证明。

打标签的提交必须包含最新工作流。发布失败时，可手动运行 **Release**，并将 `version_tag` 设置为已有标签。已发布的 npm 版本会跳过；若包内容发生变化，应发布新版本。

## 文档与提交约定

本项目的文档相关文件与代码注释统一使用中文；命令、API 标识符、链接和工具指令保留原格式。所有后续提交必须遵循 Conventional Commits，提交描述与正文尽可能使用中文。详细要求参见 [AGENTS.md](AGENTS.md)。
