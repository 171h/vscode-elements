# 变更日志

本文件记录项目的重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)。

## 未发布

### 新增

- **fieldset**：支持动态禁用整个分区及启用框，保留勾选状态和参数值。
- **tab-header**：支持自定义 SVG、字体图标、图标位置及图文显示模式，图标随标题高度缩放。
- **context-menu**：菜单项身份或索引映射变化时清除旧高亮，等价数据更新仍保留选择。
- **tabs**：按缩放比例换算水平滚动距离，确保程序选中和键盘导航完整显示目标标题。
- **tabs**：标题插槽成员变化时重建菜单数据，确保隐藏标题插入或删除后索引正确。
- **tabs**：拖拽标题或视图创建新组时继承来源的溢出方式和换行对齐设置。
- **tabs**：提高滚动覆盖层的隐藏规则优先级，确保未溢出时不显示或拦截指针。
- **tabs**：菜单容量统一使用布局尺寸，避免 CSS 变换缩放导致隐藏标签不可访问。
- **tabs**：不再溢出或切换模式关闭菜单时恢复菜单内焦点，保留组件外的焦点。
- **tabs**：过滤面板内部内容变更，避免与标题无关的频繁重渲染和溢出测量。
- **tabs**：菜单选择事件后重新校验标题身份、连接与可聚焦状态，避免旧索引引发异常或聚焦无关项。
- **tabs**：溢出按钮失去可操作项时，在禁用前将其键盘焦点移回可见标签。
- **tabs**：隐藏项全部禁用时禁止打开菜单，并关闭已打开的空菜单、恢复可见焦点。
- **tabs**：菜单打开期间持续同步按钮位置及视口边界，关闭时停止定位跟踪。
- **tabs**：溢出菜单排除 `inert` 标题，并拒绝禁用或隐藏标题的过期选择。
- **tabs**：溢出隐藏仅禁用内部内容，保留调用方在隐藏期间更新的标题 `inert` 状态。
- **tabs**：溢出变化隐藏焦点标签时恢复可见标签的焦点与 Tab 入口，保留组件外的焦点。
- **tabs**：支持溢出菜单及所选隐藏标题的末位显示，保留原有索引。
- **tabs**：支持悬停显示的覆盖式水平滚动条及自动滚入所选标签。
- **tabs**：支持标题自适应换行以及左对齐、居中对齐，超长标题继续折行；完善溢出菜单的无障碍和焦点恢复。

### 文档

- **table**：表格示例增加容器宽度滑块，动态观察响应式布局与延迟列宽调整。

- **preview**：在右上角导航栏统一选择 Playground 主题与组件尺寸，保留预览操作状态并记住设置。
- **examples**：补充全部组件的功能场景与全局 Playground 主题；综合页按类别直接展示组件演示，移除工作台、折叠卡片和多余说明。

- **docs**：保留 VitePress 中文文档站点、全部公开组件的源码 API 与交互示例，文档构建和 CI 改用 pnpm。
- **dev**：`start` 默认启动文档站点；保留原有 HTML 示例，通过 `pnpm dev` 运行源码开发服务器。

### 构建

- **tooling**：使用 pnpm、Vite 和 Vitest 替换原包管理、构建和测试流程，移除 Wireit、独立 Rollup 配置与 Web Test Runner。保留 `@vscode-elements/webview-playground` 的环境模拟及原有 HTML 示例。开发者需使用新的 pnpm 命令，详见工具链迁移报告。

### 修复

- **fieldset**：修复 minimal 折叠后的启用框溢出、缩放容器内的标题与边框缺口定位，以及折叠内容变更时抢走可见标题焦点的问题。

- **fieldset**：顶部边框在复选框及标签区域真正断开，保留透明背景，并随标签尺寸更新缺口。
- **fieldset**：标题和复选框标签的共享背景默认为透明，不再回退到侧栏或编辑区颜色。
- **fieldset**：标题和复选框标签共用背景变量，移除内容聚焦时的分区外框；折叠期间使用 inert 隔离可交互内容并恢复焦点。
- **fieldset**：默认加粗标题，将复选框及标签与右上角边框和标题居中对齐，统一字号并使用常规字重及略淡的标签颜色。

- **tabs**：保留标题内按钮、链接、输入框及可编辑内容的原生键盘行为。
- **context-menu**：关闭及断开连接时清理外部点击监听器和延迟回调，修复溢出菜单程序关闭后无法重新打开的问题。

- **context-menu**：修复首次向上导航、空菜单及选项缩短后的键盘选择，确保溢出标签可通过键盘激活。

- **multi-select**：下拉全选跳过未选中的禁用项，保留原有选择，避免用户全选提交禁用选项。

