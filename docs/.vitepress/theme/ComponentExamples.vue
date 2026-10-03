<script setup>
import {componentScenarios, extraExamples} from '../../data/scenarios.mjs';
import ExamplePreview from './ExamplePreview.vue';
defineProps({component: {type: String, required: true}});
</script>

<template>
  <section
    v-for="id in componentScenarios[component]"
    :key="id"
    class="scenario"
    :data-scenario="id"
  >
    <h3 :id="id">{{ extraExamples[id].title }}</h3>
    <ul>
      <li v-for="feature in extraExamples[id].features" :key="feature">
        {{ feature }}
      </li>
    </ul>
    <ExamplePreview :example="id" />
  </section>
</template>
