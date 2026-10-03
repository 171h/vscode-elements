import DefaultTheme from 'vitepress/theme';
import type {Theme} from 'vitepress';
import ExamplePreview from './ExamplePreview.vue';
import Layout from './Layout.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({app}) {
    app.component('ExamplePreview', ExamplePreview);
  },
} satisfies Theme;