- **multi-select**：选择、全选、清空、重置和选项更新时同步表单值与必填校验，修复下拉全选状态。

- **textfield**：选择文件后更新组件时保留原生文件列表，避免回写非空路径导致浏览器异常。

- **fieldset**：拖拽重连时保留取消默认处理后的状态，修复嵌套组件的禁用状态恢复。

- **fieldset**：未勾选时同步库表单控件的禁用状态，重新启用时恢复原有状态。
- **fieldset**：初始化、折叠及展开时保留调用方的 height、overflow 和 !important 优先级。

## [3.3.1] - 2026-09-26

### 维护

- **deps**: 将 @vscode/codicons 更新至 0.0.46-24 (198c6021)

## [3.3.0] - 2026-09-25

### 新增

- **vscode-form-container**: 使用浅蓝色背景，并按主题提供调色板 (6ac609aa)
- **vscode-form-container**: 使用浅绿色背景展示已修改状态动画 (ca7d96db)
- **vscode-form-container**: 表单内容修改后高亮显示 (e6bd81f6)

### 修复

- **vscode-form-container**: 根据审查反馈调整已修改状态 (398d6fd3)
- **vscode-form-container**: 根据审查反馈调整已修改状态 (72542475)
- **vscode-form-container**: 标记控件而非容器 (bdd5dcab)
- **vscode-form-container**: 在表单控件上显示已修改状态 (d2543a4a)

### 文档

- **vscode-form-container**: 说明下拉框遵循相同规则 (46fc96f0)
- **dev**: 在展示页中演示下拉框状态的三种结束方式 (3cdf261b)
- **dev**: 在统一展示页中添加下拉框选择状态 (e18a11cc)
- **vscode-form-container**: 说明下拉框展示区域的高亮行为 (5fd355a6)
- **dev**: 在已修改状态示例中添加下拉框选择状态 (e57e948d)
- **vscode-form-container**: 说明各主题中的状态颜色 (12617b28)
- **vscode-form-container**: 添加控件已修改状态文档 (e89870eb)
- **vscode-form-container**: 添加已修改状态文档 (2ae39d29)

### 测试

- **vscode-form-container**: 验证下拉框遵循相同状态规则 (1d1a1ff5)
- **vscode-form-container**: 覆盖下拉框状态 (b6ce4a47)
- **vscode-form-container**: 覆盖下拉框组合框模式的展示区域 (3386abb2)
- **vscode-form-container**: 覆盖四类主题颜色 (e945f6c3)
- **vscode-form-container**: 覆盖各表单控件的已修改状态 (44c343cb)
- **vscode-form-container**: 覆盖表单已修改状态 (c7cb4f88)

### 维护

- 回退“在已修改状态示例中添加下拉框选择状态”的文档修改 (e9708854)

## [3.2.0] - 2026-09-23

### 新增

- **vscode-textfield**: 添加百分比模式 (a227c24b)
- **vscode-multi-select**: 显示选中项缩写 (2be55224)
- **vscode-option**: 添加 abbreviation 属性 (d049473c)
- **vscode-multi-select**: 在展示区域显示选中标签 (f901951b)

### 修复

- **vscode-multi-select**: 保持能放入展示区域的标签可见 (a5922c8b)

### 文档

- **dev**: 添加百分比模式示例 (96be193e)
- **vscode-textfield**: 添加百分比模式文档 (1c98e65a)
- **dev**: 添加百分比模式示例 (ebfa3997)
- **vscode-textfield**: 添加百分比模式文档 (c7cfaf98)
- **dev**: 添加缩写与折叠标签示例 (cff3566f)
- **vscode-multi-select**: 添加展示标签与缩写文档 (00451bf0)
- **dev**: 添加多选框选中标签示例 (292b36f2)

## [3.1.1] - 2026-09-15

### 修复

- **dev**: 填充上下文菜单项 (71cc581a)
- 防止小型文本框垂直滚动 (c71a9d1c)

## [3.1.0] - 2026-09-07

### 新增

- **dev**: 添加统一组件展示页 (c9ee9a9d)

### 修复

- 根据尺寸审查反馈调整实现 (63fbfbef)
- 按表单控件尺寸缩放圆角 (48fe3d00)
- **dev**: 启用分割布局缩放与全局尺寸 (04e646f3)
- 使树项目随表单控件尺寸变化 (ea06131f)
- 使表格随表单控件尺寸变化 (4e86ccc2)
- 调整选择选项描述的尺寸 (e60a1343)
- 调整复选框指示器尺寸 (5375e4ac)
- 调整原生选择器文本框尺寸 (822887bb)
- 使文件文本框随表单控件尺寸变化 (c371dfc6)
- **dev**: 在展示页之外保留目录索引 (0f52d5f8)
- 使选项尺寸与控件一致 (0e3f46b8)
- **scrollable**: 避免滚轮操作时 ResizeObserver 的竞态 (fd2d589f)
- **dev**: 同步展示页尺寸与主题样式 (954e2327)

