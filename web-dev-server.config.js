/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {legacyPlugin} from '@web/dev-server-legacy';
import {directoryIndexPlugin} from '@bendera/wds-plugin-directory-index';

export default {
  // 保持应用索引为虚拟页面，使 /dev 继续交由
  // 目录索引插件处理。真实的 /dev/index.html 仍可直接访问，
  // 作为统一组件展示页。
  appIndex: 'dev/__index.html',
  nodeResolve: true,
  open: true,
  preserveSymlinks: true,
  plugins: [
    legacyPlugin({
      polyfills: {
        // 在 index.html 中手动导入
        webcomponents: false,
      },
    }),
    directoryIndexPlugin(),
  ],
};
