import {describe, it} from 'vitest';
import {expect, fixture, html} from './testing.js';

describe('Vitest DOM 断言', () => {
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
