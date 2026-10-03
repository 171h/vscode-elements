import assert from 'node:assert/strict';

// 文档预览接替旧开发页，验证真实主题和尺寸下的标题布局与输入焦点。
export async function testFieldsetThemes(page, frame, selectTheme, selectSize) {
  const selector = page.locator('vscode-theme-selector select');
  const originalTheme = await selector.inputValue();
  const originalSize = await page
    .locator('.VPNavBar .global-size-selector')
    .inputValue();
  const themes = await selector
    .locator('option')
    .evaluateAll((options) => options.map((option) => option.value));
  try {
    for (const theme of themes) {
      await selectTheme(theme);
      for (const size of ['small', 'medium', 'large']) {
        await selectSize(size);
        await frame.locator('vscode-fieldset').evaluate(async (host) => {
          await host.updateComplete;
          await host.shadowRoot.querySelector('vscode-checkbox').updateComplete;
          await new Promise((resolve) => requestAnimationFrame(resolve));
        });
        const state = await frame
          .locator('vscode-fieldset')
          .evaluate((host) => {
            const fieldset = host.querySelector('fieldset');
            const legend = fieldset.querySelector('legend');
            const checkbox = host.shadowRoot.querySelector('vscode-checkbox');
            const legendRect = legend.getBoundingClientRect();
            const checkboxRect = checkbox.getBoundingClientRect();
            const fieldsetRect = fieldset.getBoundingClientRect();
            const expected = (keys) => {
              const probe = document.createElement('span');
              probe.style.color = keys.reduceRight(
                (fallback, key) => `var(${key}, ${fallback})`,
                'CanvasText'
              );
              host.append(probe);
              const color = getComputedStyle(probe).color;
              probe.remove();
              return color;
            };
            const field = host.querySelector('vscode-textfield');
            field.focus();
            const input = field.shadowRoot.querySelector('input');
            return {
              centerDelta:
                checkboxRect.top +
                checkboxRect.height / 2 -
                legendRect.top -
                legendRect.height / 2,
              rightGap: fieldsetRect.right - checkboxRect.right,
              legendBackground: getComputedStyle(legend).backgroundColor,
              checkboxBackground: getComputedStyle(checkbox).backgroundColor,
              titleWeight: getComputedStyle(legend).fontWeight,
              labelWeight: getComputedStyle(checkbox).fontWeight,
              titleSize: getComputedStyle(legend).fontSize,
              labelSize: getComputedStyle(
                checkbox.shadowRoot.querySelector('.label-attr')
              ).fontSize,
              outline: getComputedStyle(fieldset).outlineStyle,
              inputFocused: field.shadowRoot.activeElement === input,
              border: getComputedStyle(fieldset, '::before').borderTopColor,
              expectedBorder: expected([
                '--vscode-contrastBorder',
                '--vscode-sideBarSectionHeader-border',
                '--vscode-panel-border',
                '--vscode-widget-border',
                '--vscode-foreground',
              ]),
              gapEnd: parseFloat(
                fieldset.style.getPropertyValue('--_vsc-fieldset-checkbox-end')
              ),
              checkboxEnd: checkboxRect.right - fieldsetRect.left,
            };
          });
        const context = `${theme}/${size}`;
        assert.ok(Math.abs(state.centerDelta) < 1, `${context}: 标题垂直居中`);
        assert.ok(Math.abs(state.rightGap - 10) < 1, `${context}: 右侧间距`);
        assert.equal(
          state.legendBackground,
          'rgba(0, 0, 0, 0)',
          `${context}: 标题透明`
        );
        assert.equal(
          state.checkboxBackground,
          state.legendBackground,
          `${context}: 启用框透明`
        );
        assert.equal(state.titleWeight, '700', `${context}: 标题加粗`);
        assert.equal(state.labelWeight, '400', `${context}: 标签常规字重`);
        assert.equal(state.labelSize, state.titleSize, `${context}: 标签字号`);
        assert.equal(
          state.outline,
          'none',
          `${context}: 输入聚焦不显示分区外框`
        );
        assert.equal(state.inputFocused, true, `${context}: 输入焦点保留`);
        assert.equal(
          state.border,
          state.expectedBorder,
          `${context}: 装饰边框主题颜色`
        );
        assert.ok(
          Math.abs(state.gapEnd - state.checkboxEnd) < 1,
          `${context}: 标签边框缺口`
        );
      }
    }
  } finally {
    await selectTheme(originalTheme);
    await selectSize(originalSize);
  }
  console.log(
    'fieldset 文档预览：十种主题、三种尺寸、透明缺口、标题布局与输入焦点通过'
  );
}
