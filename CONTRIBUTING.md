# 贡献指南

感谢参与 VSCode Elements 的开发。

即使暂时不准备提交代码，也可以通过修正文档中的错别字、语法错误或不清晰的说明参与贡献。

如果还不熟悉代码，建议从带有 [“good first issue”](https://github.com/171h/vscode-elements/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) 标签的任务开始。这些任务相对简单，也对项目有帮助。

决定处理某个问题时，请在问题页面说明，避免重复工作。

## 提交缺陷报告

请尽量提供[最小可复现示例](https://stackoverflow.com/help/minimal-reproducible-example)。可提供能通过少量命令启动的示例仓库。

也可参考 [组件文档](docs/components/index.md) 与 `docs/data/examples.mjs` 中的示例，整理可独立运行的 HTML 并附在问题报告中。使用 `pnpm install --frozen-lockfile` 安装依赖，通过 `pnpm dev` 启动文档站点。

面向使用者的示例统一维护在 `docs/data/examples.mjs`、`docs/data/scenarios.mjs` 与组件文档中，执行 `pnpm docs:dev` 预览，详细文档流程参见 [文档维护](docs/guide/contributing.md)。文档或示例修改应执行 `pnpm docs:check`、`pnpm docs:test`，并验证明暗主题、键盘、焦点与禁用状态。

## 提交拉取请求

提交前请确保代码遵循项目风格且格式正确，可使用 README 中介绍的 lint 和 Prettier 脚本。行为变化应添加有意义的回归测试；面向用户的功能变化应更新变更日志。

文档相关文件、代码注释、JSDoc 描述及 HTML/CSS 注释统一使用中文。API 名称、文件路径、命令、链接及工具指令保留原格式。

所有后续提交必须遵循 Conventional Commits，描述与正文尽可能以中文为主，类型和作用域保留标准形式，例如 `fix(textfield): 修复百分比模式的数值校验`。格式、类型和破坏性变更示例参见 [AGENTS.md](AGENTS.md#提交信息规范)。提交信息也尽量遵循 [50/72 风格](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)。

## 发布版本

在本地使用 `pnpm release` 创建发布。发布助手会询问版本标签，默认建议补丁版本。可传入 `minor`、`major` 或明确版本，例如 `pnpm release -- minor`，最终标签仍需交互确认。

发布助手要求 Git 工作区干净。它根据最新发布后的提交预览并更新 `CHANGELOG.md`，同步 `package.json` （pnpm 锁文件不记录根包版本），并创建发布提交及附注标签。将标签推送到 `origin` 后会自动启动 GitHub **Release** 工作流；重试时可选择 **Run workflow**，并填写已有版本标签，例如 `v2.6.0`。工作流检出该标签，执行验证并将包发布到 npmjs。npm 发布凭据仅用于 GitHub Actions，本地命令不会直接发布包。

若请求的标签已存在于本地或 `origin`，助手会说明其位置，并在替换前询问。远程标签替换使用 force-with-lease 检查，防止覆盖确认后被其他人修改的标签。分支与标签原子推送，避免远程仅更新其中一项。

在确认发布前取消，不会修改文件；拒绝最终推送时，发布提交与标签保留在本地，命令会输出稍后推送的方法。选择当前包版本时，仅重新创建或移动其标签，不重复添加变更日志或发布提交。
