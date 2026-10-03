// 综合工作台使用当前组件库；所有状态只保存在当前预览中。
export const workbench = {
  title: '项目工作台：资源、设置、任务与结果联动',
  height: 1580,
  html: `
<main class="workbench">
  <header class="workbench-heading"><div><vscode-icon name="project" size="24"></vscode-icon><strong>Nusys 项目工作台</strong></div><vscode-badge id="status">等待保存</vscode-badge></header>
  <vscode-toolbar-container aria-label="项目操作">
    <vscode-toolbar-button id="refresh" icon="refresh" label="刷新资源"></vscode-toolbar-button>
    <vscode-toolbar-button id="expand" icon="expand-all" label="展开目录"></vscode-toolbar-button>
    <vscode-toolbar-button id="menu-button" icon="ellipsis" label="更多操作"></vscode-toolbar-button>
  </vscode-toolbar-container>
  <vscode-context-menu id="menu"></vscode-context-menu>
  <vscode-divider></vscode-divider>
  <vscode-split-layout id="workspace" initial-handle-position="220px" min-start="140px" min-end="260px">
    <aside slot="start" class="explorer">
      <vscode-collapsible title="资源管理器" open><vscode-badge slot="decorations" variant="counter">3</vscode-badge>
        <vscode-scrollable style="height:170px" always-visible>
          <vscode-tree id="files" indent-guides="always" aria-label="项目文件">
            <vscode-tree-item open>nusys-demo
              <vscode-tree-item>src<vscode-tree-item data-file="main.ts"><vscode-icon slot="icon-leaf" name="file-code"></vscode-icon>main.ts</vscode-tree-item></vscode-tree-item>
              <vscode-tree-item data-file="README.md"><vscode-icon slot="icon-leaf" name="markdown"></vscode-icon>README.md</vscode-tree-item>
              <vscode-tree-item data-file="package.json"><vscode-icon slot="icon-leaf" name="json"></vscode-icon>package.json</vscode-tree-item>
            </vscode-tree-item>
          </vscode-tree>
        </vscode-scrollable>
      </vscode-collapsible>
      <vscode-form-helper>选择文件查看反馈。可拖动分隔条调整区域。</vscode-form-helper>
    </aside>
    <section slot="end" class="workspace-content">
      <vscode-tabs-group id="views">
        <vscode-tabs panel selected-index="0">
          <vscode-tab-header>项目设置 <vscode-badge variant="tab-header-counter">5</vscode-badge></vscode-tab-header>
          <vscode-tab-panel>
            <vscode-fieldset><fieldset><legend>项目配置（拖动重组视图）</legend>
            <form id="settings">
              <vscode-form-container id="dirty" mark-duration="forever">
                <vscode-fieldset><fieldset><legend>基本配置</legend>
                  <vscode-form-group><vscode-label for="project">项目名称</vscode-label><vscode-textfield id="project" name="project" value="nusys-demo" default-value="nusys-demo" required><vscode-icon slot="content-before" name="edit"></vscode-icon></vscode-textfield><vscode-form-helper>必填；修改后可保存或恢复默认。</vscode-form-helper></vscode-form-group>
                  <vscode-form-group><vscode-label for="language">开发语言</vscode-label><vscode-single-select id="language" name="language"><vscode-option value="ts" selected>TypeScript</vscode-option><vscode-option value="js">JavaScript</vscode-option></vscode-single-select></vscode-form-group>
                  <vscode-form-group><vscode-label for="formats">导出格式</vscode-label><vscode-multi-select id="formats" name="formats" required><vscode-option value="html" abbreviation="HTML" selected>网页</vscode-option><vscode-option value="md" abbreviation="MD">Markdown 文档</vscode-option><vscode-option value="json">JSON 数据</vscode-option></vscode-multi-select></vscode-form-group>
                  <vscode-form-group><vscode-label for="ratio">输出比例</vscode-label><vscode-textfield id="ratio" name="ratio" percentage value="0.25" default-value="0.25" min="0" max="1" step="0.05"></vscode-textfield><vscode-form-helper>显示百分数，提交 0 到 1 的小数。</vscode-form-helper></vscode-form-group>
                </fieldset></vscode-fieldset>
                <vscode-fieldset checkbox checked checkbox-label="启用自动化" unchecked-mode="collapsed"><fieldset><legend>自动化</legend>
                  <vscode-checkbox-group variant="horizontal"><vscode-checkbox name="checks" value="format" label="格式化" checked default-checked></vscode-checkbox><vscode-checkbox name="checks" value="lint" label="语法检查"></vscode-checkbox></vscode-checkbox-group>
                  <vscode-radio-group variant="horizontal"><vscode-radio name="mode" value="safe" label="安全模式" checked default-checked></vscode-radio><vscode-radio name="mode" value="fast" label="快速模式"></vscode-radio></vscode-radio-group>
                  <vscode-label for="notes">任务说明</vscode-label><vscode-textarea id="notes" name="notes" rows="2" resize="vertical" placeholder="记录这次构建的目标"></vscode-textarea>
                </fieldset></vscode-fieldset>
              </vscode-form-container>
              <div class="actions"><vscode-button type="submit" icon="save">保存设置</vscode-button><vscode-button type="reset" secondary>恢复默认</vscode-button></div>
            </form>
            </fieldset></vscode-fieldset>
          </vscode-tab-panel>
          <vscode-tab-header>操作日志</vscode-tab-header><vscode-tab-panel><pre id="log">等待操作。</pre></vscode-tab-panel>
        </vscode-tabs>
      </vscode-tabs-group>
      <vscode-tabs-group id="destination" empty-text="拖动设置标签页或分区标题到此处创建新视图"></vscode-tabs-group>
      <vscode-divider></vscode-divider>
      <section class="tasks" aria-label="构建任务">
        <div class="actions"><vscode-button-group><vscode-button id="run" icon="play">运行任务</vscode-button><vscode-button id="cancel" secondary>取消任务</vscode-button></vscode-button-group><vscode-progress-ring id="busy" aria-label="任务正在运行" hidden></vscode-progress-ring></div>
        <vscode-progress-bar id="progress" max="100" value="0" aria-label="任务进度"></vscode-progress-bar>
        <vscode-table responsive breakpoint="500" zebra bordered-columns>
          <vscode-table-header><vscode-table-header-cell>文件</vscode-table-header-cell><vscode-table-header-cell>任务</vscode-table-header-cell><vscode-table-header-cell>状态</vscode-table-header-cell></vscode-table-header>
          <vscode-table-body><vscode-table-row><vscode-table-cell column-label="文件">main.ts</vscode-table-cell><vscode-table-cell column-label="任务">编译组件</vscode-table-cell><vscode-table-cell column-label="状态"><vscode-badge class="task-state">等待</vscode-badge></vscode-table-cell></vscode-table-row><vscode-table-row><vscode-table-cell column-label="文件">README.md</vscode-table-cell><vscode-table-cell column-label="任务">生成文档</vscode-table-cell><vscode-table-cell column-label="状态"><vscode-badge class="task-state">等待</vscode-badge></vscode-table-cell></vscode-table-row></vscode-table-body>
        </vscode-table>
      </section>
    </section>
  </vscode-split-layout>
  <output id="feedback" aria-live="polite">选择资源、调整设置或运行任务，体验组件联动。</output>
</main>`,
  css: `
body{padding:16px}#busy[hidden]{display:none}.workbench{max-width:1200px;margin:auto}.workbench-heading,.workbench-heading>div,.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.workbench-heading{justify-content:space-between;margin-bottom:12px}.workbench-heading strong{font-size:18px}
#workspace{height:1250px}.explorer{padding:8px}.workspace-content{min-width:0;padding:8px 16px;overflow:auto}#settings vscode-textfield,#settings vscode-single-select,#settings vscode-multi-select,#settings vscode-textarea{width:100%}#settings vscode-fieldset{margin-bottom:12px}#destination{min-height:72px;margin-top:12px;border:1px dashed var(--vscode-panel-border);border-radius:4px}.tasks{margin-top:16px}#progress{display:block;margin:16px 0}#log{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}#feedback{border-top:1px solid var(--vscode-panel-border);padding-top:12px;margin-top:12px}
@media(max-width:600px){.workspace-content{padding:8px}.workbench-heading strong{font-size:15px}.explorer{padding:0}#workspace{height:1250px}}`,
  js: `
const $ = selector => document.querySelector(selector);
const feedback = message => { $('#feedback').textContent = message; $('#log').textContent += '\\n' + message; };
$('#formats').defaultValue = ['html'];
$('#language').defaultValue = 'ts';
document.querySelectorAll('vscode-form-group').forEach(group => group.variant = 'vertical');
if (matchMedia('(max-width:600px)').matches) { $('#workspace').split = 'horizontal'; $('#workspace').initialHandlePosition = '240px'; $('#workspace').updateComplete.then(() => $('#workspace').resetHandlePosition()); }
$('#settings').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.target);
  const result = {project:data.get('project'), language:data.get('language'), formats:data.getAll('formats'), ratio:data.get('ratio'), checks:data.getAll('checks'), mode:data.get('mode'), notes:data.get('notes')};
  feedback('已保存：' + JSON.stringify(result));
  $('#dirty').reset(); $('#status').textContent = '已保存';
});
$('#settings').addEventListener('reset', () => { $('#dirty').reset(); $('#status').textContent = '已恢复'; feedback('已恢复默认配置'); });
$('#files').addEventListener('vsc-tree-select', event => feedback('资源：' + event.detail.map(item=>item.dataset.file || item.textContent.trim()).join('、')));
$('#refresh').addEventListener('click', () => feedback('已刷新本地资源列表'));
$('#expand').addEventListener('click', () => $('#files').expandAll());
$('#menu').data = [{label:'展开全部目录',value:'expand'},{separator:true},{label:'切换到操作日志',value:'log'}];
$('#menu-button').addEventListener('click', event => {event.stopPropagation();$('#menu').show=true;});
$('#menu').addEventListener('vsc-context-menu-select', event => {if(event.detail.value==='expand')$('#files').expandAll();else document.querySelector('vscode-tabs').selectedIndex=1;feedback('菜单：'+event.detail.value);});
document.querySelectorAll('vscode-tabs-group').forEach(group=>group.addEventListener('vsc-tabs-group-layout-change',()=>feedback('已更新视图布局')));
let timer;
function stop(message) {clearInterval(timer);timer=undefined;$('#busy').hidden=true;$('#run').disabled=false;document.querySelectorAll('.task-state').forEach(el=>el.textContent=message);feedback(message);}
$('#run').addEventListener('click', () => {
  clearInterval(timer);$('#progress').value=0;$('#busy').hidden=false;$('#run').disabled=true;
  document.querySelectorAll('.task-state').forEach(el=>el.textContent='运行中');feedback('开始构建');
  timer=setInterval(()=>{ $('#progress').value=Math.min(100,$('#progress').value+20);if($('#progress').value===100)stop('构建完成');},400);
});
$('#cancel').addEventListener('click',()=>stop('任务已取消'));
window.addEventListener('pagehide',()=>clearInterval(timer));`,
};
