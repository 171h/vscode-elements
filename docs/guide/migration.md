# 从上游迁移

本站以 [上游文档源码](https://github.com/vscode-elements/vscode-elements.github.io) 的指南、组件示例和 API 分类为参考，使用 VitePress 重建。布局参考 [Nuxt UI](https://ui.nuxt.com) 的顶部导航、分组侧栏、正文与页内目录；未引入上游的 Astro 运行时、统计脚本或其远程 API 数据。

## 包与标签

```js
// 本项目的主入口
import 'nusys-ui';
// 按需导入
import 'nusys-ui/dist/vscode-button/index.js';
```

组件标签继续使用 `vscode-`。移除上游包的导入，避免同名 Custom Elements 重复注册。旧文档里的事件类型名或深层导入路径应以本项目 `index.ts` 导出与 API 为准。

## 新增与调整的行为

| 领域                       | 本项目文档                              |
| -------------------------- | --------------------------------------- |
| 表单、树、表格与图标尺寸   | [统一尺寸](../form-size)                |
| 百分比显示及小数值校验     | [百分比输入](../textfield-percentage)   |
| 多选缩写、折叠与提示       | [多选标签](../multi-select-labels)      |
| 表单交互高亮               | [已修改状态](../form-dirty-highlight)   |
| 可选分区与嵌套禁用恢复     | [fieldset 复选框](../fieldset-checkbox) |
| 标签页、视图和标签页组移动 | [拖拽布局](../tabs-drag-drop)           |

这是一份使用层面的迁移清单，不能代替逐个组件的兼容性检查。特别是百分比值的单位、事件冒泡与表单提交结构，应以本项目当前实现为准。

## 开发示例的迁移

原 `dev` 的组件展示、主题切换、尺寸、表单、百分比、选择框、树和拖拽示例已整合进组件页与专题页。重复页面、旧版本问题复现和依赖 `/node_modules` 的独立页面移除。CSP 模板迁入 `docs/public/examples/`；交互验证脚本改为检查文档示例。
