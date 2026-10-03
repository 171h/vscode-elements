import DefaultTheme from 'vitepress/theme';
import type {Theme} from 'vitepress';
import ExamplePreview from './ExamplePreview.vue';
import Layout from './Layout.vue';
import ComponentExamples from './ComponentExamples.vue';
import ComponentGallery from './ComponentGallery.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({app}) {
    app.component('ExamplePreview', ExamplePreview);
    app.component('ComponentExamples', ComponentExamples);
    app.component('ComponentGallery', ComponentGallery);
  },
} satisfies Theme;
