// 借鉴 Shoelace 的实现

import {sendMouse} from '@web/test-runner-commands';

function determineMousePosition(
  el: Element,
  position: string,
  offsetX: number,
  offsetY: number
) {
  const {x, y, width, height} = el.getBoundingClientRect();
  const centerX = Math.floor(x + window.scrollX + width / 2);
  const centerY = Math.floor(y + window.scrollY + height / 2);
  let clickX: number;
  let clickY: number;

  switch (position) {
    case 'top':
      clickX = centerX;
      clickY = y;
      break;
    case 'right':
      clickX = x + width - 1;
      clickY = centerY;
      break;
    case 'bottom':
      clickX = centerX;
      clickY = y + height - 1;
      break;
    case 'left':
      clickX = x;
      clickY = centerY;
      break;
    default:
      clickX = centerX;
      clickY = centerY;
  }

  clickX += offsetX;
  clickY += offsetY;
  return {clickX, clickY};
}

/** 测试工具：测量元素位置并点击元素。 */
export async function clickOnElement(
  /** 要点击的元素 */
  el: Element,
  /** 元素内的点击位置 */
  position: 'top' | 'right' | 'bottom' | 'left' | 'center' = 'center',
  /** 点击位置的水平偏移量 */
  offsetX = 0,
  /** 点击位置的垂直偏移量 */
  offsetY = 0
) {
  const {clickX, clickY} = determineMousePosition(
    el,
    position,
    offsetX,
    offsetY
  );

  await sendMouse({type: 'click', position: [clickX, clickY]});
}

/** 测试工具：将鼠标移动到元素上。 */
export async function moveMouseOnElement(
  /** 要点击的元素 */
  el: Element,
  /** 元素内的点击位置 */
  position: 'top' | 'right' | 'bottom' | 'left' | 'center' = 'center',
  /** 点击位置的水平偏移量 */
  offsetX = 0,
  /** 点击位置的垂直偏移量 */
  offsetY = 0
) {
  const {clickX, clickY} = determineMousePosition(
    el,
    position,
    offsetX,
    offsetY
  );

  await sendMouse({type: 'move', position: [clickX, clickY]});
}

/** 测试工具：使用鼠标拖动元素。 */
export async function dragElement(
  /** 要拖动的元素 */
  el: Element,
  /** 水平拖动距离，单位为像素 */
  deltaX = 0,
  /** 垂直拖动距离，单位为像素 */
  deltaY = 0,
  callbacks: {
    afterMouseDown?: () => void | Promise<void>;
    afterMouseMove?: () => void | Promise<void>;
  } = {}
): Promise<void> {
  await moveMouseOnElement(el);
  await sendMouse({type: 'down'});

  await callbacks.afterMouseDown?.();

  const {clickX, clickY} = determineMousePosition(el, 'center', deltaX, deltaY);
  await sendMouse({type: 'move', position: [clickX, clickY]});

  await callbacks.afterMouseMove?.();

  await sendMouse({type: 'up'});
}

type AllTagNames = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;

type TagNameToElement<K extends AllTagNames> =
  K extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[K]
    : K extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[K]
      : Element;

export function $<K extends AllTagNames>(selector: K): TagNameToElement<K>;
export function $<K extends AllTagNames>(
  root: Element | ShadowRoot,
  selector: K
): TagNameToElement<K>;
export function $<T extends Element = Element>(selector: string): T;
export function $<T extends Element = Element>(
  root: Element | ShadowRoot,
  selector: string
): T;
export function $<T extends Element = Element>(
  arg1: string | Element | ShadowRoot,
  arg2?: string
): T {
  let result: Element | null;

  if (typeof arg1 === 'string') {
    result = document.querySelector(arg1);
  } else if (
    (arg1 instanceof Element || arg1 instanceof ShadowRoot) &&
    typeof arg2 === 'string'
  ) {
    result = arg1.querySelector(arg2);
  } else {
    throw new Error('Invalid arguments passed to $()');
  }

  if (!result) {
    const selector = typeof arg1 === 'string' ? arg1 : arg2!;
    const context = typeof arg1 === 'string' ? 'document' : 'root element';
    throw new Error(`No match for selector: ${selector} in ${context}`);
  }

  return result as T;
}

export function $$<K extends AllTagNames>(
  selector: K
): NodeListOf<TagNameToElement<K>>;
export function $$<K extends AllTagNames>(
  root: Element | ShadowRoot,
  selector: K
): NodeListOf<TagNameToElement<K>>;
export function $$<T extends Element = Element>(
  selector: string
): NodeListOf<T>;
export function $$<T extends Element = Element>(
  root: Element | ShadowRoot,
  selector: string
): NodeListOf<T>;
export function $$<T extends Element = Element>(
  arg1: string | Element | ShadowRoot,
  arg2?: string
): NodeListOf<T> {
  let result: NodeListOf<Element>;

  if (typeof arg1 === 'string') {
    result = document.querySelectorAll(arg1);
  } else if (
    (arg1 instanceof Element || arg1 instanceof ShadowRoot) &&
    typeof arg2 === 'string'
  ) {
    result = arg1.querySelectorAll(arg2);
  } else {
    throw new Error('Invalid arguments passed to $$()');
  }

  if (result.length === 0) {
    const selector = typeof arg1 === 'string' ? arg1 : arg2!;
    const context = typeof arg1 === 'string' ? 'document' : 'root element';
    throw new Error(`No matches for selector: ${selector} in ${context}`);
  }

  return result as NodeListOf<T>;
}
