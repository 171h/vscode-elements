<script setup>
import DefaultTheme from 'vitepress/theme';
import GlobalThemeSelector from './GlobalThemeSelector.vue';
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom><GlobalThemeSelector /></template>
  </DefaultTheme.Layout>
</template>
