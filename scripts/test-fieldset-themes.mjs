// 先在 8096 端口启动开发服务器，再运行此脚本检查所有内置主题。
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {waitForPlaygroundTheme} from './playground-theme.mjs';

const browser = await chromium.launch({headless: true});
try {
  const page = await browser.newPage({viewport: {width: 1100, height: 800}});
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(
    `${process.argv[2] || 'http://127.0.0.1:8096'}/dev/vscode-tabs/drag-drop.html`
  );
  const selector = page.locator('vscode-theme-selector select');
  await selector.waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector('vscode-fieldset')?.shadowRoot &&
      document.querySelector('legend')?.draggable
  );
  const themes = await selector
    .locator('option')
    .evaluateAll((options) => options.map((option) => option.value));
  await waitForPlaygroundTheme(page, await selector.inputValue());
  for (const theme of themes) {
    await selector.selectOption(theme);
    await waitForPlaygroundTheme(page, theme);
    const result = await page.evaluate(() => {
      const expected = (keys) => {
        const el = document.createElement('span');
        el.style.color = keys.reduceRight(
          (fallback, key) => `var(${key}, ${fallback})`,
          'CanvasText'
        );
        document.querySelector('vscode-tabs').append(el);
        const color = getComputedStyle(el).color;
        el.remove();
        return color;
      };
      const fields = Array.from(document.querySelectorAll('fieldset'));
      const foreground = expected([
        '--vscode-sideBar-foreground',
        '--vscode-foreground',
      ]);
      const background = expected([
        '--vscode-sideBar-background',
        '--vscode-editor-background',
      ]);
      const titleColor = expected([
        '--vscode-sideBarSectionHeader-foreground',
        '--vscode-sideBarTitle-foreground',
        '--vscode-foreground',
      ]);
      const border = expected([
        '--vscode-contrastBorder',
        '--vscode-sideBarSectionHeader-border',
        '--vscode-panel-border',
        '--vscode-widget-border',
      ]);
      const input = fields[0].querySelector('input');
      input.focus();
      return {
        foreground,
        background,
        titleColor,
        border,
        focus: expected(['--vscode-focusBorder']),
        inputFocused: document.activeElement === input,
        inputOutline: getComputedStyle(input).outlineColor,
        inputOutlineStyle: getComputedStyle(input).outlineStyle,
        outlineStyle: getComputedStyle(fields[0]).outlineStyle,
        fields: fields.map((field) => ({
          foreground: getComputedStyle(field).color,
          background: getComputedStyle(field).backgroundColor,
          titleColor: getComputedStyle(field.querySelector('legend')).color,
          titleBackground: getComputedStyle(field.querySelector('legend'))
            .backgroundColor,
          titleBorderWidth: getComputedStyle(field.querySelector('legend'))
            .borderTopWidth,
          border: getComputedStyle(field).borderTopColor,
        })),
      };
    });
    for (const field of result.fields) {
      assert.equal(field.foreground, result.foreground, `${theme}: 前景色`);
      assert.equal(field.background, result.background, `${theme}: 背景色`);
      assert.equal(field.titleColor, result.titleColor, `${theme}: 标题`);
      assert.equal(
        field.titleBackground,
        'rgba(0, 0, 0, 0)',
        `${theme}: 标题背景与表面融合`
      );
      assert.equal(field.titleBorderWidth, '0px', `${theme}: 标题无边框`);
      assert.equal(field.border, result.border, `${theme}: 边框`);
    }
    assert.equal(result.inputFocused, true, `${theme}: 输入框保留焦点`);
    assert.equal(result.inputOutlineStyle, 'solid', `${theme}: 输入框焦点轮廓`);
    assert.equal(result.inputOutline, result.focus, `${theme}: 输入框焦点颜色`);
    assert.equal(result.outlineStyle, 'none', `${theme}: 输入聚焦时分区无外框`);
    for (const [size, radius] of [
      ['small', '1px'],
      ['medium', '4px'],
      ['large', '6px'],
    ]) {
      await page.locator(`[data-fieldset-size="${size}"]`).click();
      const radii = await page
        .locator('fieldset')
        .evaluateAll((fields) =>
          fields.map((field) => getComputedStyle(field).borderTopLeftRadius)
        );
      assert.ok(
        radii.every((value) => value === radius),
        `${theme}/${size}: 包装与原生 fieldset 的圆角`
      );
    }
    await page
      .locator('main')
      .screenshot({path: `coverage/screenshots/fieldset-${theme}.png`});
    console.log(`${theme}: 包装与原生 fieldset、标题、边框和焦点检查通过`);
  }
  await page.emulateMedia({forcedColors: 'active'});
  assert.equal(
    await page
      .locator('fieldset')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopStyle),
    'solid'
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
