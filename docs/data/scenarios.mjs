// 每个场景明确列出覆盖的公开功能；组合组件共用可运行场景。
const demo = (title, features, html, js = '', height = 340, css = '') => ({
  title,
  features,
  html,
  js,
  height,
  css,
});
const formScript = `const form = document.querySelector('form'); form.addEventListener('submit', event => { event.preventDefault(); document.querySelector('output').textContent = JSON.stringify(Array.from(new FormData(form))); }); form.addEventListener('reset', () => { document.querySelector('output').textContent = '已恢复默认值'; });`;
const choices = `<vscode-option value="ts" description="类型安全" selected>TypeScript</vscode-option><vscode-option value="js" description="浏览器脚本">JavaScript</vscode-option><vscode-option value="css" disabled>CSS（禁用）</vscode-option><vscode-option value="">不指定</vscode-option>`;
const rows = Array.from(
  {length: 8},
  (_, i) =>
    `<vscode-table-row><vscode-table-cell column-label="名称">文件 ${i + 1}</vscode-table-cell><vscode-table-cell column-label="状态"><vscode-badge>${i % 2 ? '完成' : '待处理'}</vscode-badge></vscode-table-cell><vscode-table-cell column-label="操作" compact><vscode-button secondary>打开 ${i + 1}</vscode-button></vscode-table-cell></vscode-table-row>`
).join('');
const table = (attrs = '') =>
  `<vscode-table ${attrs}><vscode-table-header><vscode-table-header-cell min-width="100px">名称</vscode-table-header-cell><vscode-table-header-cell>状态</vscode-table-header-cell><vscode-table-header-cell>操作</vscode-table-header-cell></vscode-table-header><vscode-table-body>${rows}</vscode-table-body></vscode-table>`;
const tree = (attrs = '') =>
  `<vscode-tree ${attrs} aria-label="目录"><vscode-tree-item open>项目<vscode-tree-item>src<vscode-tree-item>main.ts</vscode-tree-item><vscode-tree-item>style.css</vscode-tree-item></vscode-tree-item><vscode-tree-item>README.md</vscode-tree-item></vscode-tree-item></vscode-tree>`;
const split = (attrs = '') =>
  `<vscode-split-layout ${attrs} style="height:180px"><div slot="start">起始面板</div><div slot="end">结束面板</div></vscode-split-layout>`;
