# Vue 与 React

组件通过浏览器 Custom Elements 注册。对于服务端渲染，在客户端加载组件，避免构建期间访问 `window`、`document` 或 `customElements`。

## Vue 3

配置模板编译器将 `vscode-` 标签识别为自定义元素：

```ts
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('vscode-'),
        },
      },
    }),
  ],
});
```

```vue
<script setup>
import {onMounted, ref} from 'vue';
const field = ref(null);
const value = ref('');
onMounted(async () => {
  await import('nusys-ui/dist/vscode-textfield/index.js');
});
</script>

<template>
  <vscode-textfield
    ref="field"
    aria-label="项目名称"
    :value.prop="value"
    @input="value = field.value"
  />
  <p>{{ value }}</p>
</template>
```

数组等复杂值用 `.prop` 绑定。输入值通过 `input` 或 `change` 同步；自定义组件并未声明 Vue 的 `update:modelValue` 协议。

## React

使用 ref 和原生事件监听器兼容不同 React 版本。SSR 项目把组件放入客户端边界，或在 effect 中动态导入。以下通过原生 DOM 创建组件，避免额外的 JSX 标签类型声明：

```tsx
import {useEffect, useRef, useState} from 'react';
import type {VscodeTextfield} from 'nusys-ui';

export function ProjectName() {
  const host = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  useEffect(() => {
    let disposed = false;
    let field: VscodeTextfield | undefined;
    const onInput = () => setValue(field?.value ?? '');
    import('nusys-ui/dist/vscode-textfield/index.js').then(() => {
      if (disposed || !host.current) return;
      field = document.createElement('vscode-textfield');
      field.setAttribute('aria-label', '项目名称');
      field.addEventListener('input', onInput);
      host.current.append(field);
    });
    return () => {
      disposed = true;
      field?.removeEventListener('input', onInput);
      field?.remove();
    };
  }, []);
  return (
    <>
      <div ref={host} />
      <p>{value}</p>
    </>
  );
}
```

使用 JSX 自定义标签时，应在应用内补充相应 `JSX.IntrinsicElements` 类型，并按当前 React 版本的 Custom Elements 属性规则传值。结构化值优先通过 ref 设置。组件事件详情与冒泡规则以本项目 API 为准。
