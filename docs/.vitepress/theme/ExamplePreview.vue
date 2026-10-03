<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {withBase} from 'vitepress';
import {examples} from '../../data/examples.mjs';
import {previewDocument} from '../../data/preview.mjs';
import {siteTheme} from './theme-state.mjs';
import {previewSize} from './preview-state.mjs';

const props = defineProps({
  example: {type: String, required: true},
  bare: {type: Boolean, default: false},
});
const iframe = ref(null);
const active = ref('preview');
const mounted = ref(false);
const initialTheme = ref(null);
const initialSize = ref('medium');
const measuredHeight = ref(0);
const demo = computed(() => examples[props.example]);
const frameHeight = computed(() => {
  if (!props.bare || !measuredHeight.value) return demo.value.height || 360;
  const minimum =
    /vscode-(single-select|multi-select|context-menu|tooltip)/.test(
      demo.value.html
    )
      ? demo.value.height || 360
      : 80;
  return Math.max(minimum, measuredHeight.value);
});
function resizePreview(event) {
  if (
    !props.bare ||
    event.source !== iframe.value?.contentWindow ||
    event.origin !== window.location.origin ||
    event.data?.type !== 'nusys-docs-height'
  )
    return;
  if (Number.isFinite(event.data.height))
    measuredHeight.value = Math.min(4000, Math.max(80, event.data.height));
}
const source = computed(() =>
  demo.value
    ? [
        demo.value.html,
        demo.value.css && `<style>\n${demo.value.css}\n</style>`,
        demo.value.js && `<script type="module">\n${demo.value.js}\n<\/script>`,
      ]
        .filter(Boolean)
        .join('\n\n')
    : ''
);
const document = computed(() =>
  mounted.value && demo.value
    ? previewDocument(demo.value, {
        base: withBase('/'),
        theme: initialTheme.value,
        size: initialSize.value,
      })
    : undefined
);
onMounted(() => {
  window.addEventListener('message', resizePreview);
  initialTheme.value = siteTheme.value;
  initialSize.value = previewSize.value;
  mounted.value = true;
});
onUnmounted(() => window.removeEventListener('message', resizePreview));
function syncTheme() {
  iframe.value?.contentWindow?.postMessage(
    {
      type: 'nusys-docs-settings',
      theme: siteTheme.value,
      size: previewSize.value,
    },
    window.location.origin
  );
}
watch([siteTheme, previewSize], syncTheme, {flush: 'post'});
</script>

<template>
  <section v-if="demo" class="example" :aria-label="demo.title">
    <div v-if="!bare" class="example-toolbar">
      <div class="example-tabs" role="group" aria-label="示例视图">
        <button
          type="button"
          :aria-pressed="active === 'preview'"
          @click="active = 'preview'"
        >
          预览
        </button>
        <button
          type="button"
          :aria-pressed="active === 'code'"
          @click="active = 'code'"
        >
          代码
        </button>
      </div>
    </div>
    <iframe
      ref="iframe"
      v-if="active === 'preview' && mounted"
      :title="demo.title"
      :srcdoc="document"
      class="example-frame"
      :style="{height: `${frameHeight}px`}"
      @load="syncTheme"
    ></iframe>
    <p v-else-if="active === 'preview'">正在加载交互示例…</p>
    <pre v-else class="example-source"><code>{{ source }}</code></pre>
  </section>
  <p v-else>未找到示例：{{ example }}</p>
</template>

<style scoped>
.example {
  margin: 24px 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}
.example-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px;
}
.example-tabs {
  display: flex;
  gap: 4px;
  margin-right: auto;
}
button {
  padding: 4px 10px;
  border-radius: 5px;
}
button[aria-pressed='true'] {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.example-frame {
  display: block;
  width: 100%;
  height: 360px;
  border: 0;
}
.example-source {
  margin: 0 !important;
  padding: 18px;
  max-height: 480px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 12px;
}
</style>
