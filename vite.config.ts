import {defineConfig} from 'vite';
import {readdirSync} from 'node:fs';
const files = (dir: string, extension: string) =>
  readdirSync(dir, {recursive: true})
    .filter(
      (file): file is string =>
        typeof file === 'string' && file.endsWith(extension)
    )
    .map((file) => dir + '/' + file);
import {relative} from 'node:path';

const sources = files('src', '.ts').filter(
  (file) =>
    !file.endsWith('.test.ts') &&
    !file.includes('test-helpers') &&
    !file.includes('testing') &&
    !file.includes('browser-commands')
);

export default defineConfig(({mode}) => ({
  server: {port: 8000, open: '/dev/index.html'},
  preview: {port: 8000},
  html: {cspNonce: 'abc123'},
  build:
    mode === 'demo'
      ? {
          outDir: 'demo-dist',
          rolldownOptions: {input: files('dev', '.html')},
        }
      : {
          target: 'es2021',
          sourcemap: true,
          emptyOutDir: mode !== 'bundle',
          minify: mode === 'bundle',
          lib: {
            entry:
              mode === 'bundle'
                ? 'src/main.ts'
                : Object.fromEntries(
                    sources.map((file) => [
                      relative('src', file)
                        .replace(/\\/g, '/')
                        .replace(/\.ts$/, ''),
                      file,
                    ])
                  ),
            formats: ['es'],
            fileName:
              mode === 'bundle'
                ? () => 'bundled.js'
                : (_format, name) => name + '.js',
          },
          rolldownOptions:
            mode === 'bundle'
              ? // 单文件产物启用完整压缩；模块产物保留可供使用方优化的代码。
                {output: {minify: true, comments: false}}
              : {
                  external: (id) =>
                    !id.startsWith('.') &&
                    !id.startsWith('/') &&
                    !/^[A-Za-z]:/.test(id),
                  output: {preserveModules: true, preserveModulesRoot: 'src'},
                },
        },
}));
