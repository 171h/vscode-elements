// 原生鼠标拖拽冒烟测试：先运行 `pnpm start --port 8096 --host 127.0.0.1`
// 再运行 `node scripts/test-tabs-drag.mjs [服务器 URL]`。
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({headless: true});
try {
  const page = await browser.newPage({viewport: {width: 1100, height: 800}});
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(
    `${process.argv[2] || 'http://127.0.0.1:8096'}/dev/vscode-tabs/drag-drop.html`
  );
  await page.waitForFunction(() => document.querySelector('legend')?.draggable);
  const tabs = page.locator('vscode-tabs').first();
  const legends = tabs.locator('legend');
  const first = await legends.first().boundingBox();
  const outline = await tabs.locator('fieldset').nth(1).boundingBox();
  await page.mouse.move(first.x + 15, first.y + 10);
  await page.mouse.down();
  await page.mouse.move(first.x + 25, first.y + 25, {steps: 8});
  await page.mouse.move(outline.x + 80, outline.y + outline.height * 0.8, {
    steps: 12,
  });
  await page.mouse.move(outline.x + 81, outline.y + outline.height * 0.8);
  await page.waitForFunction(() =>
    document
      .querySelector('vscode-tabs')
      .shadowRoot.querySelector('[data-vsc-drop-indicator]')
  );
  await page.screenshot({path: 'coverage/screenshots/tabs-drag-overlay.png'});
  await page.mouse.up();
  assert.deepEqual(await legends.allTextContents(), [
    '大纲',
    '文件',
    '时间线',
    '搜索结果',
  ]);
  assert.equal(
    await tabs.locator('input').first().inputValue(),
    '移动时保留此值'
  );

  const files = await legends.nth(1).boundingBox();
  const search = await tabs.locator('vscode-tab-header').nth(1).boundingBox();
  await page.mouse.move(files.x + 15, files.y + 10);
  await page.mouse.down();
  await page.mouse.move(files.x + 30, files.y + 25, {steps: 8});
  await page.mouse.move(
    search.x + search.width / 2,
    search.y + search.height / 2,
    {steps: 12}
  );
  await page.mouse.move(
    search.x + search.width / 2 + 1,
    search.y + search.height / 2
  );
  await page.waitForFunction(
    () => document.querySelector('vscode-tabs').selectedIndex === 1
  );
  await page.mouse.up();
  assert.deepEqual(
    await tabs
      .locator('vscode-tab-panel')
      .nth(1)
      .locator('legend')
      .allTextContents(),
    ['搜索结果', '文件']
  );
  await page.screenshot({path: 'coverage/screenshots/tabs-drag-result.png'});
  // 拖拽容器时可显示另一标签页面板，并将全部视图合并到其中。
  const searchHeader = await tabs
    .locator('vscode-tab-header')
    .nth(1)
    .boundingBox();
  const explorerHeader = await tabs
    .locator('vscode-tab-header')
    .first()
    .boundingBox();
  await page.mouse.move(
    searchHeader.x + searchHeader.width / 2,
    searchHeader.y + 10
  );
  await page.mouse.down();
  await page.mouse.move(searchHeader.x + 20, searchHeader.y + 25, {steps: 8});
  await page.mouse.move(
    explorerHeader.x + explorerHeader.width / 2,
    explorerHeader.y + 10,
    {steps: 12}
  );
  await page.mouse.move(
    explorerHeader.x + explorerHeader.width / 2 + 1,
    explorerHeader.y + 10
  );
  await page.waitForFunction(
    () => document.querySelector('vscode-tabs').selectedIndex === 0
  );
  const explorerPanel = await tabs
    .locator('vscode-tab-panel')
    .first()
    .boundingBox();
  await page.mouse.move(
    explorerPanel.x + 15,
    explorerPanel.y + explorerPanel.height - 4,
    {steps: 12}
  );
  await page.mouse.move(
    explorerPanel.x + 16,
    explorerPanel.y + explorerPanel.height - 4
  );
  await page.mouse.up();
  assert.equal(await tabs.locator('vscode-tab-header').count(), 2);
  assert.deepEqual(
    await tabs
      .locator('vscode-tab-panel')
      .first()
      .locator('legend')
      .allTextContents(),
    ['大纲', '时间线', '搜索结果', '文件']
  );
  assert.deepEqual(errors, []);
  console.log('原生鼠标拖拽、遮罩、悬停激活、标题合并与状态保留检查通过。');
} finally {
  await browser.close();
}
