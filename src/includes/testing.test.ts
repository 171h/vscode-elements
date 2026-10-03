import {describe, it} from 'vitest';
import {expect, fixture, html} from './testing.js';
import {sendKeys} from './browser-commands.js';

describe('Vitest DOM 断言', () => {
  it('允许当前用例保持修饰键按下状态', async () => {
    const input = await fixture<HTMLInputElement>(html`<input />`);
    let modified = false;
    input.addEventListener('keydown', (event) => {
      if (event.key === 'a') {
        modified = event.ctrlKey;
      }
    });
    input.focus();
    await sendKeys({down: 'Control'});
    await sendKeys({press: 'a'});
    expect(modified).to.equal(true);
    // 故意不释放 Control，验证用例结束时的自动清理。
  });
  it('下一用例输入不受前一用例修饰键影响', async () => {
    const input = await fixture<HTMLInputElement>(html`<input />`);
    input.focus();
    await sendKeys({type: 'hello'});
    expect(input.value).to.equal('hello');
  });
  it('测试 iframe 失焦后仍将原生输入与 Tab 发送到控件', async () => {
    const root = await fixture<HTMLDivElement>(
      html`<div><input /><button>保存</button></div>`
    );
    const input = root.querySelector('input')!;
    input.focus();
    window.parent.focus();
    await sendKeys({type: '输入'});
    expect(input.value).to.equal('输入');
    window.parent.focus();
    await sendKeys({press: 'Tab'});
    expect(document.activeElement).to.equal(root.querySelector('button'));
  });
  it('规范化 Lit 标记、空白和类名顺序', async () => {
    const el = await fixture(
      html`<div><button class=" b a ">保存</button></div>`
    );
    expect(el).toMatchDOM('<button class="a b">保存</button>');
  });
  it('检查文本、ARIA 属性和子元素变化', async () => {
    const el = await fixture(
      html`<div><button aria-label="保存">保存</button></div>`
    );
    for (const markup of [
      '<button aria-label="取消">保存</button>',
      '<button aria-label="保存">取消</button>',
      '<span aria-label="保存">保存</span>',
    ]) {
      expect(() => expect(el).toMatchDOM(markup)).toThrowError();
    }
  });
  it('仅忽略显式指定的属性', async () => {
    const el = await fixture(
      html`<div><button id="generated" aria-label="保存">保存</button></div>`
    );
    expect(el).toMatchDOM('<button aria-label="保存">保存</button>', {
      ignoreAttributes: ['id'],
    });
    expect(() =>
      expect(el).toMatchDOM('<button aria-label="取消">保存</button>', {
        ignoreAttributes: ['id'],
      })
    ).toThrowError();
  });
});
