import assert from 'node:assert/strict';
import {componentScenarios} from '../docs/data/scenarios.mjs';

export async function testResponsiveTable(frame) {
  const width = frame.getByRole('slider', {name: '容器宽度'});
  await width.focus();
  await width.press('Home');
  await frame.waitForFunction(
    () => document.querySelector('vscode-table').compact
  );
  assert.equal(await width.inputValue(), '240');
  await width.press('End');
  await frame.waitForFunction(
    () => !document.querySelector('vscode-table').compact
  );
  assert.equal(await width.inputValue(), '800');
  await frame.waitForFunction(() => {
    const container = document.querySelector('#table-container');
    return (
      document.querySelector('#container-width-value').textContent ===
      Math.round(container.getBoundingClientRect().width) + ' px'
    );
  });
  const widths = await frame
    .locator('vscode-table')
    .evaluateAll((tables) =>
      tables.map((table) => table.getBoundingClientRect().width)
    );
  assert.ok(
    widths[0] > 350 && Math.abs(widths[0] - widths[1]) < 1,
    '两张表格应随同一容器变宽'
  );
  assert.equal(
    await frame
      .locator('vscode-table')
      .nth(1)
      .evaluate((table) => table.delayedResizing),
    true
  );
  await width.press('Home');
  await frame.waitForFunction(
    () => document.querySelector('vscode-table').compact
  );
}