export const componentScenarios = {
  tooltip: ['tooltip-field', 'tooltip-controls'],
  badge: ['badge-variants'],
  button: ['button-variants', 'button-form'],
  'button-group': ['button-group-menu'],
  icon: ['icon-sizes'],
  divider: ['divider-semantics'],
  'progress-bar': ['progress-control'],
  'progress-ring': ['progress-ring-task'],
  textfield: [
    'textfield-types',
    'textfield-native-types',
    'textfield-slots',
    'textfield-file',
  ],
  textarea: ['textarea-variants'],
  checkbox: ['checkbox-form'],
  'checkbox-group': ['choice-layouts', 'checkbox-form'],
  radio: ['radio-form', 'choice-layouts'],
  'radio-group': ['choice-layouts', 'radio-form'],
  'single-select': ['select-states', 'select-options', 'select-filters'],
  'multi-select': ['multi-form', 'multi-combobox'],
  option: ['select-states', 'multi-form', 'multi-combobox'],
  label: ['form-layouts'],
  'form-helper': ['form-layouts'],
  'form-group': ['form-layouts'],
  'form-container': ['form-layouts', 'form-dirty-controls'],
  fieldset: ['fieldset-modes', 'fieldset-callback'],
  collapsible: ['collapsible-variants'],
  'context-menu': ['menu-persistent', 'button-group-menu'],
  'context-menu-item': ['menu-persistent'],
  scrollable: ['scrollable-controls'],
  'split-layout': ['split-directions', 'split-controls'],
  tabs: ['tabs-panel', 'tabs-group-views'],
  'tab-header': ['tabs-panel', 'tabs-group-views'],
  'tab-panel': ['tabs-panel', 'tabs-group-views'],
  'tabs-group': ['tabs-group-views'],
  'toolbar-button': ['toolbar-states'],
  'toolbar-container': ['toolbar-states'],
  table: ['table-variants', 'table-responsive'],
  'table-header': ['table-variants', 'table-responsive'],
  'table-header-cell': ['table-variants', 'table-responsive'],
  'table-body': ['table-variants', 'table-responsive'],
  'table-row': ['table-variants', 'table-responsive'],
  'table-cell': ['table-variants', 'table-responsive'],
  tree: ['tree-variants', 'tree-controls', 'tree-item-slots'],
  'tree-item': ['tree-variants', 'tree-controls', 'tree-item-slots'],
};
export const extraExamples = {
  'tooltip-field': demo(
    '外部字段关联与持续提示',
    [
      'for 外部关联，保留输入框层级与 slot',
      'open 持续提示、多行文字与主题切换',
      'fallbacks 右 → 下 → 上，CSS 宽度约束',
    ],
    '<div class="tooltip-field"><vscode-textfield id="tooltip-input" label="基本风压" value="0"><span slot="content-after">kPa</span></vscode-textfield><vscode-tooltip id="field-tooltip" for="tooltip-input" placement="right" text="数值必须大于零&#10;说明：请输入基本风压" open style="--vsc-tooltip-min-width:160px;--vsc-tooltip-max-width:260px"></vscode-tooltip></div>',
    "document.querySelector('#field-tooltip').fallbacks = ['bottom', 'top'];",
    190,
    '.tooltip-field{padding:24px 0} #tooltip-input{width:180px}'
  ),
  'tooltip-controls': demo(
    '提示状态与关联目标切换',
    [
      'target 元素引用关联，保留 flex/grid 布局',
      'text 动态更新、disabled 禁用提示而保留操作',
      'delay=0 立即悬停、键盘聚焦与 Escape 关闭',
    ],
    '<div class="variants tooltip-actions"><vscode-button id="tooltip-save">保存</vscode-button><vscode-button id="tooltip-export" secondary>导出</vscode-button><vscode-tooltip id="action-tip" text="保存当前项目" delay="0"></vscode-tooltip></div><div class="variants"><vscode-button id="switch-tooltip-target" secondary>提示导出操作</vscode-button><vscode-checkbox id="disable-tooltip" label="禁用提示"></vscode-checkbox></div><output aria-live="polite">提示关联保存操作</output>',
    "const tip=document.querySelector('#action-tip');tip.target=document.querySelector('#tooltip-save');document.querySelector('#switch-tooltip-target').onclick=()=>{tip.target=document.querySelector('#tooltip-export');tip.text='导出当前计算结果';document.querySelector('output').textContent='提示关联导出操作';};document.querySelector('#disable-tooltip').addEventListener('change',event=>{tip.disabled=event.target.checked;});",
    240,
    '.tooltip-actions{padding:36px 0}'
  ),
  'textfield-native-types': demo(
    '其他原生输入类型',
    [
      'color/date/datetime-local/month/time/week',
      'search/tel/url、浏览器原生选择器',
      '不同浏览器的原生弹出界面由浏览器决定',
    ],
    `<div class="columns">${['color', 'date', 'datetime-local', 'month', 'time', 'week', 'search', 'tel', 'url'].map((type) => `<div><vscode-label for="type-${type}">${type}</vscode-label><vscode-textfield id="type-${type}" type="${type}" aria-label="${type}" placeholder="${type}"></vscode-textfield></div>`).join('')}</div>`,
    '',
    540
  ),
  'select-states': demo(
    '空值、禁用、必选与默认值',
    [
      'required、disabled、default-value',
      'value、selectedIndex、选项 selected/disabled/description',
      'FormData 与 reset',
    ],
    `<form><vscode-label for="select">必选语言</vscode-label><vscode-single-select id="select" name="language" required default-value="ts">${choices}</vscode-single-select><vscode-single-select disabled aria-label="禁用选择"><vscode-option selected>禁用</vscode-option></vscode-single-select><div class="variants"><vscode-button type="submit">提交</vscode-button><vscode-button type="reset" secondary>重置</vscode-button><vscode-button id="empty" secondary>清空</vscode-button><vscode-button id="index" secondary>选中第二项</vscode-button></div></form><output aria-live="polite"></output>`,
    formScript +
      `document.querySelector('#empty').onclick=()=>document.querySelector('#select').value='';document.querySelector('#index').onclick=()=>document.querySelector('#select').selectedIndex=1;`
  ),
  'select-options': demo(
    '动态选项、位置与打开控制',
    [
      'options 数组、value、open、position=above/below',
      '数据更新与选项描述、禁用状态',
    ],
    `<vscode-button id="replace">替换数据</vscode-button> <vscode-button id="open" secondary>打开上方列表</vscode-button><div style="margin-top:140px"><vscode-single-select aria-label="动态语言" position="above"></vscode-single-select></div><output aria-live="polite"></output>`,
    `const select=document.querySelector('vscode-single-select');select.options=[{label:'TypeScript',value:'ts',selected:true},{label:'JavaScript',value:'js',description:'脚本语言'},{label:'停用',value:'disabled',disabled:true}];select.value='ts';document.querySelector('#replace').onclick=()=>{select.options=[{label:'JSON',value:'json'},{label:'YAML',value:'yaml'}];select.value='yaml';document.querySelector('output').textContent='已更新为 YAML';};document.querySelector('#open').onclick=()=>select.open=true;select.addEventListener('change',()=>document.querySelector('output').textContent=select.value);`,
    420
  ),
  'select-filters': demo(
    '四种组合框过滤算法',
    [
      'combobox、filter、label',
      'fuzzy / contains / startsWith / startsWithPerTerm',
      'creatable 的新建选项',
    ],
    `<label>过滤算法 <select id="filter"><option>fuzzy</option><option>contains</option><option>startsWith</option><option>startsWithPerTerm</option></select></label><vscode-single-select combobox creatable label="输入过滤或创建语言" aria-label="过滤语言"><vscode-option value="ts">TypeScript Language</vscode-option><vscode-option value="js">JavaScript Language</vscode-option><vscode-option value="json">JSON Data</vscode-option></vscode-single-select><output aria-live="polite">试试 ts、Language 或输入新名称。</output>`,
    `const select=document.querySelector('vscode-single-select');document.querySelector('#filter').onchange=event=>select.filter=event.target.value;select.addEventListener('change',()=>document.querySelector('output').textContent='选中：'+select.value);`
  ),
  'multi-form': demo(
    '多值提交、选择索引和默认恢复',
    [
      'value 数组、selectedIndexes、defaultValue',
      'required、disabled、getAll(name)',
      'abbreviation、description、disabled 选项',
    ],
    `<form><vscode-multi-select name="formats" required aria-label="导出格式"><vscode-option value="html" abbreviation="HTML" description="网页" selected>超文本标记语言</vscode-option><vscode-option value="md" abbreviation="MD">Markdown 文档</vscode-option><vscode-option value="json" description="数据交换">JSON</vscode-option><vscode-option value="xml" disabled>XML</vscode-option></vscode-multi-select><div class="variants"><vscode-button type="submit">提交全部值</vscode-button><vscode-button type="reset" secondary>恢复默认</vscode-button><vscode-button id="index" secondary>选择前两项</vscode-button><vscode-button id="clear" secondary>清空</vscode-button></div></form><output aria-live="polite"></output>`,
    `const select=document.querySelector('vscode-multi-select');select.defaultValue=['html'];document.querySelector('form').onsubmit=event=>{event.preventDefault();document.querySelector('output').textContent=JSON.stringify(new FormData(event.target).getAll('formats'));};document.querySelector('#index').onclick=()=>{select.selectedIndexes=[0,1];};document.querySelector('#clear').onclick=()=>select.value=[];`
  ),
  'multi-combobox': demo(
    '多选过滤、创建与标签折叠',
    [
      'combobox、creatable、filter、options',
      '长标签/缩写/值的回退与溢出折叠',
      '程序 value 与 change',
    ],
    `<vscode-multi-select combobox creatable filter="contains" label="输入格式名称" aria-label="自定义多选" style="width:230px"></vscode-multi-select><vscode-button id="choose" secondary>选择全部</vscode-button><output aria-live="polite"></output>`,
    `const select=document.querySelector('vscode-multi-select');select.options=[{label:'超文本标记语言',value:'html',abbreviation:'HTML'},{label:'Markdown 文档格式',value:'md',abbreviation:'MD'},{label:'JavaScript 对象表示法',value:'json'},{label:'',value:'yaml'}];document.querySelector('#choose').onclick=()=>{select.value=['html','md','json','yaml'];document.querySelector('output').textContent=JSON.stringify(select.value);};select.addEventListener('change',()=>document.querySelector('output').textContent=JSON.stringify(select.value));`
  ),
  'form-layouts': demo(
    '布局、必填标记与辅助信息',
    [
      'FormGroup horizontal/vertical/settings-group、尺寸',
      'Label for/required 与 Helper 内容',
      'FormContainer responsive/breakpoint',
    ],
    `<vscode-form-container responsive breakpoint="560"><vscode-form-group variant="horizontal" size="small"><vscode-label for="small" required size="small">名称</vscode-label><vscode-textfield id="small" size="small" required placeholder="小尺寸横向布局"></vscode-textfield><vscode-form-helper>必填标记仅提示，required 在控件上设置。</vscode-form-helper></vscode-form-group><vscode-form-group variant="vertical" size="large"><vscode-label for="large" size="large">说明</vscode-label><vscode-textarea id="large" size="large" rows="2"></vscode-textarea><vscode-form-helper>大尺寸纵向布局，调整窗口观察响应式。</vscode-form-helper></vscode-form-group><vscode-form-group variant="settings-group"><vscode-label for="setting">设置分组</vscode-label><vscode-textfield id="setting" value="设置面板样式"></vscode-textfield><vscode-form-helper>标题、控件和说明纵向排列。</vscode-form-helper></vscode-form-group></vscode-form-container>`,
    '',
    560
  ),
  'form-dirty-controls': demo(
    '已修改状态与高亮开关',
    [
      'mark-duration=0/时间/forever、markable',
      'dirty、mark()/reset()、全局状态查询',
    ],
    `<vscode-form-container mark-duration="forever"><vscode-form-group><vscode-label for="dirty">名称</vscode-label><vscode-textfield id="dirty" value="初始名称"></vscode-textfield></vscode-form-group></vscode-form-container><div class="variants"><vscode-button id="reset">清除修改标记</vscode-button><vscode-button id="mark">手动标记</vscode-button><vscode-button id="disable" secondary>切换高亮</vscode-button></div><output aria-live="polite"></output>`,
    `const container=document.querySelector('vscode-form-container');document.querySelector('#reset').onclick=()=>{container.reset();document.querySelector('output').textContent='dirty='+container.dirty;};document.querySelector('#mark').onclick=()=>container.mark();document.querySelector('#disable').onclick=()=>{container.markable=!container.markable;document.querySelector('output').textContent='markable='+container.markable;};document.querySelector('vscode-textfield').addEventListener('input',()=>requestAnimationFrame(()=>document.querySelector('output').textContent=JSON.stringify(container.constructor.getFormStates().map(state=>({dirty:state.dirty})))));`
  ),
  'fieldset-modes': demo(
    '三种取消勾选模式',
    ['visible/collapsed/minimal', 'checkbox-label、默认分区、尺寸与内容恢复'],
    `<div class="stack">${['visible', 'collapsed', 'minimal'].map((mode) => `<vscode-fieldset checkbox checked checkbox-label="启用 ${mode}" unchecked-mode="${mode}"><fieldset><legend>${mode}</legend><vscode-textfield value="重新勾选后保留输入" aria-label="${mode} 输入"></vscode-textfield></fieldset></vscode-fieldset>`).join('')}</div>`,
    '',
    470
  ),
  'fieldset-callback': demo(
    '取消默认行为与自定义状态',
    [
      '可取消的 vsc-fieldset-checked-change',
      'checkedChange 回调、返回 false',
      'fieldsetElement、checked 属性控制',
    ],
    `<vscode-fieldset checkbox checked checkbox-label="自定义控制"><fieldset><legend>高级设置</legend><vscode-textfield value="保留可编辑" aria-label="自定义输入"></vscode-textfield></fieldset></vscode-fieldset><output aria-live="polite">取消勾选时保留内容可编辑。</output>`,
    `const host=document.querySelector('vscode-fieldset');host.checkedChange=checked=>{document.querySelector('output').textContent='checked='+checked+'，已跳过默认禁用';return false;};`,
    270
  ),
  'collapsible-variants': demo(
    '标题、描述与独立操作',
    [
      'title/heading/description、open',
      'decorations/actions、always-show-header-actions',
      'toggle 事件、停止操作冒泡',
    ],
    `<vscode-collapsible title="项目" heading="扩展工作区" description="2 个文件" always-show-header-actions><vscode-badge slot="decorations" variant="counter">2</vscode-badge><vscode-toolbar-button id="add" slot="actions" icon="add" label="新增"></vscode-toolbar-button><p>main.ts</p></vscode-collapsible><output aria-live="polite"></output>`,
    `const panel=document.querySelector('vscode-collapsible');panel.addEventListener('vsc-collapsible-toggle',event=>document.querySelector('output').textContent='open='+event.detail.open);document.querySelector('#add').onclick=event=>{event.stopPropagation();document.querySelector('output').textContent='已新增，展开状态未改变';};`,
    240
  ),
  'menu-persistent': demo(
    '快捷键、分隔线与持续选择',
    [
      'data、label/keybinding/value/separator',
      'prevent-close、show、方向键/Enter/Escape',
      'vsc-context-menu-select',
    ],
    `<vscode-button id="show">打开持续菜单</vscode-button><vscode-context-menu prevent-close></vscode-context-menu><output aria-live="polite"></output>`,
    `const menu=document.querySelector('vscode-context-menu');menu.data=[{label:'复制',value:'copy',keybinding:'Ctrl+C'},{separator:true},{label:'格式化',value:'format',keybinding:'Shift+Alt+F'}];menu.show=true;document.querySelector('#show').onclick=event=>{event.stopPropagation();menu.show=true;};menu.addEventListener('vsc-context-menu-select',event=>document.querySelector('output').textContent=JSON.stringify(event.detail));`
  ),
  'scrollable-controls': demo(
    '滚动位置、阴影与滚轮',
    [
      'always-visible、shadow、scrollPos/scrollMax/scrolled',
      'fast-scroll-sensitivity、mouse-wheel-scroll-sensitivity、min-thumb-size',
      'vsc-scrollable-scroll 事件',
    ],
    `<div class="variants"><vscode-button id="bottom">滚动到底部</vscode-button><vscode-button id="top" secondary>回到顶部</vscode-button></div><vscode-scrollable always-visible fast-scroll-sensitivity="3" mouse-wheel-scroll-sensitivity="1.5" min-thumb-size="30" style="height:150px"><div style="padding:12px">${Array.from({length: 20}, (_, i) => `<p>文件 ${i + 1}</p>`).join('')}</div></vscode-scrollable><output aria-live="polite"></output>`,
    `const scroll=document.querySelector('vscode-scrollable');document.querySelector('#bottom').onclick=()=>scroll.scrollPos=scroll.scrollMax;document.querySelector('#top').onclick=()=>scroll.scrollPos=0;scroll.addEventListener('vsc-scrollable-scroll',()=>document.querySelector('output').textContent='位置：'+scroll.scrollPos+' / '+scroll.scrollMax);`,
    300
  ),
  'split-directions': demo(
    '横向、纵向与嵌套分栏',
    [
      'split=horizontal/vertical、start/end 插槽',
      'initial-handle-position、handle-size、最小尺寸',
    ],
    `<div class="columns">${split('split="horizontal" initial-handle-position="35%" handle-size="8" min-start="40px" min-end="40px"')}<vscode-split-layout split="vertical" style="height:180px"><div slot="start">目录</div><vscode-split-layout slot="end" split="horizontal"><div slot="start">编辑区</div><div slot="end">终端</div></vscode-split-layout></vscode-split-layout></div>`,
    '',
    250
  ),
  'split-controls': demo(
    '固定面板、复位与位置事件',
    [
      'fixed-pane=start/end/none、handlePosition',
      'reset-on-dbl-click、resetHandlePosition()',
      'vsc-split-layout-change、百分比位置',
    ],
    `<label>固定面板 <select id="fixed"><option>start</option><option>end</option><option>none</option></select></label>${split('fixed-pane="start" initial-handle-position="120px" reset-on-dbl-click min-start="80px" min-end="80px"')}<vscode-button id="reset" secondary>恢复初始分栏</vscode-button><output aria-live="polite"></output>`,
    `const split=document.querySelector('vscode-split-layout');document.querySelector('#fixed').onchange=event=>split.fixedPane=event.target.value;document.querySelector('#reset').onclick=()=>split.resetHandlePosition();split.addEventListener('vsc-split-layout-change',event=>document.querySelector('output').textContent=JSON.stringify(event.detail));`,
    300
  ),
  'tabs-panel': demo(
    '面板外观、选中索引与组合',
    [
      'panel 外观、selected-index、active/hidden 同步',
      'Header/Panel 成对顺序、装饰徽章与内容',
      'vsc-tabs-select、键盘导航与程序控制',
    ],
    `<vscode-tabs panel selected-index="1"><vscode-tab-header>设置 <vscode-badge variant="tab-header-counter">2</vscode-badge></vscode-tab-header><vscode-tab-panel><vscode-checkbox label="自动保存" checked></vscode-checkbox></vscode-tab-panel><vscode-tab-header>预览</vscode-tab-header><vscode-tab-panel><p>当前选中预览页。</p></vscode-tab-panel></vscode-tabs><vscode-button id="first" secondary>显示设置</vscode-button><output aria-live="polite"></output>`,
    `const tabs=document.querySelector('vscode-tabs');document.querySelector('#first').onclick=()=>{tabs.selectedIndex=0;document.querySelector('output').textContent='selectedIndex='+tabs.selectedIndex;};tabs.addEventListener('vsc-tabs-select',event=>document.querySelector('output').textContent='selectedIndex='+event.detail.selectedIndex);`,
    290
  ),
  'tabs-group-views': demo(
    '视图拖拽到空组与动态布局',
    [
      '移动单个 fieldset 视图形成新 Tabs',
      'empty-text、组间布局事件',
      '保留节点内容和表单输入',
    ],
    `<div class="columns"><vscode-tabs-group><vscode-tabs><vscode-tab-header>项目</vscode-tab-header><vscode-tab-panel><fieldset><legend>配置</legend><vscode-textfield value="保留这个值" aria-label="配置值"></vscode-textfield></fieldset><fieldset><legend>大纲</legend><p>符号列表</p></fieldset></vscode-tab-panel></vscode-tabs></vscode-tabs-group><vscode-tabs-group empty-text="将配置标题拖到这里"></vscode-tabs-group></div><output aria-live="polite"></output>`,
    `document.querySelectorAll('vscode-tabs-group').forEach(group=>group.addEventListener('vsc-tabs-group-layout-change',event=>document.querySelector('output').textContent='已移动：'+event.detail.tabs.localName));`,
    390
  ),
  'toolbar-states': demo(
    '切换状态、文字与键盘',
    [
      'icon/label、toggleable/checked、change',
      'ToolbarContainer 插槽组合',
      '点击反馈和可访问名称',
    ],
    `<vscode-toolbar-container><vscode-toolbar-button icon="refresh" label="刷新列表"></vscode-toolbar-button><vscode-toolbar-button toggleable checked icon="pin" label="固定面板"></vscode-toolbar-button><vscode-badge variant="counter">8</vscode-badge><span>项目工具栏</span></vscode-toolbar-container><output aria-live="polite"></output>`,
    `document.querySelectorAll('vscode-toolbar-button').forEach(button=>{button.addEventListener('click',()=>document.querySelector('output').textContent=button.label);button.addEventListener('change',()=>document.querySelector('output').textContent=button.label+'：'+button.checked);});`,
    160
  ),
  'table-variants': demo(
    '边框、斑马纹、宽度与滚动主体',
    [
      'bordered/bordered-rows/bordered-columns、zebra/zebra-odd',
      'columns、min-column-width、HeaderCell min-width',
      '滚动 Body、单元格 compact 和操作内容',
    ],
    `<label>外观 <select id="look"><option value="zebra">斑马纹</option><option value="zebra-odd">奇数行斑马纹</option><option value="bordered">全部边框</option><option value="bordered-rows">行边框</option><option value="bordered-columns">列边框</option></select></label>${table('zebra resizable min-column-width="60px"')}<output aria-live="polite"></output>`,
    `const table=document.querySelector('vscode-table');table.columns=['45%','25%','auto'];document.querySelector('#look').onchange=event=>{['zebra','zebra-odd','bordered','bordered-rows','bordered-columns'].forEach(attr=>table.toggleAttribute(attr,attr===event.target.value));};document.querySelectorAll('vscode-button').forEach(button=>button.onclick=()=>document.querySelector('output').textContent=button.textContent);`,
    450,
    'vscode-table-body {max-height:260px;overflow:auto}'
  ),
  'table-responsive': demo(
    '响应式、尺寸与延迟列宽调整',
    [
      'responsive/breakpoint、column-label',
      'small/medium/large、delayed-resizing',
      '动态调整容器宽度、窄容器中的标签式布局',
    ],
    `<div class="table-width-control"><label for="container-width">容器宽度</label><input id="container-width" type="range" min="240" max="800" step="10" value="280"><output id="container-width-value" for="container-width"></output></div><div id="table-container" style="width:280px;max-width:100%"><p>响应式表格</p>${table('responsive breakpoint="350" size="small" bordered-rows')}<p>延迟列宽调整</p>${table('resizable delayed-resizing size="large" bordered-columns')}</div>`,
    `document.querySelectorAll('vscode-table').forEach(table=>table.columns=['40%','30%','auto']);const container=document.querySelector('#table-container');const width=document.querySelector('#container-width');width.addEventListener('input',()=>container.style.width=width.value+'px');const reportWidth=()=>document.querySelector('#container-width-value').textContent=Math.round(container.getBoundingClientRect().width)+' px';new ResizeObserver(reportWidth).observe(container);reportWidth();`,
    690,
    'vscode-table-body {max-height:200px;overflow:auto} .table-width-control {display:flex;align-items:center;flex-wrap:wrap;gap:8px} .table-width-control input {width:180px;max-width:100%;accent-color:var(--vscode-focusBorder)} .table-width-control output {display:inline;margin:0}'
  ),
  'tree-variants': demo(
    '展开方式、箭头和缩进线',
    [
      'singleClick/doubleClick、hide-arrows',
      'indent、indent-guides=none/onHover/always',
      '单选/多选及鼠标键盘行为',
    ],
    `<label>缩进线 <select id="guides"><option>always</option><option>onHover</option><option>none</option></select></label><vscode-checkbox id="arrows" label="隐藏箭头"></vscode-checkbox>${tree('expand-mode="doubleClick" indent="16" indent-guides="always"')}<output aria-live="polite">双击分支展开，方向键也可展开。</output>`,
    `const tree=document.querySelector('vscode-tree');document.querySelector('#guides').onchange=event=>tree.indentGuides=event.target.value;document.querySelector('#arrows').addEventListener('change',event=>tree.hideArrows=event.target.checked);tree.addEventListener('vsc-tree-select',event=>document.querySelector('output').textContent='选择：'+event.detail.map(item=>item.textContent.trim()).join('、'));`,
    370
  ),
  'tree-controls': demo(
    '全展开、全收起与主动定位',
    [
      'expandAll()/collapseAll()、节点 active',
      '节点 selected/open、path/level',
      '鼠标选择与应用主动定位',
    ],
    `${tree('multi-select')}<div class="variants"><vscode-button id="expand">展开全部</vscode-button><vscode-button id="collapse" secondary>收起全部</vscode-button><vscode-button id="active" secondary>定位 README</vscode-button></div><output aria-live="polite"></output>`,
    `const tree=document.querySelector('vscode-tree');document.querySelector('#expand').onclick=()=>tree.expandAll();document.querySelector('#collapse').onclick=()=>tree.collapseAll();document.querySelector('#active').onclick=()=>{tree.expandAll();const item=tree.querySelectorAll('vscode-tree-item')[4];item.active=true;item.focus();document.querySelector('output').textContent='活动节点路径：'+JSON.stringify(item.path);};`,
    350
  ),
  'tree-item-slots': demo(
    '节点图标、说明与独立操作',
    [
      'icon-branch/icon-branch-opened/icon-leaf',
      'description/actions/decoration 插槽',
      '分支 open、叶节点操作与选中状态',
    ],
    `<vscode-tree><vscode-tree-item open><vscode-icon slot="icon-branch" name="folder"></vscode-icon><vscode-icon slot="icon-branch-opened" name="folder-opened"></vscode-icon>src<vscode-tree-item><vscode-icon slot="icon-leaf" name="file-code"></vscode-icon>main.ts<span slot="description">入口文件</span><vscode-toolbar-button id="delete" slot="actions" icon="trash" label="删除文件"></vscode-toolbar-button><vscode-badge slot="decoration" variant="counter">1</vscode-badge></vscode-tree-item></vscode-tree-item></vscode-tree><output aria-live="polite"></output>`,
    `document.querySelector('#delete').onclick=event=>{event.stopPropagation();document.querySelector('output').textContent='删除操作，未改变节点选择';};`,
    210
  ),
  'badge-variants': demo(
    '全部徽章变体与组合',
    [
      'default、counter、activity-bar-counter、tab-header-counter',
      '与折叠标题和标签页组合',
    ],
    `<div class="variants"><vscode-badge>默认状态</vscode-badge><vscode-badge variant="counter">128</vscode-badge><vscode-badge variant="activity-bar-counter">9</vscode-badge><vscode-badge variant="tab-header-counter">3</vscode-badge></div><vscode-collapsible title="问题" open><vscode-badge slot="decorations" variant="counter">2</vscode-badge><p>2 项待处理</p></vscode-collapsible>`,
    '',
    250
  ),
  'button-variants': demo(
    '宽度、尺寸、双侧图标与旋转',
    [
      'block、secondary、disabled',
      'small / medium / large',
      'icon、icon-after、旋转速度、icon-only 插槽',
    ],
    `<div class="variants"><vscode-button size="small">小按钮</vscode-button><vscode-button size="medium">中按钮</vscode-button><vscode-button size="large">大按钮</vscode-button><vscode-button icon="sync" icon-spin icon-spin-duration="2" icon-after="chevron-right">同步</vscode-button><vscode-button icon-only aria-label="文件"><vscode-icon name="file"></vscode-icon></vscode-button></div><p><vscode-button block secondary icon-after="arrow-right">全宽次要操作</vscode-button></p>`,
    '',
    220
  ),
  'button-form': demo(
    '提交、重置和普通操作',
    ['type=submit/reset/button', 'name/value、form 关联、点击反馈'],
    `<form><vscode-textfield name="project" default-value="初始项目" value="初始项目" aria-label="项目"></vscode-textfield><div class="variants"><vscode-button type="submit" name="action" value="save">提交</vscode-button><vscode-button type="reset" secondary>重置</vscode-button><vscode-button id="action" type="button">普通操作</vscode-button></div></form><output aria-live="polite"></output>`,
    formScript +
      `document.querySelector('#action').addEventListener('click', () => { document.querySelector('output').textContent = '普通操作不会提交表单'; });`
  ),
  'button-group-menu': demo(
    '分割按钮与更多操作',
    ['ButtonGroup 组合约束', '点击主操作、打开数据菜单、选择反馈'],
    `<vscode-button-group><vscode-button id="run" icon="play">运行任务</vscode-button><vscode-button id="more" icon="chevron-down" aria-label="更多任务"></vscode-button></vscode-button-group><vscode-context-menu></vscode-context-menu><output aria-live="polite"></output>`,
    `const menu=document.querySelector('vscode-context-menu');menu.data=[{label:'运行全部',value:'all'},{label:'调试任务',value:'debug'}];document.querySelector('#run').onclick=()=>document.querySelector('output').textContent='运行当前任务';document.querySelector('#more').onclick=event=>{event.stopPropagation();menu.show=true;};menu.addEventListener('vsc-context-menu-select',event=>document.querySelector('output').textContent=event.detail.value);`
  ),
  'icon-sizes': demo(
    '图标尺寸、速度与键盘操作',
    [
      '14 / 16 / 20 / 32 像素',
      'spin-duration、action-icon、label 与 vsc-click',
    ],
    `<div class="variants">${[14, 16, 20, 32].map((size) => `<vscode-icon name="file-code" size="${size}"></vscode-icon>`).join('')}<vscode-icon name="sync" spin spin-duration="3" size="24"></vscode-icon><vscode-icon name="add" action-icon label="新增文件"></vscode-icon></div><output aria-live="polite">聚焦新增图标，按 Enter 或空格。</output>`,
    `document.querySelector('[action-icon]').addEventListener('vsc-click',()=>document.querySelector('output').textContent='新增文件');`,
    160
  ),
  'divider-semantics': demo(
    '分隔语义与纯装饰',
    ['separator 的可访问语义', 'presentation 的装饰分隔'],
    `<p>操作组一</p><vscode-divider role="separator"></vscode-divider><p>操作组二</p><vscode-divider role="presentation"></vscode-divider><p>装饰分隔不进入可访问树。</p>`,
    '',
    230
  ),
  'progress-control': demo(
    '动态进度与长时间任务',
    [
      'value/max、边界限制、不确定进度',
      'long-running-threshold、ARIA 进度',
      '启动、完成与取消任务',
    ],
    `<vscode-progress-bar id="progress" value="0" max="200"></vscode-progress-bar><div class="variants"><vscode-button id="advance">推进 40</vscode-button><vscode-button id="busy" secondary>不确定进度</vscode-button><vscode-button id="done" secondary>完成</vscode-button></div><output aria-live="polite">0 / 200</output>`,
    `const progress=document.querySelector('#progress');document.querySelector('#advance').onclick=()=>{progress.indeterminate=false;progress.value=Math.min((progress.value||0)+40,200);document.querySelector('output').textContent=progress.value+' / 200';};document.querySelector('#busy').onclick=()=>{progress.longRunningThreshold=1000;progress.indeterminate=true;document.querySelector('output').textContent='处理中，1 秒后进入长时间模式';};document.querySelector('#done').onclick=()=>{progress.indeterminate=false;progress.value=200;document.querySelector('output').textContent='已完成';};`,
    200
  ),
  'progress-ring-task': demo(
    '可取消加载和可访问提示',
    ['aria-label、aria-live、role', '按任务状态显示/隐藏进度环'],
    `<vscode-button id="start">开始加载</vscode-button> <vscode-button id="cancel" secondary>取消</vscode-button><div id="loading" hidden><vscode-progress-ring aria-label="正在读取文件" aria-live="polite" role="status"></vscode-progress-ring>读取文件中</div><output aria-live="polite">等待操作</output>`,
    `document.querySelector('#start').onclick=()=>{document.querySelector('#loading').hidden=false;document.querySelector('output').textContent='加载中';};document.querySelector('#cancel').onclick=()=>{document.querySelector('#loading').hidden=true;document.querySelector('output').textContent='已取消';};`,
    200
  ),
  'textfield-types': demo(
    '文字、密码、邮件和数值约束',
    [
      'text/password/email/number',
      'autocomplete、placeholder、readonly、disabled',
      'required、pattern、min/max/step、minlength/maxlength',
    ],
    `<form class="stack"><vscode-textfield name="user" aria-label="用户名" placeholder="3 至 12 个字母" pattern="[A-Za-z]{3,12}" minlength="3" maxlength="12" required autocomplete="on"></vscode-textfield><vscode-textfield name="password" type="password" aria-label="密码" placeholder="密码" autocomplete="off"></vscode-textfield><vscode-textfield name="email" type="email" aria-label="邮箱" placeholder="mail@example.com"></vscode-textfield><vscode-textfield name="count" type="number" min="0" max="10" step="2" value="2" aria-label="数量"></vscode-textfield><vscode-textfield value="只读文字" readonly aria-label="只读"></vscode-textfield><vscode-textfield value="不可提交" disabled name="disabled" aria-label="禁用"></vscode-textfield><vscode-button type="submit">校验并提交</vscode-button></form><output aria-live="polite"></output>`,
    formScript,
    540
  ),
  'textfield-slots': demo(
    '前后插槽与自定义错误',
    [
      'content-before/content-after',
      'invalid、wrappedElement.setCustomValidity、reportValidity、validity',
      'input、change 与 wrappedElement',
    ],
    `<vscode-textfield id="path" aria-label="文件路径"><vscode-icon slot="content-before" name="folder"></vscode-icon><span slot="content-after">.ts</span></vscode-textfield><div class="variants"><vscode-button id="check">校验路径</vscode-button><vscode-button id="clear" secondary>清除错误</vscode-button></div><output aria-live="polite"></output>`,
    `const field=document.querySelector('#path');field.addEventListener('input',()=>{field.wrappedElement.setCustomValidity('');field.invalid=false;});document.querySelector('#check').onclick=()=>{field.wrappedElement.setCustomValidity(field.value.includes(' ')?'路径不能包含空格':'');field.invalid=!field.checkValidity();document.querySelector('output').textContent=field.validationMessage||'校验通过：'+field.wrappedElement.value;};document.querySelector('#clear').onclick=()=>{field.wrappedElement.setCustomValidity('');field.invalid=false;};`,
    220
  ),
  'textfield-file': demo(
    '文件与多文件选择',
    ['type=file、multiple', 'wrappedElement.files、安全限制'],
    `<vscode-label for="files">选择本地文件（仅显示名称）</vscode-label><vscode-textfield id="files" type="file" multiple></vscode-textfield><output aria-live="polite">不会上传文件。</output>`,
    `const field=document.querySelector('#files');field.addEventListener('change',()=>{document.querySelector('output').textContent=Array.from(field.wrappedElement.files||[]).map(file=>file.name).join('\\n');});`,
    200
  ),
  'textarea-variants': demo(
    '尺寸、只读、等宽与缩放',
    [
      'rows/cols、monospace、spellcheck',
      'resize=both/horizontal/vertical/none',
      'readonly、disabled、长度与必填校验',
    ],
    `<div class="columns"><div><vscode-label for="code">代码（可双向缩放）</vscode-label><vscode-textarea id="code" monospace resize="both" rows="4" cols="24"  value="const project = 'Nusys';"></vscode-textarea></div><div><vscode-label for="notes">说明（垂直缩放）</vscode-label><vscode-textarea id="notes" resize="vertical" required minlength="5" maxlength="80" rows="4" placeholder="5 至 80 个字符"></vscode-textarea></div><vscode-textarea aria-label="仅水平缩放" resize="horizontal" value="拖动右下角调整宽度"></vscode-textarea><vscode-textarea aria-label="只读" resize="none" readonly value="只读文档"></vscode-textarea><vscode-textarea aria-label="禁用" disabled value="禁用内容"></vscode-textarea></div><vscode-button id="check">检查说明</vscode-button><output aria-live="polite"></output>`,
    `document.querySelector('#check').onclick=()=>{const field=document.querySelector('#notes');document.querySelector('output').textContent=field.checkValidity()?'有效说明':field.validationMessage;};`,
    560
  ),
  'checkbox-form': demo(
    '开关、混合状态与表单',
    [
      'toggle、indeterminate、checked、default-checked',
      'required、disabled、input/change、FormData 和 reset',
    ],
    `<form><div class="stack"><vscode-checkbox name="agreement" value="yes" label="同意条款（必选）" required></vscode-checkbox><vscode-checkbox id="mixed" label="部分选中" indeterminate></vscode-checkbox><vscode-checkbox name="enabled" label="开关" toggle checked default-checked value="on"></vscode-checkbox><vscode-checkbox label="禁用开关" toggle disabled checked></vscode-checkbox></div><vscode-button type="submit">提交选择</vscode-button> <vscode-button type="reset" secondary>重置</vscode-button></form><output aria-live="polite"></output>`,
    formScript
  ),
  'choice-layouts': demo(
    '横纵布局与禁用选项',
    [
      'CheckboxGroup/RadioGroup 的 horizontal/vertical',
      '同名选项、禁用、初始状态与键盘导航',
    ],
    `<vscode-checkbox-group variant="horizontal" aria-label="横向复选"><vscode-checkbox label="HTML" checked></vscode-checkbox><vscode-checkbox label="Markdown"></vscode-checkbox><vscode-checkbox label="XML" disabled></vscode-checkbox></vscode-checkbox-group><vscode-checkbox-group variant="vertical" aria-label="纵向复选"><vscode-checkbox label="自动保存" toggle></vscode-checkbox><vscode-checkbox label="格式化" checked></vscode-checkbox></vscode-checkbox-group><vscode-radio-group variant="vertical" aria-label="语言"><vscode-radio name="language" label="中文" value="zh" checked default-checked></vscode-radio><vscode-radio name="language" label="英文" value="en"></vscode-radio><vscode-radio name="language" label="停用" disabled value="disabled"></vscode-radio></vscode-radio-group>`,
    '',
    380
  ),
  'radio-form': demo(
    '单选提交与默认恢复',
    [
      'name/value、checked/default-checked',
      'required、disabled、change 和表单重置',
    ],
    `<form><vscode-radio-group><vscode-radio name="mode" value="auto" label="自动" checked default-checked required></vscode-radio><vscode-radio name="mode" value="manual" label="手动"></vscode-radio><vscode-radio name="mode" value="locked" label="禁用" disabled></vscode-radio></vscode-radio-group><vscode-button type="submit">提交</vscode-button> <vscode-button type="reset" secondary>恢复默认</vscode-button></form><output aria-live="polite"></output>`,
    formScript,
    240
  ),
};
