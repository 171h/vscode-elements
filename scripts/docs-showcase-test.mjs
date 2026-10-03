import assert from 'node:assert/strict';
import {components} from '../docs/data/components.mjs';
import {examples} from '../docs/data/examples.mjs';
import {showcaseGroups} from '../docs/data/showcase.mjs';
import {testResponsiveTable} from './docs-scenarios-test.mjs';

export async function testShowcase(page, url, selectTheme, screenshots) {
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto(url('examples/showcase'));
  const outline = page.locator('.aside .VPDocAsideOutline');
  await outline.getByRole('heading', {name: '本页内容', exact: true}).waitFor();
  const outlineBox = await outline.boundingBox();
  const galleryBox = await page.locator('.gallery').boundingBox();
  assert.ok(
    outlineBox && galleryBox && outlineBox.x >= galleryBox.x + galleryBox.width,
    '本页内容必须位于综合演示右侧'
  );
  assert.equal(
    await outline.locator('a').count(),
    showcaseGroups.length + Object.keys(examples).length
  );
  await outline.locator('a[href="#demo-tree-controls"]').click();
  await page.waitForFunction(() => location.hash === '#demo-tree-controls');
  await page.waitForFunction(() => {
    const top = document
      .querySelector('#demo-tree-controls')
      .getBoundingClientRect().top;
    return top >= 0 && top < innerHeight;
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  const demos = showcaseGroups.flatMap((group) => group.items);
  for (const demo of demos) {
    const component = components.find((item) => item.id === demo.component);
    const title = component.title.split(' ').at(-1) + examples[demo.id].title;
    assert.equal(
      await outline.locator(`a[href="#demo-${demo.id}"]`).textContent(),
      title,
      `${demo.id} 的导航标题必须以组件名称开始`
    );
    assert.equal(
      await page.locator(`#demo-${demo.id} a`).textContent(),
      title,
      `${demo.id} 的示例标题必须与导航一致`
    );
  }
  assert.equal(await page.locator('[data-demo]').count(), demos.length);
  assert.equal(
    await page
      .locator('.gallery details,.gallery summary,.gallery .example-toolbar')
      .count(),
    0,
    '综合页直接展示组件，不使用折叠或预览入口'
  );
  const frames = new Map();
  const tags = new Set();
  for (const demo of demos) {
    const element = await page
      .locator(`[data-demo="${demo.id}"] iframe`)
      .elementHandle();
    assert.ok(element, `${demo.id} 必须直接显示演示`);
    const frame = await element.contentFrame();
    await frame.waitForFunction(
      () => document.documentElement.dataset.ready === 'true'
    );
    frames.set(demo.id, frame);
    for (const tag of await frame.evaluate(() => {
      const tags = new Set();
      const visit = (root) => {
        for (const el of root.querySelectorAll('*')) {
          tags.add(el.localName);
          if (el.shadowRoot) visit(el.shadowRoot);
        }
      };
      visit(document);
      return [...tags];
    }))
      tags.add(tag);
  }
  assert.deepEqual(
    new Set(demos.map((demo) => demo.id)),
    new Set(Object.keys(examples)),
    '综合页必须直接展示全部示例且不重复'
  );
  for (const component of components)
    assert.ok(tags.has(`vscode-${component.id}`), `综合页缺少 ${component.id}`);
  const tooltipFrame = frames.get('tooltip');
  const tooltipSearch = tooltipFrame.getByRole('button', {
    name: '搜索',
    exact: true,
  });
  await tooltipSearch.hover();
  await tooltipFrame
    .getByRole('tooltip', {name: '搜索 (Ctrl+Shift+F)'})
    .waitFor();
  const tooltipBounds = await tooltipFrame
    .locator('vscode-tooltip .tooltip')
    .last()
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: innerWidth,
        height: innerHeight,
      };
    });
  assert.ok(
    tooltipBounds.left >= 8 &&
      tooltipBounds.right <= tooltipBounds.width - 7 &&
      tooltipBounds.top >= 8 &&
      tooltipBounds.bottom <= tooltipBounds.height - 7,
    '综合页气泡与箭头应保留视口安全边距'
  );
  await page
    .locator('[data-demo="tooltip"] iframe')
    .screenshot({path: `${screenshots}/showcase-tooltip.png`});
  await tooltipSearch.focus();
  await page.keyboard.press('Escape');
  await tooltipFrame.getByRole('tooltip').waitFor({state: 'hidden'});
  await testResponsiveTable(frames.get('table-responsive'));
  const frame = frames.get('percentage');
  const input = frame.locator('vscode-textfield input');
  await input.focus();
  await input.press('ControlOrMeta+A');
  await input.press('Backspace');
  await input.pressSequentially('35');
  await input.blur();
  for (const theme of ['dark-v2', 'hc-light', 'light-v2']) {
    await selectTheme(theme);
    assert.equal(await input.inputValue(), '35%');
  }
  for (const size of ['small', 'large', 'medium']) {
    await page.locator('.global-size-selector').selectOption(size);
    for (const preview of frames.values())
      await preview.waitForFunction(
        (size) => document.documentElement.dataset.previewSize === size,
        size
      );
    assert.equal(await input.inputValue(), '35%');
    assert.equal(
      await frame.locator('vscode-textfield').evaluate((el) => el.size),
      size
    );
  }
  await frame.getByRole('button', {name: '读取表单'}).click();
  await frame.getByText('提交值：0.35', {exact: true}).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${screenshots}/showcase-desktop.png`,
    fullPage: false,
  });
  for (const width of [320, 390, 768, 960, 1280]) {
    await page.setViewportSize({width, height: 844});
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      ),
      true,
      `${width}px 综合页不应横向溢出`
    );
    const controls = await page
      .locator('.VPNavBar .global-theme-bar')
      .boundingBox();
    assert.ok(
      controls && controls.x + controls.width <= width,
      `${width}px 全局控件必须位于导航栏内`
    );
  }
  await page.setViewportSize({width: 390, height: 844});
  await selectTheme('hc-dark');
  await page.screenshot({
    path: `${screenshots}/showcase-mobile.png`,
    fullPage: false,
  });
  console.log(
    `已验证综合页直接展示 ${demos.length} 个示例、全部 ${components.length} 个组件、统一主题与尺寸、输入及表单状态保留和移动布局。`
  );
}
