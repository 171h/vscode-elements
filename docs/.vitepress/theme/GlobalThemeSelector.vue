<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {readPlaygroundTheme} from './theme-state.mjs';
import {
  previewSize,
  restorePreviewSize,
  setPreviewSize,
} from './preview-state.mjs';

const host = ref(null);
const error = ref('');
let observer;
let disposed = false;
onMounted(async () => {
  restorePreviewSize();
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
    selector.shadowRoot.querySelector('label').remove();
    selector.shadowRoot
      .querySelector('select')
      .setAttribute('aria-label', '全站主题');
    const style = document.createElement('style');
    style.textContent = `select {max-width:130px;height:30px;border-radius:5px;padding:2px 4px;font-size:12px}
      @media(max-width:767px){select{width:90px}}`;
    selector.shadowRoot.append(style);
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
  <div class="global-theme-bar" aria-label="全站演示设置">
    <div ref="host" class="global-theme-selector"></div>
    <label class="global-size-selector"
      ><span>尺寸</span>
      <select
        :value="previewSize"
        @change="setPreviewSize($event.target.value)"
      >
        <option value="small">小</option>
        <option value="medium">中</option>
        <option value="large">大</option>
      </select>
    </label>
    <span v-if="error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped>
.global-theme-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 12px;
  color: var(--vp-c-text-1);
}
.global-size-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.global-size-selector select {
  height: 30px;
  padding: 2px 4px;
  border: 1px solid var(--vp-c-text-1);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
}
.global-size-selector select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
@media (max-width: 1180px) {
  .global-size-selector span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .global-theme-bar {
    gap: 8px;
    margin-left: 8px;
  }
}
</style>
