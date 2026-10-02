import DefaultTheme from 'vitepress/theme';
import type {Theme} from 'vitepress';
import ExamplePreview from './ExamplePreview.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('ExamplePreview', ExamplePreview);
  },
} satisfies Theme;
