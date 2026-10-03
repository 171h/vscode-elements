<script setup>
import {computed, ref} from 'vue';
import {withBase} from 'vitepress';
import {components, groups} from '../../data/components.mjs';
import ExamplePreview from './ExamplePreview.vue';
import ComponentExamples from './ComponentExamples.vue';

const query = ref('');
const expanded = ref(new Set());
const filtered = computed(() =>
  groups
    .map((group) => ({
      title: group,
      items: components.filter(
        (component) =>
          component.group === group &&
          `${component.title} ${component.id} ${component.description}`
            .toLowerCase()
            .includes(query.value.trim().toLowerCase())
      ),
    }))
    .filter((group) => group.items.length)
);
const count = computed(() =>
  filtered.value.reduce((total, group) => total + group.items.length, 0)
);
function toggle(id, event) {
  if (event.target.open) expanded.value.add(id);
  else expanded.value.delete(id);
}
</script>

<template>
  <section class="gallery" aria-label="全部组件体验">
    <label class="gallery-filter"
      >查找组件
      <input v-model="query" type="search" placeholder="组件名称、标签或用途" />
    </label>
    <p aria-live="polite">
      共 {{ count }} /
      {{ components.length }} 个组件。展开卡片即可操作基础示例及全部功能场景。
    </p>
    <p v-if="!count">没有匹配的组件，请调整关键词。</p>
    <section v-for="group in filtered" :key="group.title">
      <h3>{{ group.title }}</h3>
      <details
        v-for="component in group.items"
        :key="component.id"
        :data-gallery-component="component.id"
        @toggle="toggle(component.id, $event)"
      >
        <summary>
          <strong>{{ component.title }}</strong
          ><code>vscode-{{ component.id }}</code
          ><span>{{ component.description }}</span>
        </summary>
        <div v-if="expanded.has(component.id)" class="gallery-content">
          <p>
            <a :href="withBase(`/components/${component.id}`)">使用说明</a> ·
            <a :href="withBase(`/api/generated/${component.id}`)">API 参考</a>
          </p>
          <ExamplePreview :example="component.example" />
          <ComponentExamples :component="component.id" />
        </div>
      </details>
    </section>
  </section>
</template>

<style scoped>
.gallery-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 600;
}
.gallery-filter input {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 6px;
  padding: 8px 12px;
  color: var(--vp-c-text-1);
  flex: 1;
  min-width: 200px;
}
details {
  margin: 12px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
summary {
  cursor: pointer;
  padding: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
summary::before {
  content: '＋';
  color: var(--vp-c-brand-1);
}
details[open] > summary::before {
  content: '−';
}
summary span {
  flex-basis: 100%;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.gallery-content {
  padding: 0 16px 16px;
  min-width: 0;
}
</style>
