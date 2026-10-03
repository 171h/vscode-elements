# 组件

根据界面需求选择组件。每页提供导入方式、使用说明、可交互示例与独立 API 链接。

<script setup>
import {components, groups} from '../data/components.mjs';
import {withBase} from 'vitepress';
</script>

<section v-for="group in groups" :key="group">
  <h2 :id="group">{{ group }}</h2>
  <div class="component-grid">
    <a v-for="component in components.filter(c => c.group === group)" :key="component.id" class="component-card" :href="withBase(`/components/${component.id}`)">
      <strong>{{ component.title }}</strong>
      <p>{{ component.description }}</p>
    </a>
  </div>
</section>

## 标签页溢出体验

调整容器宽度，直接体验换行、水平滚动、隐藏标签菜单和标题图标。详细行为见 [标签页溢出与图标](../tabs-overflow)。

<ExamplePreview example="tabs-overflow" />