### 维护

- **dev**: 将统一展示页设为默认入口 (eabf5681)

## [3.0.1] - 2026-09-03

### 修复

- **release**: 使用 NPM_TOKEN 发布标签版本并校验变更日志 (3a083244)

## [3.0.0] - 2026-09-02

### 新增

- **release**: 添加本地 npm 发布流程 (b86abd25)
- 将小型表单控件高度设为 16px (13f6ee85)
- 为所有表单控件添加 size 属性 (50d01b56)
- 为 vscode-form-group 添加 size 属性（small/medium/large） (47d9dc24)

### 修复

- 保持小型文本框高度为 16px (194a47a5)
- **release**: 在 GitHub Actions 中发布标签版本 (4a2af716)
- **dev**: 一并调整标签示例中的控件尺寸 (7c2f8747)
- 将小型表单控件高度设为 16px (49b87a3f)
- 根据组件尺寸审查反馈调整实现 (60fa4886)
- **button**: 保持小型图标按钮为正方形 (a388f660)
- 使图标按钮响应 `size` 变化 (be07012a)
- 完善图标尺寸支持 (36c0ffb9)
- 将小型选择框的下拉图标居中 (1ace1707)

### 变更

- 移除 vscode-form-group 样式中多余的基础外边距 (b755d9f5)

### 文档

- 明确文档链接 (47c407fb)
- 说明表单控件尺寸 (6209382b)

### 测试

- 覆盖小型标签与单选按钮组高度 (fdc74a8f)

### 持续集成

- 改进交互式发布流程 (55e1cb83)
- 要求发布时提供版本标签 (df3704f0)

### 维护

- 将包重命名为 nusys-ui (5abfa9a9)
- 更新开发页面标题 (77cd45ab)
- 重新应用“错误发生前的修改” (a9e0be76)
- 回退“错误发生前的修改” (222038ac)
- 错误发生前的修改 (3ef5d3be)
- 将 concurrently 依赖更新至 v10 (b82f8fbe)
- 将 @web/dev-server-legacy 依赖更新至 v3 (a626304b)
- 将 @web/dev-server-rollup 依赖更新至 v1 (4a47e9aa)
- 将 @web/test-runner-playwright 依赖更新至 v1 (7776c32e)
- 将 @web/test-runner-mocha 依赖更新至 v1 (83ecb4be)
- 将 @web/dev-server 依赖更新至 v1 (27285b20)
- 更新一个目录中 npm_and_yarn 分组的 7 项依赖 (890ce8f3)
- 将 @web/dev-server-esbuild 依赖更新至 v2 (f9311936)
- 将 @web/test-runner 依赖更新至 v1 (88455792)
- 将 actions/checkout 更新至 v7 (d6dd4ad0)
- 更新一个目录中 npm_and_yarn 分组的 lodash (563ff1fc)
- 将 sinon 依赖更新至 v22 (82561603)
- **deps**: 将 @rollup/plugin-terser 依赖更新至 v1 (cd6f97bd)
- 将 npm-check-updates 依赖更新至 v22 (c6a937b1)
- 更新所有非主版本依赖 (93fd1f09)
- 修复 vscode-textfield 无效状态样式 (47940247)
- 使用 Prettier 修复格式 (b85cc023)
- vscode-radio-group：通过方向键选择时派发 change 事件 (cd1851a4)
- 移除多余空白 (23a7416a)
- 修复 vscode-radio，使用原生 radio 输入类型 (e47eacb4)
- **deps**: 更新所有非主版本依赖 (2086c414)

## [2.5.1] - 2026-02-21

- 修复 **SingleSelect** 的值未更新到表单数据的问题。
- 修复非浏览器环境中 `adoptedStyleSheets` 引发的错误。

## [2.5.0] - 2026-02-08

## 变更

- **Table**：重写列缩放算法，使列之间可以相互推动。
- **Button**、**SingleSelect**、**MultiSelect**、**Textfield**、**Textarea**：使用 4px 圆角。
- **SingleSelect**、**MultiSelect**：调整下拉样式以匹配 VS Code 界面。

## [2.4.0] - 2025-12-26

### 修复

- 修复导入路径，避免打包错误。
- 仅在组件确实移动时关闭下拉列表。
- 将 **Collapsible** 的默认 CSS display 设置为 `block`。

### 新增

