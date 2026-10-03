import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import ts from 'typescript';
import {gzipSync} from 'node:zlib';
import {createServer as createHttpServer} from 'node:http';

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

const manifest = JSON.parse(readFileSync('custom-elements.json', 'utf8'));
for (const module of manifest.modules) {
  assert(
    !/(?:\.test\.ts$|\/(?:testing|test-helpers|browser-commands)\.ts$)/.test(
      module.path
    ),
    '组件清单包含测试代码：' + module.path
  );
}
console.log('组件清单：不包含测试工具和测试用例');

// 验证未经构建工具再转换的单文件产物。
const browser = await chromium.launch({headless: true});
let bundleServer;
try {
  const bundle = readFileSync('dist/bundled.js');
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
  if (bundleServer) await new Promise((resolve) => bundleServer.close(resolve));
}
