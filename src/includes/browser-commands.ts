import {commands} from 'vitest/browser';

// 使用 Playwright 原生输入，保留浏览器默认行为及按键状态。
export async function sendKeys(options: {
  press?: string;
  down?: string;
  up?: string;
  type?: string;
}) {
  await commands.keyboardInput(options);
}
export async function resetKeyboard() {
  await commands.keyboardInput({reset: true});
}
export async function sendMouse(options: {
  type: 'click' | 'move' | 'down' | 'up';
  position?: [number, number];
}) {
  await commands.mouseInput(options);
}
export async function resetMouse() {
  await commands.mouseInput({type: 'reset'});
}
export async function emulateMedia(options: {
  reducedMotion: 'reduce' | 'no-preference';
}) {
  await commands.setMedia(options);
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    keyboardInput: (options: {
      reset?: boolean;
      press?: string;
      down?: string;
      up?: string;
      type?: string;
    }) => Promise<void>;
    mouseInput: (options: {
      type: 'click' | 'move' | 'down' | 'up' | 'reset';
      position?: [number, number];
    }) => Promise<void>;
    setMedia: (options: {
      reducedMotion: 'reduce' | 'no-preference';
    }) => Promise<void>;
  }
}