- 为 **SplitLayout** 添加 `minStart` 和 `minEnd` 属性。
- 为 **Button** 添加 `block` 属性。
- 为 **TreeItem** 添加 `description`、`actions`、`decoration` 插槽。

### 变更

- 将 `@vscode/codicons` 声明为同级依赖，允许使用者选择自己的 Codicon 版本。

## [2.3.1] - 2025-09-14

### 修复

- 修复默认选中 **Radio** 的 `checked` 状态。
- 修复 **RadioGroup** 在 Shadow DOM 中的行为。
- 修复 **MultiSelect** 中选中项标签的显示问题。
- 修复 macOS 中使用 Meta 键选择 **Tree** 项目的问题。
- 修复表格主体阻止页面滚动的问题。
- 修复代码移除选项后读取 **SingleSelect** 或 **MultiSelect** 的 selectedIndex 抛出错误的问题。

## [2.3.0] - 2025-08-26

### 新增

- 添加 **ProgressBar** 组件。

### 修复

- 修复无数据行时缩放 **Table** 抛出错误的问题。

## [2.2.0] - 2025-08-19

### 新增

- 为 **Button** 添加 `base` CSS 部件。
- 为 **Button** 添加 `content-before` 和 `content-after` 插槽。
- 为 **Checkbox** 添加 `toggle` 属性。

## [2.1.0] - 2025-08-08

### 变更

