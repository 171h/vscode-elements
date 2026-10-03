import {ref} from 'vue';

export const previewSize = ref('medium');
const key = 'nusys-docs:size';
const sizes = ['small', 'medium', 'large'];

export function restorePreviewSize() {
  const saved = localStorage.getItem(key);
  if (sizes.includes(saved)) previewSize.value = saved;
}

export function setPreviewSize(size) {
  if (!sizes.includes(size)) return;
  previewSize.value = size;
  localStorage.setItem(key, size);
}
