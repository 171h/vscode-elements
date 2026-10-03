export const examples = {
  badge: {
    height: 120,
    title: '徽章与计数',
    html: '<vscode-badge>进行中</vscode-badge> <vscode-badge variant="counter">12</vscode-badge> <vscode-badge variant="activity-bar-counter">3</vscode-badge>',
  },
  button: {
    height: 150,
    title: '按钮状态与图标',
    html: '<vscode-button icon="save">保存</vscode-button> <vscode-button secondary>取消</vscode-button> <vscode-button disabled>已禁用</vscode-button> <vscode-button icon="refresh" aria-label="刷新"></vscode-button>',
  },
  'button-group': {
    height: 150,
    title: '组合按钮',
    html: '<vscode-button-group><vscode-button>运行</vscode-button><vscode-button icon="chevron-down" aria-label="更多运行操作"></vscode-button></vscode-button-group>',
  },
  icon: {
    height: 160,
    title: '图标与操作',
    html: '<vscode-icon name="files"></vscode-icon> <vscode-icon name="sync" spin></vscode-icon> <vscode-icon name="refresh" action-icon label="刷新"></vscode-icon><output aria-live="polite"></output>',
    js: "document.querySelector('[action-icon]').addEventListener('vsc-click', () => { document.querySelector('output').textContent = '已刷新'; });",
  },
  divider: {
    height: 200,
    title: '内容分隔',
    html: '<p>文件操作</p><vscode-divider></vscode-divider><p>项目设置</p>',
  },
  'progress-bar': {
    height: 200,
    title: '确定与不确定进度',
    html: '<vscode-progress-bar value="45" max="100" aria-label="下载进度"></vscode-progress-bar><p>下载进度：45%</p><vscode-progress-bar indeterminate aria-label="正在处理"></vscode-progress-bar>',
  },
  'progress-ring': {
    height: 120,
    title: '处理中',
    html: '<vscode-progress-ring aria-label="正在加载"></vscode-progress-ring><span>正在加载项目…</span>',
  },
  textfield: {
    title: '输入、禁用与校验',
    html: '<vscode-label for="name">项目名称</vscode-label><vscode-textfield id="name" name="name" placeholder="请输入项目名称" required></vscode-textfield><vscode-textfield aria-label="禁用示例" value="不可编辑" disabled></vscode-textfield><vscode-button id="validate" secondary>检查有效性</vscode-button><output aria-live="polite"></output>',
    js: "document.querySelector('#validate').addEventListener('click', () => { document.querySelector('output').textContent = document.querySelector('#name').reportValidity() ? '校验通过' : '请填写项目名称'; });",
  },
  percentage: {
    title: '百分比与程序值',
    html: '<form><vscode-label for="rate">折扣</vscode-label><vscode-textfield id="rate" name="rate" percentage value="0.125" min="0" max="1" step="0.025" required></vscode-textfield><vscode-button type="submit">读取表单</vscode-button></form><output aria-live="polite">程序值：0.125</output>',
    js: "const field = document.querySelector('#rate'); const output = document.querySelector('output'); field.addEventListener('input', () => { output.textContent = '程序值：' + field.value; }); document.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); output.textContent = '提交值：' + new FormData(event.target).get('rate'); });",
  },
  textarea: {
    height: 240,
    title: '多行文字',
    html: '<vscode-label for="description">项目说明</vscode-label><vscode-textarea id="description" name="description" rows="4" maxlength="140" placeholder="最多 140 个字符"></vscode-textarea>',
  },
  checkbox: {
    height: 140,
    title: '复选框状态',
    html: '<vscode-checkbox label="自动保存" checked></vscode-checkbox><vscode-checkbox label="启动时恢复项目"></vscode-checkbox><vscode-checkbox label="已禁用" disabled></vscode-checkbox>',
  },
  'checkbox-group': {
    height: 180,
    title: '复选框组',
    html: '<vscode-checkbox-group variant="vertical" aria-label="导出格式"><vscode-checkbox label="HTML" name="format" value="html" checked></vscode-checkbox><vscode-checkbox label="Markdown" name="format" value="md"></vscode-checkbox></vscode-checkbox-group>',
  },
  'radio-group': {
    height: 140,
    title: '单选与键盘切换',
    html: '<vscode-radio-group aria-label="保存方式"><vscode-radio name="save-mode" value="auto" label="自动" checked></vscode-radio><vscode-radio name="save-mode" value="manual" label="手动"></vscode-radio></vscode-radio-group>',
  },
  'single-select': {
    title: '下拉选择',
    html: '<vscode-label for="language">语言</vscode-label><vscode-single-select id="language" name="language"><vscode-option value="ts" description="类型安全" selected>TypeScript</vscode-option><vscode-option value="js">JavaScript</vscode-option><vscode-option value="legacy" disabled>旧版语言</vscode-option></vscode-single-select><output aria-live="polite">当前值：ts</output>',
    js: "const select = document.querySelector('#language'); select.addEventListener('change', () => { document.querySelector('output').textContent = '当前值：' + select.value; });",
  },
  combobox: {
    title: '组合框过滤与创建',
    html: '<vscode-single-select combobox creatable aria-label="项目类型"><vscode-option value="extension">扩展</vscode-option><vscode-option value="webview">Webview</vscode-option><vscode-option value="library">组件库</vscode-option></vscode-single-select><output aria-live="polite"></output>',
    js: "const select = document.querySelector('vscode-single-select'); select.addEventListener('change', () => { document.querySelector('output').textContent = '选中值：' + select.value; });",
  },
  'multi-select': {
    title: '缩写、标签与多选值',
    html: '<vscode-label for="formats">导出格式</vscode-label><vscode-multi-select id="formats" name="formats"><vscode-option value="html" abbreviation="HTML" selected>超文本标记语言</vscode-option><vscode-option value="markdown" abbreviation="MD" selected>Markdown 文档</vscode-option><vscode-option value="json">JSON 数据</vscode-option><vscode-option value="xml">XML 数据</vscode-option></vscode-multi-select><output aria-live="polite"></output>',
    js: "const select = document.querySelector('#formats'); const update = () => { document.querySelector('output').textContent = '选中值：' + JSON.stringify(select.value); }; select.addEventListener('change', update); update();",
  },
  form: {
    title: '表单、已修改状态与提交',
    html: '<form><vscode-form-container mark-duration="2s"><vscode-form-group variant="vertical"><vscode-label for="project" required>项目名称</vscode-label><vscode-textfield id="project" name="project" value="示例项目" required></vscode-textfield><vscode-form-helper>修改后表单控件短暂高亮。</vscode-form-helper></vscode-form-group><vscode-checkbox name="enabled" value="yes" label="启用项目" checked></vscode-checkbox><vscode-button type="submit">保存</vscode-button> <vscode-button type="reset" secondary>重置</vscode-button></vscode-form-container></form><output aria-live="polite"></output>',
    js: "document.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('output').textContent = JSON.stringify(Array.from(new FormData(event.target))); });",
  },
  fieldset: {
    title: '可选分区与折叠',
    html: '<vscode-fieldset checkbox checked checkbox-label="启用风荷载" unchecked-mode="collapsed"><fieldset><legend>风荷载</legend><vscode-label for="pressure">基本风压</vscode-label><vscode-textfield id="pressure" value="0.5" type="number"></vscode-textfield><vscode-checkbox label="考虑阵风" checked></vscode-checkbox></fieldset></vscode-fieldset>',
  },
  collapsible: {
    title: '折叠内容与标题操作',
    html: '<vscode-collapsible title="资源管理器" open><vscode-badge variant="counter" slot="decorations">2</vscode-badge><vscode-toolbar-button slot="actions" icon="new-file" label="新建文件"></vscode-toolbar-button><p>index.ts</p><p>package.json</p></vscode-collapsible>',
  },
  'context-menu': {
    title: '菜单与选择事件',
    html: '<vscode-button id="open">显示菜单</vscode-button><vscode-context-menu></vscode-context-menu><output aria-live="polite"></output>',
    js: "const menu = document.querySelector('vscode-context-menu'); menu.data = [{label: '复制', value: 'copy', keybinding: 'Ctrl+C'}, {label: '粘贴', value: 'paste', keybinding: 'Ctrl+V'}]; menu.show = true; document.querySelector('#open').addEventListener('click', (event) => { event.stopPropagation(); menu.show = true; }); menu.addEventListener('vsc-context-menu-select', (event) => { document.querySelector('output').textContent = '操作：' + event.detail.value; });",
  },
  scrollable: {
    title: '滚动内容',
    html: '<vscode-scrollable style="height: 160px; width: 100%"><div style="height: 380px; padding: 12px">文件列表<p>向下滚动查看剩余内容。</p><p style="margin-top: 220px">列表底部</p></div></vscode-scrollable>',
  },
  'split-layout': {
    title: '分栏与最小尺寸',
    html: '<vscode-split-layout split="vertical" min-start="100px" min-end="100px" reset-on-dbl-click style="height: 200px"><div slot="start">资源管理器</div><div slot="end">编辑器<br />拖动中间分隔条，双击恢复。</div></vscode-split-layout>',
  },
  'tabs-overflow': {
    title: '标签页溢出与标题图标',
    height: 440,
    html: `<div class="controls tabs-overflow-controls">
              <label
                >溢出方式<select id="gallery-overflow-mode">
                  <option value="wrap">换行</option>
                  <option value="scroll">水平滚动</option>
                  <option value="menu">上下文菜单</option>
                </select></label
              >
              <label
                >换行对齐<select id="gallery-overflow-alignment">
                  <option value="start">左对齐</option>
                  <option value="center">居中</option>
                </select></label
              >
              <label
                >容器宽度<input
                  id="gallery-overflow-width"
                  type="range"
                  min="160"
                  max="800"
                  value="420"
                />
                <output
                  id="gallery-overflow-width-value"
                  for="gallery-overflow-width"
                  >420px</output
                >
              </label>
              <label
                >图文模式<select id="gallery-overflow-display">
                  <option value="icon-text">图标和文字</option>
                  <option value="icon">仅图标</option>
                  <option value="text">仅文字</option>
                </select></label
              >
              <label
                >图标位置<select id="gallery-overflow-position">
                  <option value="start">左侧</option>
                  <option value="end">右侧</option>
                </select></label
              >
            </div>
            <div id="gallery-overflow-container">
              <vscode-tabs id="gallery-overflow-tabs">
                <vscode-tab-header icon="files">文件</vscode-tab-header
                ><vscode-tab-panel>文件内容</vscode-tab-panel>
                <vscode-tab-header icon="search">搜索</vscode-tab-header
                ><vscode-tab-panel>搜索内容</vscode-tab-panel>
                <vscode-tab-header icon="source-control"
                  >源代码管理</vscode-tab-header
                ><vscode-tab-panel>源代码管理内容</vscode-tab-panel>
                <vscode-tab-header icon="debug-alt"
                  >运行与调试</vscode-tab-header
                ><vscode-tab-panel>运行与调试内容</vscode-tab-panel>
                <vscode-tab-header icon="extensions">扩展</vscode-tab-header
                ><vscode-tab-panel>扩展内容</vscode-tab-panel>
                <vscode-tab-header
                  ><svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M2 2h12v12H2zM4 4v8h8V4z"
                    /></svg
                  >自定义 SVG</vscode-tab-header
                ><vscode-tab-panel>自定义 SVG 图标</vscode-tab-panel>
                <vscode-tab-header
                  ><span
                    slot="icon"
                    class="codicon codicon-terminal"
                    aria-hidden="true"
                  ></span
                  >自定义字体</vscode-tab-header
                ><vscode-tab-panel>通过插槽使用字体图标</vscode-tab-panel>
                <vscode-tab-header icon="gear">设置</vscode-tab-header
                ><vscode-tab-panel>设置内容</vscode-tab-panel>
                <vscode-tab-header icon="history">历史记录</vscode-tab-header
                ><vscode-tab-panel>历史记录内容</vscode-tab-panel>
                <vscode-tab-header icon="info">帮助与反馈</vscode-tab-header
                ><vscode-tab-panel>帮助与反馈内容</vscode-tab-panel>
              </vscode-tabs>
            </div>
            <p id="gallery-overflow-status" role="status">当前选中：文件</p>`,
    css: `#gallery-overflow-container {width:420px;max-width:100%;border:1px solid var(--vscode-panel-border,#454545)} #gallery-overflow-tabs vscode-tab-panel {min-height:90px;padding:16px} #gallery-overflow-width {width:140px} .tabs-overflow-controls {display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:16px} .tabs-overflow-controls label {display:flex;gap:8px;align-items:center} .tabs-overflow-controls select {max-width:100%;background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground);border:1px solid var(--vscode-dropdown-border)} .tabs-overflow-controls output {display:inline;margin:0}`,
    js: `const tabs = document.querySelector('#gallery-overflow-tabs');
      const headers = [...tabs.querySelectorAll('vscode-tab-header')];
      const mode = document.querySelector('#gallery-overflow-mode');
      const alignment = document.querySelector('#gallery-overflow-alignment');
      const width = document.querySelector('#gallery-overflow-width');
      const display = document.querySelector('#gallery-overflow-display');
      const position = document.querySelector('#gallery-overflow-position');
      const update = () => {
        tabs.overflow = mode.value;
        tabs.wrapAlignment = alignment.value;
        alignment.disabled = mode.value !== 'wrap';
        document.querySelector('#gallery-overflow-container').style.width =
          width.value + 'px';
        document.querySelector('#gallery-overflow-width-value').value =
          width.value + 'px';
        headers.forEach((header) => {
          header.iconDisplay = display.value;
          header.iconPosition = position.value;
        });
      };
      [mode, alignment, width, display, position].forEach((control) =>
        control.addEventListener('input', update)
      );
      const updateStatus = () => {
        document.querySelector('#gallery-overflow-status').textContent =
          '当前选中：' + headers[tabs.selectedIndex].textContent.trim();
      };
      tabs.addEventListener('vsc-tabs-select', updateStatus);
      update();`,
  },
  tabs: {
    title: '标签切换与视图拖拽',
    html: '<vscode-tabs><vscode-tab-header>文件</vscode-tab-header><vscode-tab-panel><vscode-fieldset><fieldset><legend>资源管理器</legend><vscode-textfield aria-label="文件筛选" placeholder="筛选文件"></vscode-textfield><p>index.ts</p></fieldset></vscode-fieldset><fieldset><legend>大纲</legend><p>ProjectSettings</p></fieldset></vscode-tab-panel><vscode-tab-header>搜索</vscode-tab-header><vscode-tab-panel><fieldset><legend>搜索结果</legend><p>拖动标题或分区 legend 调整布局。</p></fieldset></vscode-tab-panel></vscode-tabs><output aria-live="polite"></output>',
    js: "const tabs = document.querySelector('vscode-tabs'); tabs.addEventListener('vsc-tabs-select', (event) => { document.querySelector('output').textContent = '当前标签索引：' + event.detail.selectedIndex; }); tabs.addEventListener('vsc-tabs-layout-change', (event) => { document.querySelector('output').textContent = '已移动视图：' + event.detail.views.length; });",
  },
  'tabs-group': {
    title: '跨容器移动标签页组',
    html: '<div class="groups"><vscode-tabs-group><vscode-tabs><vscode-tab-header>文件</vscode-tab-header><vscode-tab-panel><fieldset><legend>文件列表</legend><p>index.ts</p></fieldset></vscode-tab-panel><vscode-tab-header>大纲</vscode-tab-header><vscode-tab-panel><fieldset><legend>符号</legend><p>组件定义</p></fieldset></vscode-tab-panel></vscode-tabs></vscode-tabs-group><vscode-tabs-group empty-text="拖动标题栏空白处，将整组移入此处"></vscode-tabs-group></div>',
    css: '.groups {display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px} vscode-tabs-group {min-height: 200px} @media(max-width: 500px) {.groups {grid-template-columns: 1fr}}',
  },
  toolbar: {
    height: 160,
    title: '操作与切换按钮',
    html: '<vscode-toolbar-container><vscode-toolbar-button icon="new-file" label="新建文件"></vscode-toolbar-button><vscode-toolbar-button icon="refresh" label="刷新"></vscode-toolbar-button><vscode-toolbar-button icon="pin" label="固定" toggleable></vscode-toolbar-button></vscode-toolbar-container><output aria-live="polite"></output>',
    js: "const button = document.querySelector('[toggleable]'); button.addEventListener('change', () => { document.querySelector('output').textContent = button.checked ? '已固定' : '已取消固定'; });",
  },
  table: {
    height: 220,
    title: '表格与列宽调整',
    html: '<vscode-table resizable bordered-columns><vscode-table-header><vscode-table-header-cell>文件</vscode-table-header-cell><vscode-table-header-cell>类型</vscode-table-header-cell></vscode-table-header><vscode-table-body><vscode-table-row><vscode-table-cell>index.ts</vscode-table-cell><vscode-table-cell>TypeScript</vscode-table-cell></vscode-table-row><vscode-table-row><vscode-table-cell>README.md</vscode-table-cell><vscode-table-cell>Markdown</vscode-table-cell></vscode-table-row></vscode-table-body></vscode-table>',
  },
  tree: {
    title: '层级、图标与多选',
    html: '<vscode-tree multi-select indent-guides="always" aria-label="项目文件"><vscode-tree-item open><vscode-icon slot="icon-branch" name="folder"></vscode-icon><vscode-icon slot="icon-branch-opened" name="folder-opened"></vscode-icon>src<vscode-tree-item><vscode-icon slot="icon-leaf" name="file-code"></vscode-icon>index.ts<span slot="description">入口</span></vscode-tree-item><vscode-tree-item>styles.ts</vscode-tree-item></vscode-tree-item><vscode-tree-item>README.md</vscode-tree-item></vscode-tree><output aria-live="polite"></output>',
    js: "document.querySelector('vscode-tree').addEventListener('vsc-tree-select', (event) => { document.querySelector('output').textContent = '选中数量：' + event.detail.length; });",
  },
};