- 使用
  [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 重写 **SingleSelect** 和 **MultiSelect** 的下拉逻辑，避免
  其他元素遮挡下拉列表或溢出部分被裁剪的问题，
  例如在 Collapsible 组件中的场景。
- 为 **Collapsible** 添加 `alwaysShowHeaderActions` 属性。

## [2.0.1] - 2025-08-05

### 修复

- 修复 **MultiSelect** 选项标签不可见的问题。

## [2.0.0] - 2025-08-03

### 破坏性变更

- 完全重写 **Tree**。主要变化是支持使用普通 HTML 标记描述树结构，替代原先复杂且固定的配置对象。
  详情参见[文档](https://vscode-elements.github.io/components/tree/)。
- 精简 `:host` 样式，减少 CSS 向组件内部泄漏。
- 移除已弃用的 API。

### 新增

- 为所有组件添加回退样式。
- 为 **Collapsible** 添加 `heading` 属性。

### 修复

- 改进 **Tabs** 的无障碍支持。
- 修复 **ButtonGroup** 焦点轮廓被裁剪的问题。
- 防止 **Scrollable** 不必要地显示阴影。

### 弃用

- 弃用 **Scrollable** 的 `title` 属性。

## [1.17.0] - 2025-07-02

### 新增

- 为 **Scrollable** 添加 `alwaysVisible`、`scrollSensitivity`、`fastScrollSensitivity` 和 `minThumbSize` 属性。
- **Scrollable** 现在派发 `vsc-scrollable-scroll` 事件。
- 为 **MultiSelect** 添加更美观的复选框。
- 为 **MultiSelect** 添加 `selectAll()` 和 `selectNone()` 方法。
- 为 **SingleSelect** 和 **MultiSelect** 添加随主题变化的滚动条。

### 变更

- **ButtonGroup** 现在可在 flex 容器中缩小。
- 改进 **SingleSelect** 和 **MultiSelect** 的无障碍支持。
- **MultiSelect**：选中数量徽章更紧凑。
- 为改善无障碍支持和可维护性，移除 **MultiSelect** 下拉框中的“全选”“全不选”和“接受”按钮。

### 修复

- **Label** 现在可关联 **SingleSelect** 和 **MultiSelect**。

## [1.16.1] - 2025-05-22

### 修复

- 恢复 **Button** 原有焦点样式，因为 VS Code 使用 `:focus` 而非 `focus-active`。

## [1.16.0] - 2025-05-17

### 新增

- 为 **SplitLayout** 添加回退样式。
- 添加 **ButtonGroup** 组件。

### 变更

- **Button** 仅在通过键盘聚焦时显示焦点轮廓，与 VS Code 界面行为一致。

## [1.15.0] - 2025-04-08

### 修复

- **Table**：修复表格缩放时可滚动区域的尺寸调整。
- **SingleSelect**、**MultiSelect**：`required` 特性变化时检查有效性。
- **SingleSelect**：修复组合框模式清空输入后不显示当前值的问题。
- 修复 **SingleSelect** 和 **MultiSelect** 中多项小问题。

### 新增

- 添加 **ToolbarButton** 组件。
- 为 **SingleSelect** 和 **MultiSelect** 添加 `creatable` 属性，允许用户在
  组合框模式中创建选项。

## [1.14.0] - 2025-03-06

### 修复

- **Button**：修复按钮边框样式。
- **SplitLayout**：`split` 属性设为原值时，
  不再重置手柄位置。

### 新增

- 为 **Textarea**、**Collapsible**、**Checkbox**、**Radio**、**SingleSelect**、
  **MultiSelect**、**ContextMenu**、**Icon**、**Divider**、**ProgressRing**、**Scrollable** 添加回退样式。
- 支持处理已注册自定义元素的多个版本。
  标签名已在 CustomElementRegistry 中注册时，避免浏览器报错，
  改为显示可关闭的警告。

## [1.13.1] - 2025-02-16

### 修复

- **Table**：**TableHeader** 和 **TableBody** 现在自动移动到对应插槽。

## [1.13.0] - 2025-02-16

### 修复

- **SingleSelect**、**MultiSelect**：阻止组合框模式中的浏览器建议。
- **SingleSelect**、**MultiSelect**：修复输入错误值时的报错。
- **Table**：修复样式特性（`bordered`、`bordered-columns`、`bordered-rows`、`zebra`、`zebra-odd`）无法用于 React 元素的问题。

### 新增

- **Badge**：添加 `tab-header-counter` 样式变体。
- 为 **Badge**、**Button** 和 **Textfield** 添加回退样式。
  即使 VS Code 主题变量缺失，这些组件也能正常显示，
  并使用默认主题 Dark Modern。

## [1.12.0] - 2025-02-06

### 修复

- 使所有组件遵循 CSP，包括 **Icon**、**Scrollable**、**TextArea**、**SplitLayout**、**Tree**、**Checkbox**、**Radio**、**FormHelper**。
- **TextField**：修复内部 input 值同步。
- **ContextMenu**：修复悬停样式和 Solarized Light 主题边框样式。

### 新增

- **Icon**：缺少 Codicon CSS 时在开发控制台显示警告。

## [1.11.0] - 2025-01-22

### 修复

- **Table**：修复从文档删除空组件时抛出错误的问题。
- **SingleSelect**、**MultiSelect**：修复默认展开时的选中状态。

### 新增

- **SingleSelect**、**MultiSelect**：支持通过修改子选项更新
  已初始化组件的状态。

## [1.10.0] - 2025-01-11

### 修复

- **Checkbox**：修复焦点状态边框颜色。

### 新增

- **SingleSelect**、**MultiSelect**：添加 `open` 属性。
- **Button**：按下回车或空格键时触发 `click` 事件。

## [1.9.1] - 2025-01-03

### 修复

- **Divider**：使组件颜色在所有主题中可见。
- **SingleSelect**：支持将选项值设为空。
- **SingleSelect**：未选中选项时默认选择第一项。

## [1.9.0] - 2024-11-26

### 新增

- 支持 Vue 中表单控件的双向绑定。
- **ContextMenu**：添加 `preventClose` 属性。

### 修复

- **ContextMenu**：修复 `show` 特性同步不正确的问题。

## [1.8.1] - 2024-11-17

### 修复

- **SplitLayout**：修复固定面板初始尺寸为零的问题。
- **SplitLayout**：修复在组件外释放鼠标按钮时未重置悬停状态的问题。

## [1.8.0] - 2024-11-08

### 新增

- **SplitLayout**：添加 `handlePosition` 属性，支持通过代码调整手柄位置。
- **SplitLayout**：添加 `fixedPane` 属性。父元素缩放时，面板按比例调整；
  该参数允许固定其中一个面板的尺寸，使其缩放时保持不变。
- **SplitLayout**：添加 `resetHandlePosition()` 方法，将手柄位置重置为默认值。
- **SplitLayout**：面板缩放时派发 `vsc-split-layout-change` 事件。

### 修复

- **SingleSelect**、**MultiSelect**：修复空控件高度。
- **MultiSelect**：修复 `selectedIndexes` 更新不正确的问题。
- **Tabs**：修复激活标签页高亮显示为未激活的问题。
- **SplitLayout**：方向变化时重新初始化面板。
- 使用完整导入路径以提高兼容性，参见 [#213](https://github.com/vscode-elements/elements/issues/213)。

## [1.7.1] - 2024-10-22

### 修复

- **Checkbox**：change 事件按原生复选框方式冒泡。
- **Checkbox**：修复 click 事件派发两次的问题。
- **SingleSelect**、**MultiSelect**：修复悬停时选项描述有时不可见的问题。
- **SingleSelect**、**MultiSelect**：修复触发校验时无法聚焦元素的错误。

## [1.7.0] - 2024-10-13

### 新增

- **Button**：支持修改图标动画参数。
- **Button**：对齐并排列通过主插槽添加的内容。
- **SingleSelect**、**MultiSelect**：支持控制下拉列表位置。
- **Collapsible**：添加 `body` CSS 部件。
- **Collapsible**：展开或关闭时派发切换事件。

### 修复

- **Textfield**：值变化时重新校验元素。
- **Checkbox**：`required` 或 `checked` 属性变化时重新校验。
- **Badge**：反射 `variant` 属性。

## [1.6.2] - 2024-10-07

### 修复

- **SingleSelect**：修复选择不存在的选项时抛出错误的问题。
- **SingleSelect**：首次用户交互前设置初始表单值。
- **SingleSelect**：修复以属性方式设置选项值时未登记的问题。
- **SingleSelect**：修复以属性方式设置选中状态时未登记的问题。

## [1.6.1] - 2024-09-22

### 修复

- **Table**：修复 #161。

## [1.6.0] - 2024-09-20

### 新增

- 添加 **Divider** 组件。
- 添加 **ProgressRing** 组件。

## [1.5.0] - 2024-09-12

- **SingleSelect**、**MultiSelect**：组合框模式过滤列表时高亮匹配内容。

## [1.4.0] - 2024-09-10

### 新增

- **SingleSelect**、**MultiSelect**：点击输入框时显示下拉列表。
- **SingleSelect**、**MultiSelect**：组合框模式将焦点委派给内部 input。

### 修复

- **SingleSelect**、**MultiSelect**：修复禁用模式下仍可选择的问题。

## [1.3.1] - 2024-09-01

- 将 codicons 升级至 0.0.36。

## [1.3.0] - 2024-05-13

- **Tree**：为项目配置添加 tooltip 属性。

## [1.2.0] - 2024-02-20

### 新增

- **Tree**：添加可自定义的 [CSS 部件](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)区域。

## [1.1.0] - 2024-02-11

### 新增

- **Tree**：添加 `deselectAll()` 和 `getItemByPath()` 工具方法。

## [1.0.1] - 2024-01-05

### 修复

- **Tree**：修复 `vsc-tree-select` 事件的载荷为空的问题。

## [1.0.0] - 2024-01-04

### 新增

- 表单控件完整参与标准 HTML 表单，受影响的组件包括：
  **Button**、**Single Select**、**Multi Select**、**Textfield**、**Textarea**、**Radio**、**Checkbox**。
- 将自定义事件导出为 TypeScript 类型，示例参见 [react-example](https://github.com/vscode-elements/react-example/blob/c481f9fcdecdb5377ca1955b28f506bff70d1f8b/src/Demo.tsx#L11) 仓库。
- **SplitLayout**：添加手柄尺寸属性。

### 修复

- 修复组件连接 DOM 时 **Select** 未登记选项值的问题。

### 变更

- **Input** 的 `name` 属性像原生文本框一样反射。
- **Textarea**、**Textfield**：将 `minlength`、`maxlength` 属性重命名为 `minLength`、`maxLength`，
  以遵循原生 `<textarea>` 的命名约定。
  HTML 特性名称保持不变。
- **Textarea**、**Textfield**：派发原生 `input` 和 `change` 事件。
- **Radio**、**Checkbox**、**SingleSelect**、**MultiSelect**：派发原生 `change` 事件。
- **Collapsible**：通过默认插槽显示主内容，替代命名 `body` 插槽。
- **Split Layout**：将 `initial-pos` 重命名为 `initial-handle-position`。
- **ContextMenu**：将 `vsc-select` 事件重命名为 `vsc-context-menu-select`。
- **Tabs**：将 `vsc-select` 事件重命名为 `vsc-tabs-select`。
- **Tree**：将 `vsc-run-action` 事件重命名为 `vsc-tree-action`。
- **Tree**：将 `vsc-select` 事件重命名为 `vsc-tree-select`。
- 将 Lit 更新至 3.x。

### 弃用

- **Textarea**、**Textfield**：弃用 `vsc-input` 和 `vsc-change` 事件。
- **Button**：弃用 `vsc-click` 事件。
- **Checkbox**：弃用 `vsc-change` 事件。
- **ContextMenu**：弃用 `vsc-select`。
- **FormContainer**：弃用 `data` 属性。
- **MultiSelect**、**SingleSelect**：弃用 `vsc-change` 事件。

### 移除

- 移除已弃用组件：**Inputbox**、**FormContainer**、**FormControl**、
  **FormDescription**、**FormItem**、**FormLabel**。

## [0.17.0] - 2023-10-15

### 新增

- 在仓库中添加 [React 演示应用](examples/react-app)。
- 为 **Textarea** 和 **Textfield** 添加 `autofocus` 特性。
- 所有布尔属性均反射到 HTML 特性，详情参见 [Open Web Components](https://open-wc.org/guides/knowledge/attributes-and-properties/#attribute-and-property-reflection) 文档。

## [0.16.0] - 2023-09-07

### 新增

- 为 **Checkbox** 添加 `indeterminate` 特性。

## [0.15.0] - 2023-08-03

### 新增

- 为 **SingleSelect** 和 **MultiSelect** 添加 `invalid` 布尔属性与特性。

## [0.14.0] - 2023-06-17

### 新增

- 为 **Collapsible** 标题添加 `decorations` 插槽，即使组件折叠，
  装饰内容也始终可见。
- 为 **Collapsible** 添加 `description` 属性。
- 为 **Tree** 添加可选缩进参考线。
- 为 **Tree** 项目添加 `description` 属性。
- 为树项目数据添加 `iconUrls` 属性，以设置 **Tree** 自定义图标。
- 添加 **Tree** 操作，示例参见[文档](https://bendera.github.io/vscode-webview-elements/components/vscode-tree/#actions)。
- 添加 **Tree** 装饰，示例参见[文档](https://bendera.github.io/vscode-webview-elements/components/vscode-tree/#decorations)。

### 变更

- **Tree** 项目配置的 `icons` 也可为布尔值。为 true 时，
  显示默认主题图标：叶子项使用 `file`，分支项使用 `folder`，
  展开分支使用 `folder-opened`。图标参考参见 [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html)
  项目；为 false 时不显示图标。
- **Tree**：优化配色，使其更接近 VS Code 风格。

### 修复

- **Scrollable** 滚动时禁用交互元素。
- 优化 **Tree** 选中项焦点边框颜色。

## [0.13.2] - 2023-05-26

### 修复

- 防止 **Select** 描述中的长文本溢出，修复 #61。

## [0.13.1] - 2023-05-13

### 修复

- 修复 **RadioGroup** 中单选按钮表现为复选框的问题，修复 #59。

## [0.13.0] - 2023-04-16

### 新增

VS Code 可能重命名或移除主题变量，导致组件外观出现
不可预测的变化。为避免此情况，为各组件添加回退样式，
即使主题变量不可用，组件仍能正常显示。

### 变更

- 更新 **Button** 和 **ContextMenu** 样式，跟随 VS Code 变化。
- **Table** 的标题背景和着色行背景支持自定义，替代固定颜色。

## [0.12.0] - 2023-03-17

### 变更

- **Textarea**：默认 display 为 `inline-block`，默认尺寸为 320 × 40；
  设置 `rows` 或 `cols` 特性时自动调整尺寸。
- **Textarea**：进一步匹配 VS Code 源代码管理输入框样式：
  - 鼠标位于滚动条上时显示手形光标。
  - 文本滚动时添加轻微阴影。
  - 为滚动条添加激活状态。
- **Textarea**：修复滚动条可见时缩放手柄外观不佳的问题。
- **Textfield**：自定义文件输入按钮样式。

## [0.11.0] - 2023-03-15

### 变更

- 由 [@chrjorgensen](https://github.com/chrjorgensen) 为 **Textarea** 添加 `cols` 和 `rows` 特性。

### 修复

- 为 **Textfield** 设置默认颜色。

## [0.10.3] - 2023-03-13

### 修复

- 修复 **FormContainer** 表单数据未收集 Textfield 和 Textarea 值的问题。
- 修复 **Textfield** 和 **Textarea** 的 `value` 未与内部表单控件值正确同步的问题。
- 修复 **FormGroup** 的 `variant` 为 "settings-group" 时 **Textfield** 和 **Textarea** 的上外边距。

## [0.10.2] - 2023-03-12

### 变更

- **Textfield** 支持 file 类型。

## [0.10.1] - 2023-02-20

### 修复

- 修复 **Label** 显示星号时的空白问题。

## [0.10.0] - 2023-02-20

### 新增

- **Label** 添加 `required` 特性。

### 变更

- **SingleSelect**、**MultiSelect**：微调 CSS，更接近 VS Code 样式。

## [0.9.0] - 2023-02-14

### 变更

- 为 ContextMenu 和 InputBox 适配最新 VS Code 设计。

## [0.8.1] - 2022-12-22

### 修复

- 修复标签面板内文本输入框无法编辑的问题。

## [0.8.0] - 2022-11-10

### 破坏性变更

- 统一 HTML 特性命名，全部使用 kebab-case 格式。
- Tabs 的 `selectedIndex` 特性重命名为 `selected-index`。
- Button 的 `iconAfter` 特性重命名为 `icon-after`。
- 移除 MultiSelect 的 `selectedIndexes` 特性，仍可作为属性访问。
- Scrollable 的 `scrollPos` 特性重命名为 `scroll-pos`。
- Scrollable 的 `scrollMax` 特性重命名为 `scroll-max`。
- SingleSelect 的 `selectedIndex` 特性重命名为 `selected-index`。
- SplitLayout 的 `resetOnDblClick` 特性重命名为 `reset-on-dbl-click`。
- TableCell 的 `columnLabel` 特性重命名为 `column-label`。
- 调整 Tabs 组件标记结构，示例参见文档页面。

### 弃用

- 弃用 Inputbox，请使用 Textarea 或 Textfield。

### 新增

- 添加 Textfield 和 Textarea 组件。

### 变更

- 将 Lit 升级至 2.4.x。
- 为 ContextMenu 添加键盘导航。
- 适配最新 VS Code 按钮圆角样式。
- 为单选按钮添加 `aria-checked` 特性。
- 改进 Icon 组件无障碍支持。
- Tabs 组件完整支持无障碍访问。
- Radio 和 Checkbox 支持无障碍访问。
- 添加 TabHeader 和 TabPanel，与 Tabs 协同使用。
- 为 Tabs 工具栏添加 `addons` 插槽。
- 为标签页标题添加 `content-before` 和 `content-after` 插槽。
- Label 自动为单选按钮、复选框和文本输入框设置标签。

### 修复

- 修复 ContextMenu 激活状态问题。
- 修复 Select 高度。

## [0.7.1] - 2022-11-03

### 修复

- **Tabs**：点击标签标题中的插槽元素时选中标签页，修复 [#32](https://github.com/bendera/vscode-webview-elements/issues/32)。

## [0.7.0] - 2022-03-15

### 新增

- 为 Scrollable 添加 scrollPos 和 scrollMax 属性。
- Select：支持禁用单个选项，感谢 [ununian](https://github.com/ununian)。

### 修复

- Button：固定宽度按钮的文字居中。
- Select：移除值中的多余空白。
- Select：支持通过 CSS 属性设置下拉列表 z-index，修复重叠问题。
- Select：支持通过属性设置多选值。
- Scrollable：修复相对或绝对定位内容遮挡滚动条的问题。
- Scrollable：内容高度变化时调整滚动条尺寸。

## [0.6.3] - 2021-08-26

### 修复

- 修复标签未关联 Shadow DOM 内输入控件的问题。

### 新增

- 为 "name" 特性添加 `@attr` JSDoc 标签，防止支持的 IDE 报告未知特性警告。

## [0.6.2] - 2021-08-04

### 修复

- Tree：修复聚焦列表项的轮廓偏移。

## [0.6.1] - 2021-07-25

### 修复

- 更新图标颜色以匹配 VS Code。

## [0.6.0] - 2021-07-25

### 新增

- Icon：
  - 添加合适的主题变量。
  - 添加操作图标按下样式。
  - 添加焦点边框样式。
- Collapsible：
  - 支持键盘操作。
  - 图标可见性跟随 VS Code 行为：面板展开时可见。
- Table：添加响应式模式。
- SplitLayout：添加悬停颜色。

## [0.5.2] - 2021-07-24

### 修复

- Inputbox：微调类型定义。

## [0.5.1] - 2021-07-24

### 修复

- 支持弹性表格列。
- 微调 Inputbox 文档，改善代码补全。

## [0.5.0] - 2021-07-19

### 新增

- 添加 Table 组件。
- 为 Icon 添加 action-icon 模式。

### 变更

- Scrollable 使用浮动滚动条。

## [0.4.0] - 2021-07-15

### 新增

- 添加 FormContainer、FormGroup、FromHelper、Label、Radio、RadioGrop、CheckboxGroup 组件。

### 修复

- 重新调整 Tree、SingleSelect 和 MultiSelect 的主题变量名。
- 恢复 Button 轮廓样式。

### 弃用

- 后续将移除 FormControl、FormDescription、FormItem、FormLabel，请改用新的表单组件。

## [0.3.1] - 2021-06-12

### 修复

- 修复 #16：SingleSelect 未随 value 和 selectedIndex 更新。

## [0.3.0] - 2021-05-10

### 新增

- 为 Tree 添加键盘导航。

### 变更

- 简化 SingleSelect 和 MultiSelect 的导入路径。

## [0.3.0] - 2021-05-11

### 新增

- 为 SingleSelect 和 MultiSelect 添加组合框模式。
- 为 InputBox 添加 min、minlength、max、maxlength、multiple、
  readonly、step 特性。
- 引入变更日志。

### 变更

- 将 Select 拆分为 SingleSelect 和
  MultiSelect 两个组件。

### 修复

- 修复多行 Inputbox 的尺寸调整行为。
- 修复选项悬停颜色。
