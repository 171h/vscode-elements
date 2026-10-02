import assert from 'node:assert/strict';
import {createServer, preview} from 'vite';
import {chromium} from 'playwright';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import ts from 'typescript';
import {gzipSync} from 'node:zlib';
import {createServer as createHttpServer} from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

// 模块产物只能导入包内文件或已声明的运行时依赖。
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const externalPackages = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.peerDependencies,
});
for (const file of readdirSync('dist', {recursive: true})) {
  if (!file.endsWith('.js')) continue;
  const path = resolve('dist', file);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest
  );
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)
    )
      continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier)) continue;
    const id = specifier.text;
    assert(
      id.startsWith('.')
        ? existsSync(resolve(dirname(path), id))
        : externalPackages.some(
            (name) => id === name || id.startsWith(name + '/')
          ),
      `${file} 导入了缺失文件或未声明依赖：${id}`
    );
  }
}
console.log('模块产物：所有导入均指向包内文件或已声明依赖');

// 验证开发服务器、生产示例以及未经 Vite 再转换的单文件产物。
const browser = await chromium.launch({headless: true});
const development = await createServer({
  server: {host: '127.0.0.1', port: 0, open: false},
});
let production;
let bundleServer;
try {
  await development.listen();
  production = await preview({
    build: {outDir: 'demo-dist'},
    preview: {host: '127.0.0.1', port: 0, open: false},
  });
  for (const [name, url] of [
    ['开发', development.resolvedUrls.local[0]],
    ['生产', production.resolvedUrls.local[0]],
  ]) {
    const page = await browser.newPage({viewport: {width: 1280, height: 1000}});
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url + 'dev/index.html');
    await page.waitForFunction(
      () =>
        document.querySelector('vscode-textfield')?.shadowRoot &&
        document.querySelector('dev-theme-selector')?.shadowRoot
    );
    for (const theme of ['dark-v2', 'light-v2', 'hc-black', 'hc-light']) {
      await page.locator('dev-theme-selector select').selectOption(theme);
      await page.waitForFunction(
        (id) => document.documentElement.dataset.theme === id,
        theme
      );
      assert(await page.locator('vscode-textfield').first().isVisible());
    }
    for (const size of ['small', 'medium', 'large']) {
      await page.locator('[data-global-size="' + size + '"]').click();
      assert.equal(
        await page
          .locator('main vscode-textfield')
          .first()
          .getAttribute('size'),
        size
      );
    }
    const disabled = page.locator('vscode-button[disabled]').first();
    assert(await disabled.count());
    await page.locator('#filter-control').click();
    await page.keyboard.type('textfield');
    assert.equal(
      await page.locator('#filter-control').evaluate((el) => el.value),
      'textfield'
    );
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement !== document.body));
    await page.goto(url + 'dev/_template-csp.html');
    await page.waitForFunction(() => !!customElements.get('vscode-button'));
    assert.deepEqual(errors, [], name + '页面运行时错误');
    await page.close();
    for (const script of [
      'scripts/test-tabs-drag.mjs',
      'scripts/test-fieldset-themes.mjs',
    ]) {
      const {stdout} = await promisify(execFile)(process.execPath, [
        script,
        url.replace(/\/$/, ''),
      ]);
      console.log(stdout.trim());
    }
    console.log(name + '：主题、尺寸、禁用状态、输入、键盘焦点和 CSP 通过');
  }
  const bundle = readFileSync('dist/bundled.js');
  const manifest = JSON.parse(readFileSync('custom-elements.json', 'utf8'));
  const tags = manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.customElement && declaration.tagName)
    .map((declaration) => declaration.tagName);
  bundleServer = createHttpServer((request, response) => {
    response.setHeader(
      'Content-Type',
      request.url === '/bundle.js' ? 'text/javascript' : 'text/html'
    );
    response.end(
      request.url === '/bundle.js'
        ? bundle
        : '<script type="module" src="/bundle.js"></script><vscode-button>保存</vscode-button><vscode-textfield value="hello"></vscode-textfield>'
    );
  });
  await new Promise((resolve) => bundleServer.listen(0, '127.0.0.1', resolve));
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:' + bundleServer.address().port);
  await page.waitForFunction(
    () => !!document.querySelector('vscode-button')?.shadowRoot
  );
  const missing = await page.evaluate(
    (names) => names.filter((name) => !customElements.get(name)),
    tags
  );
  assert.deepEqual(missing, []);
  assert.equal(
    await page.locator('vscode-textfield').evaluate((el) => el.value),
    'hello'
  );
  console.log(
    '单文件包：' +
      tags.length +
      ' 个组件注册通过，gzip ' +
      gzipSync(bundle, {level: 9}).length +
      ' 字节'
  );
} finally {
  await browser.close();
  await development.close();
  if (production)
    await new Promise((resolve) => production.httpServer.close(resolve));
  if (bundleServer) await new Promise((resolve) => bundleServer.close(resolve));
}
