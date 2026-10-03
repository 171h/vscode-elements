import {copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// 文档继续使用当前工具链生成的 bundle，避免由 VitePress 的 Vite 5 转换组件。
export function watchComponentSources() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  let watcher;
  let started;
  let closed = false;
  return {
    name: 'nusys-docs-source-watch',
    apply: 'serve',
    config() {
      // 生成文件由组件监听统一通知，避免 VitePress 同时触发第二次页面重载。
      return {
        server: {
          watch: {
            ignored: [
              resolve(root, 'docs/.vitepress/cache/components').replaceAll(
                '\\',
                '/'
              ) + '/**',
              resolve(root, 'docs/public/assets/nusys-ui.js').replaceAll(
                '\\',
                '/'
              ),
            ],
          },
        },
      };
    },
    configureServer(server) {
      // configureServer 期间 Vue 编译器尚未初始化，不能在此时写入监听文件。
      // 先使用 docs:prepare 的资源，服务器完成初始化后再启动组件构建。
      server.httpServer.once('listening', () => {
        if (closed) return;
        started = start(server).catch((error) => {
          server.config.logger.error(error.message);
          server.ws.send({
            type: 'error',
            err: {message: error.message, stack: error.stack || ''},
          });
        });
      });
    },
    async closeBundle() {
      closed = true;
      await started;
      await watcher?.close();
    },
  };

  async function start(server) {
    // 开发服务器与浏览器并行运行，限制原生构建线程以控制内存占用。
    process.env.RAYON_NUM_THREADS ??= '4';
    const {build} = await import('vite');
    const output = resolve(root, 'docs/.vitepress/cache/components');
    watcher = await build({
      root,
      configFile: resolve(root, 'vite.config.ts'),
      mode: 'bundle',
      logLevel: 'error',
      build: {
        outDir: output,
        emptyOutDir: false,
        sourcemap: false,
        watch: {},
      },
    });
    await new Promise((ready, fail) => {
      let initialized = false;
      let buildFailed = false;
      watcher.on('event', async (event) => {
        if (event.code === 'START') buildFailed = false;
        if (event.code === 'ERROR') {
          buildFailed = true;
          server.config.logger.error(event.error.message);
          if (!initialized) fail(event.error);
          else
            server.ws.send({
              type: 'error',
              err: {
                message: event.error.message,
                stack: event.error.stack || '',
              },
            });
          return;
        }
        if (event.code !== 'END' || buildFailed) return;
        try {
          await copyFile(
            resolve(output, 'bundled.js'),
            resolve(root, 'docs/public/assets/nusys-ui.js')
          );
          if (initialized) {
            // 重新载入独立页面，确保自定义元素使用新的类定义。
            server.ws.send({type: 'full-reload', path: '*'});
            server.config.logger.info('组件源码已更新，正在刷新文档预览。');
          } else {
            initialized = true;
            ready();
          }
        } catch (error) {
          server.config.logger.error(error.message);
          if (!initialized) fail(error);
        }
      });
    }).catch(async (error) => {
      await watcher.close();
      throw error;
    });
  }
}
