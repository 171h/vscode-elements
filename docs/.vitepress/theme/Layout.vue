<script setup>
import DefaultTheme from 'vitepress/theme';
import GlobalThemeSelector from './GlobalThemeSelector.vue';
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after><GlobalThemeSelector /></template>
  </DefaultTheme.Layout>
</template>
