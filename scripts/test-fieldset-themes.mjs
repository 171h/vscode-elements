// Start the dev server on port 8096, then run this to verify every bundled theme.
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
  for (const theme of themes) {
    await selector.selectOption(theme);
    await page.waitForFunction(async (id) => {
      const {theme: tokens} = await import(
        `/node_modules/@vscode-elements/webview-playground/dist/themes/${id}.js`
      );
      return tokens.every(
        ([key, value]) =>
          document.documentElement.style.getPropertyValue(key).trim() === value
      );
    }, theme);
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
      fields[0].querySelector('input').focus();
      return {
        foreground,
        background,
        titleColor,
        border,
        focus: expected(['--vscode-focusBorder']),
        outline: getComputedStyle(fields[0]).outlineColor,
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
      assert.equal(field.foreground, result.foreground, `${theme}: foreground`);
      assert.equal(field.background, result.background, `${theme}: background`);
      assert.equal(field.titleColor, result.titleColor, `${theme}: title`);
      assert.equal(
        field.titleBackground,
        field.background,
        `${theme}: title background`
      );
      assert.equal(
        field.titleBorderWidth,
        '0px',
        `${theme}: title has no border`
      );
      assert.equal(field.border, result.border, `${theme}: border`);
    }
    assert.equal(result.outline, result.focus, `${theme}: focus`);
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
        `${theme}/${size}: wrapped and native radius`
      );
    }
    await page
      .locator('main')
      .screenshot({path: `.wireit/fieldset-${theme}.png`});
    console.log(
      `${theme}: wrapped/native fieldsets, legend, border and focus passed`
    );
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
