import {afterEach, beforeEach, expect} from 'vitest';
import axe from 'axe-core';
import {fixtureCleanup} from '@open-wc/testing-helpers';
import {resetKeyboard, resetMouse} from './browser-commands.js';

// 将 DOM 结构转换为稳定结果，忽略 Lit 注释和样式注入。
function normalizedDOM(root: Node, ignoreAttributes: string[] = []): unknown[] {
  const children: unknown[] = [];
  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const last = children.length - 1;
      if (typeof children[last] === 'string') {
        children[last] += node.textContent ?? '';
      } else {
        children.push(node.textContent ?? '');
      }
    } else if (
      node instanceof Element &&
      !['STYLE', 'SCRIPT', 'svg'].includes(node.tagName)
    ) {
      const attributes = Array.from(node.attributes)
        .filter(
          ({name, value}) =>
            !ignoreAttributes.includes(name) &&
            !(name === 'class' && !value.trim())
        )
        .map(({name, value}) => [
          name,
          name === 'class' ? value.trim().split(/\s+/).sort().join(' ') : value,
        ])
        .sort(([a], [b]) => a.localeCompare(b));
      children.push({
        tag: node.tagName,
        attributes,
        children: normalizedDOM(node, ignoreAttributes),
      });
    }
  }
  return children
    .map((child) =>
      typeof child === 'string' ? child.replace(/\s+/g, ' ').trim() : child
    )
    .filter((child) => child !== '');
}
function compareDOM(
  root: Node | null,
  expected: string,
  options: {ignoreAttributes?: string[]} = {}
) {
  const template = document.createElement('template');
  template.innerHTML = expected;
  const actual = root ? normalizedDOM(root, options.ignoreAttributes) : null;
  const wanted = normalizedDOM(template.content, options.ignoreAttributes);
  return {
    pass: JSON.stringify(actual) === JSON.stringify(wanted),
    actual,
    expected: wanted,
    message: () => 'DOM 结构与预期不一致',
  };
}
// 在用例边界清理按键和指针，避免污染后续输入与悬停状态。
beforeEach(async () => {
  await resetKeyboard();
  await resetMouse();
});
afterEach(async () => {
  try {
    await resetKeyboard();
  } finally {
    fixtureCleanup();
  }
});
expect.extend({
  toMatchDOM(
    element: Element,
    expected: string,
    options?: {ignoreAttributes?: string[]}
  ) {
    return compareDOM(element, expected, options);
  },
  toMatchShadowDOM(element: Element, expected: string) {
    return compareDOM(element.shadowRoot, expected);
  },
  async toBeAccessible(element: Element) {
    const result = await axe.run(element);
    return {
      pass: result.violations.length === 0,
      message: () => JSON.stringify(result.violations, null, 2),
    };
  },
});
declare module 'vitest' {
  interface Assertion {
    toMatchDOM(expected: string, options?: {ignoreAttributes?: string[]}): void;
    toMatchShadowDOM(expected: string): void;
    toBeAccessible(): Promise<void>;
  }
}
export {expect};
export {fixture, aTimeout, nextFrame} from '@open-wc/testing-helpers';
export {html} from 'lit/static-html.js';
