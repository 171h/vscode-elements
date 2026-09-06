/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {legacyPlugin} from '@web/dev-server-legacy';
import {directoryIndexPlugin} from '@bendera/wds-plugin-directory-index';

export default {
  // Keep the app index virtual so /dev continues to fall through to the
  // directory index plugin. The real /dev/index.html remains directly
  // accessible as the unified component gallery.
  appIndex: 'dev/__index.html',
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
