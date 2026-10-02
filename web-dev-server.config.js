/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {legacyPlugin} from '@web/dev-server-legacy';
import {directoryIndexPlugin} from '@bendera/wds-plugin-directory-index';

export default {
  // 保留各组件目录的文件列表；先将 /dev 重定向到统一组件展示页。
  appIndex: 'dev/__index.html',
  middleware: [
    async (context, next) => {
      if (
        (context.method === 'GET' || context.method === 'HEAD') &&
        (context.path === '/dev' || context.path === '/dev/')
      ) {
        context.redirect(`/dev/index.html${context.search}`);
        return;
      }
      await next();
    },
  ],
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
