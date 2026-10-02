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

## 开发、构建与测试

所有命令均在仓库根目录执行：

| 命令                                  | 用途                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm start`                          | Vite 开发服务器，直接编译源码并打开 `http://localhost:8000/dev/index.html`                  |
| `pnpm build`                          | Vite 构建模块入口与单文件压缩包，TypeScript 生成类型声明，再生成组件清单和 VS Code 补全数据 |
| `pnpm build:demo`                     | Vite 构建所有示例页，输出至 `demo-dist/`                                                    |
| `pnpm preview`                        | 预览生产构建的示例页面                                                                      |
| `pnpm typecheck`                      | 检查组件和测试的 TypeScript 类型                                                            |
| `pnpm test`                           | Vitest 执行 Chromium 组件测试与 Node.js 发布工具测试                                        |
| `pnpm test:watch`                     | Vitest 监视模式                                                                             |
| `pnpm test:coverage`                  | 执行测试并生成 V8 覆盖率报告                                                                |
| `pnpm test:release`                   | 仅执行发布工具测试                                                                          |
| `pnpm test:build`                     | 验证开发页、生产示例、主题、CSP、原生拖拽与单文件产物                                       |
| `pnpm test:install`                   | 安装 Playwright Chromium 与所需系统依赖                                                     |
| `pnpm lint` / `pnpm lint:fix`         | ESLint 检查 / 修复源码                                                                      |
| `pnpm prettier` / `pnpm prettier:fix` | Prettier 检查 / 格式化仓库文件                                                              |
| `pnpm analyze`                        | 生成自定义元素清单                                                                          |
| `pnpm vscode-data`                    | 从清单生成 VS Code HTML 和 CSS 补全数据                                                     |
| `pnpm icons`                          | 输出当前 Codicon 图标示例                                                                   |
| `pnpm checksize`                      | 构建并报告单文件包的 gzip 字节数，支持 Windows                                              |
| `pnpm clean`                          | 删除生成产物                                                                                |

Vite 负责开发、生产构建和生产预览；不再使用 Wireit、Rollup 配置、Web Dev Server 或 Web Test Runner。组件库输出保留 `dist/main.js`、各组件入口、类型声明及 `dist/bundled.js`。模块构建将 Lit 等运行时依赖保留为外部导入，单文件构建包含运行时依赖。示例使用本地主题工具，提供暗色、亮色和两种高对比度主题。

本地项目可使用 `pnpm link` 链接组件库，链接前先执行 `pnpm build`。浏览器测试使用真实 Chromium，保留布局、表单关联、焦点、键盘和原生鼠标行为；测试辅助库只提供 Lit fixture 和 DOM 结构比较。

## 文档

功能说明位于 [docs](docs/)；开发要求参见 [AGENTS.md](AGENTS.md) 和 [CONTRIBUTING.md](CONTRIBUTING.md)。

### release

从干净的工作区运行 `pnpm release`。默认建议递增 `patch` 版本；可用 `pnpm release -- minor`、`pnpm release -- major` 或 `pnpm release -- 3.1.0` 指定其他版本。命令会提示确认最终的 `v` 前缀版本标签及发布操作。

发布新版本时，命令会更新 `package.json` 和组件版本（pnpm 锁文件不记录根包版本），根据上次发布以来的 Git 提交生成 `CHANGELOG.md` 条目，提交这些文件并创建标签。选择当前版本时仅创建或更新标签，保留现有变更日志。

确认推送后，分支和标签会推送到 `origin`，并自动启动 GitHub Actions 的 **Release** 工作流。该工作流构建、测试并将 `nusys-ui` 发布到 npmjs，随后使用 `CHANGELOG.md` 中的说明创建 GitHub 发布。请检查工作流是否完成；本地推送成功不代表 npm 发布已完成。

在仓库 Actions 中配置名为 `NPM_TOKEN` 的密钥，使其具有发布 `nusys-ui` 的权限，并可绕过无人值守发布的双因素认证。工作流通过 `actions/setup-node` 将其作为 `NODE_AUTH_TOKEN` 提供给 pnpm。GitHub 密钥仅在 Actions 中使用；本地命令需要 Git 推送权限，不需要 npm 令牌。包中的仓库地址必须与本仓库一致，以支持 npm 来源证明。

打标签的提交必须包含最新工作流。发布失败时，可手动运行 **Release**，并将 `version_tag` 设置为已有标签。已发布的 npm 版本会跳过；若包内容发生变化，应发布新版本。

## 文档与提交约定

本项目的文档相关文件与代码注释统一使用中文；命令、API 标识符、链接和工具指令保留原格式。所有后续提交必须遵循 Conventional Commits，提交描述与正文尽可能使用中文。详细要求参见 [AGENTS.md](AGENTS.md)。
