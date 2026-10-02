import {copyFile, mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateApi} from './docs-api.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
await generateApi(root);
const assets = resolve(root, 'docs/public/assets');
await mkdir(assets, {recursive: true});
for (const [source, destination] of [
  ['dist/bundled.js', 'nusys-ui.js'],
  ['node_modules/@vscode/codicons/dist/codicon.css', 'codicon.css'],
  ['node_modules/@vscode/codicons/dist/codicon.ttf', 'codicon.ttf'],
]) {
  await copyFile(resolve(root, source), resolve(assets, destination));
}
console.log('已生成当前源码 API 与文档示例资源。');
