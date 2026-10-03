# Vite、pnpm 与 Vitest 工具链迁移

项目使用 Vite 8.3.2、pnpm 12.8.1、Vitest 5.0.3。运行环境为 Node.js 22.12+（22.x）、24.x 或 26+，推荐 Node.js 24。

## 构建与开发

- `pnpm dev` 直接编译 `src/`，示例页无需预先生成 `dist/`。
- `pnpm start` / `pnpm docs:dev` 沿用主分支的文档入口，构建组件、生成 API 后启动 VitePress。文档完整性和交互通过 `pnpm docs:check` / `pnpm docs:test` 验证。
- `pnpm build` 生成 ES 模块、类型声明、单文件包、组件清单和 VS Code 补全数据。
- `pnpm build:demo` 构建所有 HTML 示例，`pnpm preview` 预览生产页面。
- `pnpm test` 通过 Vitest 执行真实 Chromium 组件测试与 Node.js 发布工具测试。
- `pnpm test:build` 自动检查开发和生产环境，包括 playground 的十种主题、全局环境控制、尺寸、禁用状态、键盘焦点、CSP、原生拖拽和单文件包注册。

已移除 Wireit、独立 Rollup 配置及插件、Web Dev Server、Web Test Runner、Mocha 和 npm 锁文件。保留 `@vscode-elements/webview-playground` 作为开发依赖，用于模拟 VS Code 环境；它不属于旧构建工具。TypeScript 保留用于类型检查与声明生成，组件元数据仍由专用分析器生成。`build:ts`、`build:watch`、`serve`、`wtr:watch` 等旧脚本已删除；使用新命令开发和验证。

开发 HTML 恢复迁移前提交 `2fd1fd01` 的示例内容，仅调整源码入口、历史预览资源入口和开发服务器 CSP。三个历史表格示例的 `component-preview` 标签通过 playground 的 `VscodeDemo` 类提供环境模拟，保留原示例标签与内容。Vite 将 playground 的动态主题模块构建为生产资源，无需手动复制主题文件。

测试保留 Lit fixture 与 Sinon；DOM 比较、无障碍断言和原生输入由本地 Vitest matcher、axe-core 和 Playwright 提供。新增依赖必须明确声明，不能依赖 npm 的偶然提升。浏览器通过 `pnpm test:install` 单独安装。pnpm 的 `allowBuilds` 仅允许所需的 `rs-module-lexer` 和文档框架所需的 `esbuild` 安装脚本。

主分支合入的 VitePress 文档站点保留其最新稳定版 1.6.4 与 Vue；该框架内部依赖 Vite 5，不强行覆盖为其未声明支持的 Vite 8。组件库构建、历史示例开发和生产构建仍直接使用 Vite 8.3.2，文档通过生成的当前库 bundle 展示组件。

## 验证结果

在 Windows、Node.js 24.21.0、Playwright 1.63.0 与 Chromium 153 环境验证：

- 合入 `main` 提交 `cb104b40` 后，完整 Vitest 测试：750 个通过、2 个跳过、23 个待实现，0 个失败。跳过和待实现用例来自现有测试。
- 上一轮迁移的 V8 覆盖率：行 88.46%、语句 88.32%、函数 88.45%、分支 75.95%；本次整合未重新测量覆盖率。
- 库构建、全部生产示例构建、类型检查、ESLint、Prettier、发布工具测试通过。
- 开发与生产环境的主题、尺寸、输入、键盘焦点、CSP、原生鼠标拖拽与状态保留检查通过。
- 单文件产物注册清单中的 40 个组件，脱离 Vite 转换后仍可正常加载。

首次迁移时读取提交 `2fd1fd01` 的构建配置与锁定工具版本，在隔离目录使用相同组件源码生成旧构建对照产物。相同 Chromium 中交替测量 7 次，历史结果如下，本次整合未重新测量加载和渲染时间：

| 指标                      |  旧构建 | Vite 构建 |
| ------------------------- | ------: | --------: |
| 单文件字节数              | 281,120 |   279,192 |
| gzip 字节数（级别 9）     |  63,632 |    63,791 |
| 加载中位数                | 11.5 ms |   11.8 ms |
| 渲染 1,000 个文本框中位数 | 32.7 ms |   31.5 ms |

两种产物的公共导出与文本框值一致。gzip 差异为 159 字节（约 0.25%）。时间是本机有限样本，受缓存和系统负载影响，不能作为跨机器性能保证。单文件构建显式启用 Vite 内置完整压缩；模块产物保留使用方优化所需代码。

本次保留主分支的综合体验页、全站主题与尺寸控制、表格容器宽度调节、多选框提交与禁用项修复、文件输入框修复，以及标签页换行、滚动、溢出菜单、标题图标布局及其焦点修复。新增文件输入逻辑使用 Lit 的 `live` 指令，Vitest 提前优化该入口，避免首次测试时重新优化并重载浏览器页面。新增标签页测试复用现有 Lit 测试辅助依赖，保留更新等待与条件轮询；无障碍断言使用 Vitest matcher。最新组件包 gzip 为 67,704 字节，增加的体积包含主分支新增功能。

本地 `pnpm pack` 成功，安装包包含组件模块、声明、单文件产物和元数据，不包含测试、测试辅助代码、开发示例或旧工具配置。

PR 审查补充了三个原生输入回归用例，修复 iframe 焦点恢复、用例之间的按键与指针状态泄漏，并将 fieldset 动画断言改为等待真实动画结束。完整测试在默认并行和串行模式下均通过。

模块构建仅外置已声明的运行时和 peer 依赖，Vite/Oxc 生成的装饰器辅助代码随包输出。`pnpm test:build` 检查所有模块的静态导入，拒绝缺失文件和未声明依赖。另在隔离目录仅安装打包后的 `nusys-ui` 与生产依赖，验证使用方的 Vite 生产构建、组件注册和原生输入通过。

组件清单生成与模块构建采用一致的测试排除规则，测试桥接 API 不进入发布元数据；构建验证同时检查清单不包含测试工具和测试用例。

CI 使用 pnpm 冻结锁文件安装，在 Windows、Linux 与 macOS 验证构建、类型、格式、浏览器测试及生产示例。PR 审查中的键盘与动画修复已通过三平台远程 CI（提交 `dd6e525a`，[验证记录](https://github.com/171h/vscode-elements/actions/runs/37010406839)）；最新提交的验证状态参见 [PR #15](https://github.com/171h/vscode-elements/pull/15)。本地验证使用 Windows，未运行发布助手或发布包。
