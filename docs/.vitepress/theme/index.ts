import DefaultTheme from 'vitepress/theme';
import ExamplePreview from './ExamplePreview.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('ExamplePreview', ExamplePreview);
  },
};
