<script setup>
import {withBase} from 'vitepress';
import {showcaseGroups} from '../../data/showcase.mjs';
import {examples} from '../../data/examples.mjs';
import ExamplePreview from './ExamplePreview.vue';
</script>

<template>
  <section class="gallery" aria-label="全部组件演示">
    <section v-for="(group, index) in showcaseGroups" :key="group.title">
      <h2 :id="`showcase-group-${index + 1}`">{{ group.title }}</h2>
      <div class="gallery-grid">
        <article
          v-for="demo in group.items"
          :key="demo.id"
          :data-demo="demo.id"
          :class="{'gallery-wide': demo.wide}"
        >
          <h3 :id="`demo-${demo.id}`">
            <a :href="withBase(`/components/${demo.component}`)">{{
              demo.componentName + examples[demo.id].title
            }}</a>
          </h3>
          <ExamplePreview :example="demo.id" bare />
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}
article {
  min-width: 0;
}
.gallery h3 {
  font-size: 15px;
  margin: 0 0 12px;
  line-height: 1.6;
}
.gallery h3 a {
  text-decoration: none;
  color: var(--vp-c-text-1);
}
.gallery h3 a:hover {
  color: var(--vp-c-brand-1);
}
.gallery :deep(.example) {
  margin: 0;
}
@media (min-width: 1280px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .gallery-wide {
    grid-column: 1/-1;
  }
}
</style>
