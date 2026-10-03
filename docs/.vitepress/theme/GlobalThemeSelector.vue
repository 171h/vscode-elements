<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {readPlaygroundTheme} from './theme-state.mjs';

const host = ref(null);
const error = ref('');
let observer;
let disposed = false;
onMounted(async () => {
  try {
    const {VscodeThemeSelector: Selector} =
      await import('@vscode-elements/webview-playground/dist/theme-selector.js');
    // 预加载主题后再注册，避免上游异步加载在快速切换时覆盖新主题。
    const modules = await Promise.all([
      import('@vscode-elements/webview-playground/dist/themes/light.js'),
      import('@vscode-elements/webview-playground/dist/themes/light-v2.js'),
      import('@vscode-elements/webview-playground/dist/themes/light-quiet.js'),
      import('@vscode-elements/webview-playground/dist/themes/light-solarized.js'),
      import('@vscode-elements/webview-playground/dist/themes/dark.js'),
      import('@vscode-elements/webview-playground/dist/themes/dark-v2.js'),
      import('@vscode-elements/webview-playground/dist/themes/dark-solarized.js'),
      import('@vscode-elements/webview-playground/dist/themes/dark-monokai.js'),
      import('@vscode-elements/webview-playground/dist/themes/hc-light.js'),
      import('@vscode-elements/webview-playground/dist/themes/hc-dark.js'),
    ]);
    if (disposed) return;
    Object.keys(Selector.themeInfo).forEach((id, index) => {
      Selector.themes[id].data = modules[index].theme;
    });
    if (!customElements.get('vscode-theme-selector'))
      customElements.define('vscode-theme-selector', Selector);
    const selector = document.createElement('vscode-theme-selector');
    selector.shadowRoot.querySelector('label').textContent = '全站主题';
    selector.shadowRoot.querySelector('option[value="hc-light"]').textContent =
      '浅色高对比度';
    selector.shadowRoot.querySelector('option[value="hc-dark"]').textContent =
      '深色高对比度';
    host.value.append(selector);
    const sync = () => readPlaygroundTheme(Selector);
    observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    sync();
  } catch (cause) {
    error.value = '主题加载失败，请刷新页面重试。';
    console.error(cause);
  }
});
onUnmounted(() => {
  disposed = true;
  observer?.disconnect();
});
</script>

<template>
  <div class="global-theme-bar" aria-label="全站主题设置">
    <div ref="host" class="global-theme-selector"></div>
    <span v-if="error" role="alert">{{ error }}</span>
    <span v-else class="theme-hint">文档与示例同步 · 自动记住选择</span>
  </div>
</template>

<style scoped>
.global-theme-bar {
  position: fixed;
  bottom: 0;
  inset-inline: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  min-height: 48px;
  padding: 8px 16px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-top: 1px solid var(--vp-c-divider);
}
.theme-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
@media (max-width: 640px) {
  .theme-hint {
    display: none;
  }
}
</style>
