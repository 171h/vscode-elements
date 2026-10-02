import {defineConfig} from 'vitepress';
import {components, groups} from '../data/components.mjs';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Nusys UI',
  description: '面向 VS Code Webview 的中文 Web Components 组件库文档',
  base: process.env.DOCS_BASE || '/',
  lastUpdated: true,
  cleanUrls: true,
  vite: {
    vue: {
      template: {
        compilerOptions: {isCustomElement: (tag) => tag.startsWith('vscode-')},
      },
    },
  },
  themeConfig: {
    siteTitle: 'Nusys UI',
    nav: [
      {text: '指南', link: '/guide/getting-started'},
      {text: '组件', link: '/components/'},
      {text: 'API', link: '/api/'},
      {text: '常见问题', link: '/guide/faq'},
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          {text: '快速开始', link: '/guide/getting-started'},
          {text: '表单与校验', link: '/guide/forms'},
          {text: '主题与图标', link: '/guide/theming'},
          {text: 'Webview 与 CSP', link: '/guide/webview'},
          {text: 'Vue 与 React', link: '/guide/frameworks'},
          {text: '从上游迁移', link: '/guide/migration'},
          {text: '常见问题', link: '/guide/faq'},
        ],
      },
      ...groups.map((group) => ({
        text: group,
        collapsed: true,
        items: components
          .filter((c) => c.group === group)
          .map((c) => ({text: c.title, link: `/components/${c.id}`})),
      })),
      {
        text: '扩展功能',
        collapsed: true,
        items: [
          {text: '统一尺寸', link: '/form-size'},
          {text: '百分比输入', link: '/textfield-percentage'},
          {text: '多选标签', link: '/multi-select-labels'},
          {text: '表单已修改状态', link: '/form-dirty-highlight'},
          {text: '分区复选框', link: '/fieldset-checkbox'},
          {text: '标签页与视图拖拽', link: '/tabs-drag-drop'},
          {text: 'CSP 检查模板', link: '/examples/csp'},
        ],
      },
      {
        text: '参考与维护',
        items: [
          {text: 'API 索引', link: '/api/'},
          {text: '文档维护', link: '/guide/contributing'},
        ],
      },
    ],
    outline: {label: '本页内容', level: [2, 3]},
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {buttonText: '搜索文档', buttonAriaLabel: '搜索文档'},
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除搜索',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    docFooter: {prev: '上一页', next: '下一页'},
    lastUpdated: {text: '最后更新'},
    socialLinks: [
      {icon: 'github', link: 'https://github.com/171h/vscode-elements'},
    ],
    footer: {
      message: '基于 VSCode Elements · MIT 许可证',
      copyright: 'Nusys UI 中文文档',
    },
  },
});
