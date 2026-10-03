import assert from 'node:assert/strict';
import {components} from '../docs/data/components.mjs';

export async function testShowcase(page, url, selectTheme, screenshots) {
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto(url('examples/showcase'));
  const element = await page.locator('[data-workbench] iframe').elementHandle();
  const frame = await element.contentFrame();
  await frame.waitForFunction(
    () => document.documentElement.dataset.ready === 'true'
  );
  assert.equal(await page.locator('[data-gallery-component]').count(), 40);
  assert.equal(
    await page.locator('.gallery iframe').count(),
    0,
    '关闭卡片时不加载预览'
  );
  await frame.locator('#project input').fill('综合演示');
  const ratio = frame.locator('#ratio input');
  await ratio.focus();
  await ratio.press('ControlOrMeta+A');
  await ratio.press('Backspace');
  await ratio.pressSequentially('35');
  await frame.locator('#formats').evaluate((el) => (el.value = ['html', 'md']));
  for (const theme of ['dark-v2', 'hc-light', 'light-v2']) {
    await selectTheme(theme);
    assert.equal(
      await frame.locator('#project input').inputValue(),
      '综合演示'
    );
    assert.equal(await frame.locator('#ratio input').inputValue(), '35%');
  }
  await frame.getByRole('button', {name: '保存设置', exact: true}).click();
  const result = JSON.parse(
    (await frame.locator('#feedback').textContent()).replace('已保存：', '')
  );
  assert.equal(result.project, '综合演示');
  assert.equal(result.ratio, '0.35');
  assert.deepEqual(result.formats, ['html', 'md']);
  await frame.getByRole('button', {name: '恢复默认', exact: true}).click();
  await frame.waitForFunction(
    () => document.querySelector('#project').value === 'nusys-demo'
  );
  await frame.getByRole('button', {name: '运行任务', exact: true}).click();
  await frame.waitForFunction(
    () => document.querySelector('#progress').value > 0
  );
  await frame.getByRole('button', {name: '取消任务', exact: true}).click();
  assert.equal(await frame.locator('#feedback').textContent(), '任务已取消');
  assert.equal(await frame.locator('#busy').isVisible(), false);
  await frame.getByRole('button', {name: '运行任务', exact: true}).click();
  await frame.waitForFunction(
    () => document.querySelector('#progress').value === 100
  );
  assert.equal(await frame.locator('#feedback').textContent(), '构建完成');
  await frame.locator('#menu-button').click();
  await frame.locator('vscode-context-menu-item').first().waitFor();
  const tags = await frame.evaluate(() => {
    const tags = new Set();
    const visit = (root) => {
      for (const el of root.querySelectorAll('*')) {
        tags.add(el.localName);
        if (el.shadowRoot) visit(el.shadowRoot);
      }
    };
    visit(document);
    return Array.from(tags);
  });
  for (const component of components)
    assert.ok(
      tags.includes(`vscode-${component.id}`),
      `工作台缺少 ${component.id}`
    );
  await frame.locator('vscode-context-menu-item').first().click();
  await frame.locator('[data-file="README.md"]').click();
  assert.match(await frame.locator('#feedback').textContent(), /README.md/);
  await page.setViewportSize({width: 1440, height: 2000});
  await frame
    .locator('legend')
    .filter({hasText: '项目配置（拖动重组视图）'})
    .dragTo(frame.locator('#destination'));
  await frame.waitForFunction(() =>
    document.querySelector('#destination #settings')
  );
  assert.equal(
    await frame.locator('#project input').inputValue(),
    'nusys-demo'
  );
  await frame.getByRole('button', {name: '保存设置', exact: true}).click();
  assert.match(await frame.locator('#feedback').textContent(), /已保存/);
  await page.screenshot({
    path: `${screenshots}/showcase-desktop.png`,
    fullPage: false,
  });

  await page.getByRole('searchbox', {name: '查找组件'}).fill('multi-select');
  assert.equal(await page.locator('[data-gallery-component]').count(), 1);
  await page.locator('[data-gallery-component="multi-select"] summary').click();
  await page
    .locator('[data-gallery-component="multi-select"] iframe')
    .first()
    .waitFor();
  await selectTheme('dark-monokai');
  await page.locator('[data-gallery-component="multi-select"] summary').click();
  await page.waitForFunction(
    () => document.querySelectorAll('.gallery iframe').length === 0
  );
  assert.equal(await page.locator('.gallery iframe').count(), 0);
  await page.getByRole('searchbox', {name: '查找组件'}).fill('不匹配的组件');
  await page
    .getByText('没有匹配的组件，请调整关键词。', {exact: true})
    .waitFor();
  await page.getByRole('searchbox', {name: '查找组件'}).fill('');
  for (const component of components) {
    const card = page.locator(`[data-gallery-component="${component.id}"]`);
    await card.locator('summary').click();
    await card.locator('iframe').first().waitFor();
    for (const iframe of await card.locator('iframe').elementHandles()) {
      const preview = await iframe.contentFrame();
      await preview.waitForFunction(
        () => document.documentElement.dataset.ready === 'true'
      );
      await preview.waitForFunction(
        () => document.documentElement.dataset.themeId === 'dark-monokai'
      );
    }
    await card.locator('summary').click();
    await page.waitForFunction(
      () => document.querySelectorAll('.gallery iframe').length === 0
    );
  }
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(url('examples/showcase'));
  const mobile = await (
    await page.locator('[data-workbench] iframe').elementHandle()
  ).contentFrame();
  await mobile.waitForFunction(
    () => document.documentElement.dataset.ready === 'true'
  );
  assert.equal(
    await mobile.locator('#workspace').evaluate((el) => el.split),
    'horizontal'
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    ),
    true
  );
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    ),
    true,
    '移动工作台不应横向溢出'
  );
  await mobile.getByRole('button', {name: '保存设置', exact: true}).click();
  assert.match(await mobile.locator('#feedback').textContent(), /已保存/);
  await selectTheme('hc-dark');
  await page.screenshot({
    path: `${screenshots}/showcase-mobile.png`,
    fullPage: false,
  });
  console.log(
    '已验证综合工作台全部 40 个组件、表单提交与重置、任务完成与取消、菜单与资源联动、全部组件卡片按需加载、主题状态保留和移动端布局。'
  );
}
