import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, stat, mkdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {components} from '../docs/data/components.mjs';
import {componentScenarios} from '../docs/data/scenarios.mjs';
import {testScenarios} from './docs-scenarios-test.mjs';
import {testShowcase} from './docs-showcase-test.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'docs/.vitepress/dist');
await stat(resolve(dist, 'index.html'));
const base = process.env.DOCS_BASE || '/';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
};
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname
    );
    if (!path.startsWith(base)) throw new Error('路径不属于文档站点');
    const local = path.slice(base.length);
    const target = resolve(dist, local || 'index.html');
    if (!target.startsWith(dist + sep) && target !== dist)
      throw new Error('路径越界');
    const candidates = extname(target)
      ? [target]
      : [target + '.html', resolve(target, 'index.html')];
    let file;
    for (const candidate of candidates)
      if (
        await stat(candidate).then(
          (info) => info.isFile(),
          () => false
        )
      ) {
        file = candidate;
        break;
      }
    if (!file) throw new Error('页面不存在');
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('页面不存在');
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = (path = '') => `${origin}${base}${path}`;
const browser = await chromium.launch({
  headless: true,
  channel: 'chromium-headless-shell',
});
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(origin))
      errors.push(`${response.status()}: ${response.url()}`);
  });
  const open = async (id, index = 0) => {
    await page.goto(url(`components/${id}`));
    await page.locator('.example-frame').nth(index).waitFor();
    const frame = page.frames().filter((candidate) => candidate.parentFrame())[
      index
    ];
    assert.ok(frame, `${id} 缺少预览`);
    await frame.waitForFunction(
      () => document.documentElement.dataset.ready === 'true'
    );
    return frame;
  };
  const selectTheme = async (id) => {
    await page.locator('vscode-theme-selector select').selectOption(id);
    await page.waitForFunction(
      (theme) =>
        document.documentElement.style.getPropertyValue(
          '--vscode-editor-background'
        ) && localStorage.getItem('vscode-playground:theme') === theme,
      id
    );
    for (const frame of page
      .frames()
      .filter((candidate) => candidate.parentFrame()))
      await frame.waitForFunction(
        (theme) => document.documentElement.dataset.themeId === theme,
        id
      );
  };
  const selectSize = async (size) => {
    await page.locator('.VPNavBar .global-size-selector').selectOption(size);
    for (const frame of page
      .frames()
      .filter((candidate) => candidate.parentFrame()))
      await frame.waitForFunction(
        (size) => document.documentElement.dataset.previewSize === size,
        size
      );
  };
  await page.goto(url());
  await page.getByRole('heading', {name: '为 VS Code 扩展构建界面'}).waitFor();
  await page.getByRole('combobox', {name: '全站主题', exact: true}).waitFor();
  assert.equal(await page.locator('vscode-theme-selector label').count(), 0);
  await page.getByRole('combobox', {name: '全站尺寸', exact: true}).waitFor();
  assert.equal(await page.locator('.global-theme-bar label').count(), 0);
  await mkdir(resolve(root, '.wireit/docs-screenshots'), {recursive: true});
  await page.screenshot({
    path: resolve(root, '.wireit/docs-screenshots/home.png'),
    fullPage: true,
  });
  for (const component of components) {
    const frame = await open(component.id);
    for (const id of componentScenarios[component.id]) {
      const preview = page.locator(`[data-scenario="${id}"] iframe`);
      await preview.waitFor();
      const scenarioFrame = await (
        await preview.elementHandle()
      ).contentFrame();
      await scenarioFrame.waitForFunction(
        () => document.documentElement.dataset.ready === 'true'
      );
    }
    await selectTheme('dark-v2');
    await selectTheme('light-v2');
    await selectSize('large');
    await selectSize('medium');
    assert.equal(await page.locator('vscode-theme-selector').count(), 1);
    assert.equal(await page.locator('.VPSwitchAppearance').count(), 0);
    assert.equal(
      await page.locator('.example select').count(),
      0,
      '子页面不得保留主题或尺寸选择器'
    );
    assert.ok(
      await frame.locator(`vscode-${component.id}`).count(),
      `${component.id} 的示例没有展示目标组件`
    );
    assert.ok(
      await frame
        .locator(`vscode-${component.id}`)
        .first()
        .evaluate((element) => !!element.shadowRoot),
      `${component.id} 未注册`
    );
    const response = await page.request.get(
      url(`api/generated/${component.id}`)
    );
    assert.equal(response.status(), 200, `${component.id} API 未构建`);
  }

  let frame = await open('button');
  const sample = page.locator('.example').first();
  for (const theme of [
    'light',
    'light-v2',
    'light-quiet',
    'light-solarized',
    'dark',
    'dark-v2',
    'dark-solarized',
    'dark-monokai',
    'hc-light',
    'hc-dark',
  ]) {
    await selectTheme(theme);
    for (const size of ['small', 'medium', 'large']) {
      await selectSize(size);
      frame = page.frames().find((candidate) => candidate.parentFrame());
      await frame.waitForFunction(
        () => document.documentElement.dataset.ready === 'true'
      );
      assert.equal(
        await frame.locator('vscode-button').first().getAttribute('size'),
        size
      );
      await selectTheme(theme);
      const token = '--vscode-editor-background';
      assert.equal(
        await frame.evaluate(
          (name) =>
            getComputedStyle(document.documentElement).getPropertyValue(name),
          token
        ),
        await page.evaluate(
          (name) =>
            getComputedStyle(document.documentElement).getPropertyValue(name),
          token
        )
      );
      assert.equal(
        await frame
          .locator('vscode-button[disabled]')
          .evaluate((element) => element.disabled && element.tabIndex === -1),
        true
      );
      const contrast = await frame
        .locator('vscode-button')
        .first()
        .evaluate((element) => {
          const css = getComputedStyle(
            element.shadowRoot.querySelector('[part="base"]')
          );
          return {color: css.color, background: css.backgroundColor};
        });
      assert.notEqual(contrast.color, contrast.background);
    }
  }
  await selectTheme('light');
  await selectSize('medium');
  frame = page.frames().find((candidate) => candidate.parentFrame());
  await frame.waitForFunction(
    () => document.documentElement.dataset.ready === 'true'
  );
  await frame.getByRole('button', {name: '保存', exact: true}).focus();
  await page.keyboard.press('Tab');
  assert.equal(
    await frame.evaluate(() => document.activeElement?.textContent?.trim()),
    '取消'
  );
  await page.screenshot({
    path: resolve(root, '.wireit/docs-screenshots/button.png'),
    fullPage: true,
  });
  await sample.getByRole('button', {name: '代码', exact: true}).click();
  assert.match(await sample.locator('code').textContent(), /vscode-button/);

  frame = await open('textfield', 1);
  const input = frame.locator('vscode-textfield input');
  assert.equal(await input.inputValue(), '12.5%');
  await input.focus();
  await input.press('ControlOrMeta+A');
  await input.press('Backspace');
  await input.pressSequentially('25');
  await input.blur();
  assert.equal(
    await frame
      .locator('vscode-textfield')
      .evaluate((element) => element.value),
    '0.25'
  );
  await frame.getByRole('button', {name: '读取表单'}).click();
  await frame.getByText('提交值：0.25', {exact: true}).waitFor();
  await selectTheme('dark-monokai');
  assert.equal(await input.inputValue(), '25%', '主题切换不得清空输入');
  await selectSize('large');
  assert.equal(await input.inputValue(), '25%', '尺寸切换不得清空输入');
  await page.reload();
  await page.locator('vscode-theme-selector select').waitFor();
  assert.equal(
    await page.locator('vscode-theme-selector select').inputValue(),
    'dark-monokai'
  );
  assert.equal(
    await page.locator('.global-size-selector').inputValue(),
    'large'
  );
  await selectSize('medium');
  await selectTheme('light');

  frame = await open('form-container');
  await frame.locator('vscode-textfield input').fill('新项目');
  await frame.waitForFunction(
    () => document.querySelector('vscode-form-container').dirty
  );
  await frame.getByRole('button', {name: '保存', exact: true}).click();
  assert.match(await frame.locator('output').textContent(), /新项目/);

  frame = await open('fieldset');
  await frame.locator('vscode-fieldset').evaluate((element) => {
    element.checked = false;
  });
  await frame.waitForFunction(
    () => document.querySelector('vscode-textfield').disabled
  );
  await frame.locator('vscode-fieldset').evaluate((element) => {
    element.checked = true;
  });
  await frame.waitForFunction(
    () => !document.querySelector('vscode-textfield').disabled
  );

  frame = await open('single-select');
  await frame.locator('vscode-single-select').click();
  await frame.getByRole('option', {name: 'JavaScript', exact: true}).click();
  await frame.getByText('当前值：js', {exact: true}).waitFor();

  frame = await open('multi-select');
  await frame.locator('vscode-multi-select').click();
  await frame.getByRole('option', {name: 'JSON 数据', exact: true}).click();
  assert.deepEqual(
    await frame
      .locator('vscode-multi-select')
      .evaluate((element) => element.value),
    ['html', 'markdown', 'json']
  );

  frame = await open('tabs');
  await frame.locator('vscode-tab-header').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await frame.waitForFunction(
    () => document.querySelector('vscode-tabs').selectedIndex === 1
  );
  const headers = frame.locator('vscode-tab-header');
  const reorderTarget = headers.nth(1);
  const reorderRect = await reorderTarget.boundingBox();
  assert.ok(reorderRect, '排序目标标题必须可见');
  // 释放在右半区，避免正中点的像素取整改变插入方向。
  await headers.first().dragTo(reorderTarget, {
    targetPosition: {x: reorderRect.width - 5, y: reorderRect.height / 2},
  });
  await frame.waitForFunction(
    () => document.querySelector('vscode-tab-header').textContent === '搜索'
  );

  await frame.locator('vscode-tab-header').filter({hasText: '文件'}).click();
  const activePanel = frame.locator('vscode-tab-panel:not([hidden])');
  await activePanel.locator('vscode-textfield input').fill('保留筛选值');
  const targetView = activePanel.locator('fieldset').nth(1);
  const targetRect = await targetView.boundingBox();
  await activePanel
    .locator('legend')
    .first()
    .dragTo(targetView, {targetPosition: {x: 30, y: targetRect.height - 5}});
  assert.deepEqual(await activePanel.locator('legend').allTextContents(), [
    '大纲',
    '资源管理器',
  ]);
  assert.equal(
    await activePanel.locator('vscode-textfield input').inputValue(),
    '保留筛选值'
  );

  frame = await open('tabs-group');
  const bar = frame.locator('vscode-tabs .header');
  const barRect = await bar.boundingBox();
  await bar.dragTo(frame.locator('vscode-tabs-group').nth(1), {
    sourcePosition: {x: barRect.width - 10, y: barRect.height / 2},
  });
  await frame.waitForFunction(() =>
    document
      .querySelectorAll('vscode-tabs-group')[1]
      .querySelector('vscode-tabs')
  );

  frame = await open('tree');
  await frame.locator('vscode-tree-item').last().click();
  await frame.getByText('选中数量：1', {exact: true}).waitFor();

  frame = await open('context-menu');
  await frame.getByRole('button', {name: '显示菜单'}).click();
  await frame.locator('vscode-context-menu-item').first().click();
  await frame.getByText('操作：copy', {exact: true}).waitFor();

  await page.goto(url('examples/csp-check.html'));
  await page.getByRole('button', {name: '保存'}).click();
  await page.getByText('脚本与组件加载成功', {exact: true}).waitFor();
  assert.equal(
    await page
      .locator('vscode-icon')
      .evaluate((element) => !!element.shadowRoot.querySelector('link')?.nonce),
    true
  );

  await page.goto(url('api/generated/textfield'));
  await selectTheme('hc-dark');
  await page.screenshot({
    path: resolve(root, '.wireit/docs-screenshots/api.png'),
    fullPage: false,
  });
  await page.goto(url());
  await selectTheme('light-quiet');
  for (const width of [320, 390, 768, 960, 1280, 1440]) {
    await page.setViewportSize({width, height: 1000});
    const controls = page.locator('.VPNavBar .global-theme-bar');
    const box = await controls.boundingBox();
    assert.ok(
      box && box.y < 64 && box.x + box.width <= width,
      `导航栏控件必须在 ${width}px 屏幕内`
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      ),
      true,
      `${width}px 导航栏不应横向溢出`
    );
    await selectTheme('dark-v2');
    await selectSize('small');
  }
  await page.setViewportSize({width: 1440, height: 1000});
  await selectSize('medium');
  await page.getByRole('button', {name: '搜索文档', exact: true}).click();
  await page.locator('#localsearch-input').fill('百分比');
  await page
    .locator('.VPLocalSearchBox .result')
    .filter({hasText: '百分比'})
    .first()
    .waitFor();
  await page.keyboard.press('Escape');
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(url('components/button'));
  await selectTheme('hc-light');
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    ),
    true,
    '移动端不应出现页面横向溢出'
  );
  await page.screenshot({
    path: resolve(root, '.wireit/docs-screenshots/mobile.png'),
    fullPage: true,
  });
  await page.getByRole('button', {name: '目录', exact: true}).click();
  await page
    .locator('.VPSidebar')
    .getByText('快速开始', {exact: true})
    .waitFor();
  await testScenarios(page, url);
  await testShowcase(
    page,
    url,
    selectTheme,
    resolve(root, '.wireit/docs-screenshots')
  );
  assert.deepEqual(errors, [], '页面不得出现运行时或本地资源错误');
  console.log(
    '已验证全部组件与 API 页面、十种主题与三种尺寸、焦点与禁用、百分比提交、表单高亮、fieldset 恢复、选择框、标签与视图及组拖拽、菜单、树、CSP、中文搜索和移动布局。'
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
