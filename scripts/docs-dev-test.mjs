import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vitepress';
import {chromium} from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixtures = resolve(root, 'coverage');
await mkdir(fixtures, {recursive: true});
const fixture = await mkdtemp(resolve(fixtures, 'docs-dev-'));
let server;
let browser;
try {
  // 在独立副本中实际编辑文件，避免测试覆盖开发者的工作区。
  for (const name of [
    'src',
    'docs',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
  ])
    await cp(resolve(root, name), resolve(fixture, name), {
      recursive: true,
      filter: (path) =>
        !['docs/.vitepress/dist', 'docs/.vitepress/cache'].some((excluded) => {
          const target = resolve(root, excluded);
          return path === target || path.startsWith(target + sep);
        }),
    });
  await mkdir(resolve(fixture, 'scripts'));
  await cp(
    resolve(root, 'scripts/docs-source-watch.mjs'),
    resolve(fixture, 'scripts/docs-source-watch.mjs')
  );
  await symlink(
    resolve(root, 'node_modules'),
    resolve(fixture, 'node_modules'),
    'junction'
  );
  const startServer = () =>
    createServer(resolve(fixture, 'docs'), {
      host: '127.0.0.1',
      port: 0,
      base: '/watch-test/',
    });
  // 首次启动生成缓存，再使用同一缓存重启，覆盖初始化前的文件变更竞态。
  server = await startServer();
  await server.listen();
  await server.close();
  server = await startServer();
  await server.listen();
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') console.error(message.text());
  });
  await page.goto(server.resolvedUrls.local[0]);
  await page.getByRole('heading', {name: '为 VS Code 扩展构建界面'}).waitFor();
  assert.equal(
    await page.locator('vite-error-overlay').count(),
    0,
    '首页启动不得出现错误遮罩'
  );
  await page.goto(server.resolvedUrls.local[0] + 'components/button');
  const preview = async () => {
    try {
      const iframe = await page
        .locator('.example-frame')
        .first()
        .elementHandle();
      const frame = await iframe.contentFrame();
      await frame.waitForFunction(
        () => document.documentElement.dataset.ready === 'true'
      );
      return frame;
    } catch (error) {
      console.error(
        '预览加载失败：',
        page.url(),
        errors,
        await page.locator('body').innerText()
      );
      throw error;
    }
  };
  await preview();
  assert.equal(
    await page.locator('vite-error-overlay').count(),
    0,
    '带缓存重启不得出现错误遮罩'
  );

  const markdown = resolve(fixture, 'docs/components/button.md');
  await writeFile(
    markdown,
    (await readFile(markdown, 'utf8')) + '\n开发热更新检查\n'
  );
  await page.getByText('开发热更新检查', {exact: true}).waitFor();

  const vue = resolve(fixture, 'docs/.vitepress/theme/ExamplePreview.vue');
  await writeFile(
    vue,
    (await readFile(vue, 'utf8')).replace(
      'class="example"',
      'class="example" data-dev-vue="updated"'
    )
  );
  await page.locator('[data-dev-vue="updated"]').first().waitFor();
  assert.equal(
    await page.locator('vite-error-overlay').count(),
    0,
    'Vue 主题热更新不得出现错误遮罩'
  );

  const update = async (path, transform) => {
    const navigation = page.waitForEvent('load');
    const source = await readFile(path, 'utf8');
    await writeFile(path, transform(source));
    await navigation;
    return preview();
  };
  let frame = await update(
    resolve(fixture, 'src/vscode-button/vscode-button.styles.ts'),
    (source) => source.replace('.base {', '.base { letter-spacing: 7px;')
  );
  assert.equal(
    await frame
      .locator('vscode-button')
      .first()
      .evaluate(
        (element) =>
          getComputedStyle(element.shadowRoot.querySelector('[part="base"]'))
            .letterSpacing
      ),
    '7px',
    '保存组件样式后必须自动加载新样式'
  );
  frame = await update(
    resolve(fixture, 'src/vscode-button/vscode-button.ts'),
    (source) =>
      source.replace('part="base"', 'part="base" data-dev-test="updated"')
  );
  assert.equal(
    await frame.locator('vscode-button [data-dev-test="updated"]').count(),
    await frame.locator('vscode-button').count(),
    '保存组件实现后必须自动注册新的类定义'
  );
  const implementation = resolve(fixture, 'src/vscode-button/vscode-button.ts');
  const validSource = await readFile(implementation, 'utf8');
  await writeFile(implementation, validSource + '\nconst = ;\n');
  await page.locator('vite-error-overlay').waitFor();
  frame = await update(implementation, () => validSource);
  assert.equal(await page.locator('vite-error-overlay').count(), 0);
  assert.ok(
    await frame.locator('vscode-button [data-dev-test="updated"]').count()
  );
  assert.deepEqual(errors, []);
  console.log(
    '已验证首页与带缓存重启、子路径下的 Markdown 和 Vue 热更新、组件样式与实现自动重载、编译错误提示与恢复，原始工作区未修改。'
  );
} finally {
  await browser?.close();
  await server?.close();
  if (!fixture.startsWith(fixtures + sep)) throw new Error('测试目录路径越界');
  await rm(fixture, {recursive: true, force: true});
}