export async function testScenarios(page, url) {
  const open = async (id) => {
    const component = Object.keys(componentScenarios).find((key) =>
      componentScenarios[key].includes(id)
    );
    await page.goto(url(`components/${component}`));
    const element = await page
      .locator(`[data-scenario="${id}"] iframe`)
      .elementHandle();
    const frame = await element.contentFrame();
    await frame.waitForFunction(
      () => document.documentElement.dataset.ready === 'true'
    );
    return frame;
  };
  let frame = await open('tooltip-controls');
  const tip = frame.locator('#action-tip');
  await frame.getByRole('button', {name: '保存', exact: true}).hover();
  await frame.getByRole('tooltip', {name: '保存当前项目'}).waitFor();
  await frame.getByRole('button', {name: '提示导出操作', exact: true}).click();
  await frame.getByText('提示关联导出操作', {exact: true}).waitFor();
  await frame.getByRole('button', {name: '导出', exact: true}).focus();
  await frame.getByRole('tooltip', {name: '导出当前计算结果'}).waitFor();
  await page.keyboard.press('Escape');
  await tip.locator('.tooltip').waitFor({state: 'hidden'});
  await frame.getByText('禁用提示', {exact: true}).click();
  await frame.getByRole('button', {name: '导出', exact: true}).focus();
  assert.equal(await tip.evaluate((element) => element.disabled), true);
  assert.equal(
    await frame
      .locator('#tooltip-export')
      .evaluate((element) => element.disabled),
    false
  );
  await tip.locator('.tooltip').waitFor({state: 'hidden'});

  frame = await open('button-form');
  await frame.locator('vscode-textfield input').fill('修改项目');
  await frame.getByRole('button', {name: '提交', exact: true}).click();
  assert.match(await frame.locator('output').textContent(), /修改项目/);
  await frame.getByRole('button', {name: '重置', exact: true}).click();
  assert.equal(
    await frame.locator('vscode-textfield input').inputValue(),
    '初始项目'
  );

  frame = await open('button-group-menu');
  await frame.getByRole('button', {name: '更多任务'}).click();
  await frame.locator('vscode-context-menu-item').first().click();
  assert.equal(await frame.locator('output').textContent(), 'all');

  frame = await open('progress-control');
  await frame.getByRole('button', {name: '推进 40'}).click();
  await frame.waitForFunction(
    () => document.querySelector('vscode-progress-bar').value === 40
  );
  await frame.getByRole('button', {name: '完成', exact: true}).click();
  await frame.waitForFunction(
    () => document.querySelector('vscode-progress-bar').value === 200
  );

  frame = await open('progress-ring-task');
  await frame.getByRole('button', {name: '开始加载'}).click();
  assert.equal(await frame.locator('#loading').isVisible(), true);
  await frame.getByRole('button', {name: '取消', exact: true}).click();
  assert.equal(await frame.locator('#loading').isVisible(), false);

  frame = await open('textfield-slots');
  await frame.locator('vscode-textfield input').fill('含 空格');
  await frame.getByRole('button', {name: '校验路径'}).click();
  assert.equal(await frame.locator('output').textContent(), '路径不能包含空格');
  await frame.getByRole('button', {name: '清除错误'}).click();
  assert.equal(
    await frame
      .locator('vscode-textfield')
      .evaluate((el) => el.checkValidity()),
    true
  );

  frame = await open('textfield-file');
  await frame.locator('input[type="file"]').setInputFiles({
    name: 'demo.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('演示内容'),
  });
  await frame.getByText('demo.txt', {exact: true}).waitFor();

  frame = await open('select-options');
  await frame.getByRole('button', {name: '替换数据'}).click();
  assert.equal(
    await frame.locator('vscode-single-select').evaluate((el) => el.value),
    'yaml'
  );
  await frame.getByRole('button', {name: '打开上方列表'}).click();
  await frame.getByRole('option', {name: 'JSON', exact: true}).click();
  assert.equal(await frame.locator('output').textContent(), 'json');

  frame = await open('multi-form');
  await page
    .locator('[data-scenario="multi-form"] iframe')
    .scrollIntoViewIfNeeded();
  await frame.locator('vscode-multi-select').evaluate((el) => {
    el.open = true;
  });
  await frame.locator('vscode-multi-select #select-all').click();
  await frame.locator('vscode-multi-select .button-accept').click();
  await frame.getByRole('button', {name: '提交全部值'}).click();
  assert.deepEqual(JSON.parse(await frame.locator('output').textContent()), [
    'html',
    'md',
    'json',
  ]);
  await frame.getByRole('button', {name: '选择前两项'}).click();
  await frame.getByRole('button', {name: '提交全部值'}).click();
  assert.deepEqual(JSON.parse(await frame.locator('output').textContent()), [
    'html',
    'md',
  ]);
  await frame.getByRole('button', {name: '恢复默认'}).click();
  await frame.waitForFunction(
    () =>
      JSON.stringify(document.querySelector('vscode-multi-select').value) ===
      '["html"]'
  );

  frame = await open('multi-combobox');
  await frame.getByRole('button', {name: '选择全部'}).click();
  assert.equal(
    JSON.parse(await frame.locator('output').textContent()).length,
    4
  );

  frame = await open('form-dirty-controls');
  await frame.locator('vscode-textfield input').fill('新名称');
  await frame.waitForFunction(
    () => document.querySelector('vscode-form-container').dirty
  );
  await frame.getByRole('button', {name: '清除修改标记'}).click();
  await frame.waitForFunction(
    () => !document.querySelector('vscode-form-container').dirty
  );

  frame = await open('fieldset-modes');
  for (const mode of ['visible', 'collapsed', 'minimal']) {
    const fieldset = frame.locator(`vscode-fieldset[unchecked-mode="${mode}"]`);
    await fieldset.locator('vscode-checkbox').first().click();
    await frame.waitForFunction(
      (mode) =>
        document.querySelector(
          `vscode-fieldset[unchecked-mode="${mode}"] vscode-textfield`
        ).disabled,
      mode
    );
    if (mode !== 'visible') await fieldset.waitFor({state: 'visible'});
    await fieldset.locator('vscode-checkbox').first().click();
    await frame.waitForFunction(
      (mode) =>
        !document.querySelector(
          `vscode-fieldset[unchecked-mode="${mode}"] vscode-textfield`
        ).disabled,
      mode
    );
  }
  frame = await open('fieldset-callback');
  await frame.locator('vscode-fieldset vscode-checkbox').first().click();
  assert.match(await frame.locator('output').textContent(), /checked=false/);
  assert.equal(
    await frame.locator('vscode-textfield').evaluate((el) => el.disabled),
    false
  );

  frame = await open('scrollable-controls');
  await frame.getByRole('button', {name: '滚动到底部'}).click();
  await frame.waitForFunction(() => {
    const el = document.querySelector('vscode-scrollable');
    return el.scrollPos > 0 && el.scrollPos === el.scrollMax;
  });
  await frame.getByRole('button', {name: '回到顶部'}).click();
  await frame.waitForFunction(
    () => document.querySelector('vscode-scrollable').scrollPos === 0
  );

  frame = await open('split-controls');
  await frame.locator('#fixed').selectOption('end');
  assert.equal(
    await frame.locator('vscode-split-layout').evaluate((el) => el.fixedPane),
    'end'
  );
  await frame.getByRole('button', {name: '恢复初始分栏'}).click();

  frame = await open('tabs-panel');
  await frame.getByRole('button', {name: '显示设置'}).click();
  await frame.waitForFunction(
    () => document.querySelector('vscode-tabs').selectedIndex === 0
  );

  frame = await open('table-variants');
  await frame.locator('#look').selectOption('bordered-rows');
  assert.equal(
    await frame.locator('vscode-table').evaluate((el) => el.borderedRows),
    true
  );
  await frame.getByRole('button', {name: '打开 1', exact: true}).click();
  assert.equal(await frame.locator('output').textContent(), '打开 1');

  await page.setViewportSize({width: 1440, height: 1000});
  frame = await open('table-responsive');
  await testResponsiveTable(frame);

  frame = await open('tree-controls');
  await frame.getByRole('button', {name: '展开全部'}).click();
  await frame.getByRole('button', {name: '收起全部'}).click();
  await frame.getByRole('button', {name: '定位 README'}).click();
  assert.match(await frame.locator('output').textContent(), /\[0,1\]/);
  console.log(
    '已验证新增场景的表单重置、菜单、进度、文件读取、动态选项、多选提交、修改标记、分区回调、滚动、分栏、标签页、表格和树操作。'
  );
}
