# API 参考

API 在每次文档构建前从本分支源码生成，包含 JavaScript 属性、HTML 特性、类型、默认值、反射、方法、事件、插槽、CSS 部件与 CSS 自定义属性。继承自共享基类的公开接口保留；私有接口、`@internal` 成员和 Lit 生命周期方法不作为使用接口展示。

HTML 布尔特性通过存在与否判断；数组、对象和回调优先用 JavaScript 属性。`—` 表示源码未声明对应字段，不能据此假设运行时行为。

<script setup>
import {components, groups} from '../data/components.mjs';
import {withBase} from 'vitepress';
</script>

<section v-for="group in groups" :key="group">
  <h2>{{ group }}</h2>
  <ul>
    <li v-for="component in components.filter(c => c.group === group)" :key="component.id">
      <a :href="withBase(`/api/generated/${component.id}`)">{{ component.title }} · vscode-{{ component.id }}</a>
    </li>
  </ul>
</section>
