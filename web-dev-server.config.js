/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {legacyPlugin} from '@web/dev-server-legacy';
import {directoryIndexPlugin} from '@bendera/wds-plugin-directory-index';

export default {
  // Keep directory listings for individual component folders. The gallery
  // entry below handles /dev explicitly before the directory index plugin.
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
        // Manually imported in index.html file
        webcomponents: false,
      },
    }),
    directoryIndexPlugin(),
  ],
};
