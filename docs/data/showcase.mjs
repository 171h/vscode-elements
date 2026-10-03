import {components, groups} from './components.mjs';
import {componentScenarios} from './scenarios.mjs';

// 组合组件共用演示，综合页只展示一次。
const seen = new Set();
const extra = {
  textfield: ['percentage'],
  'single-select': ['combobox'],
  tabs: ['tabs-overflow'],
};
const wide = /^(form|tabs|table|split|textfield-native|choice-layouts)/;
export const showcaseGroups = groups.map((title) => ({
  title,
  items: components
    .filter((component) => component.group === title)
    .flatMap((component) =>
      [
        component.example,
        ...(extra[component.id] || []),
        ...componentScenarios[component.id],
      ]
        .filter((id) => {
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((id) => ({id, component: component.id, wide: wide.test(id)}))
    ),
}));
