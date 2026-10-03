import assert from 'node:assert/strict';
import {access, readFile, readdir} from 'node:fs/promises';
import {resolve, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {components} from '../docs/data/components.mjs';
import {examples} from '../docs/data/examples.mjs';
import {componentScenarios, extraExamples} from '../docs/data/scenarios.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const docs = resolve(root, 'docs');
const exports = await readFile(resolve(root, 'src/main.ts'), 'utf8');
const exportedIds = new Set(
  Array.from(
    exports.matchAll(/from '\.\/vscode-([a-z-]+)\/index\.js'/g),
    (match) => match[1]
  )
);
assert.deepEqual(
  new Set(components.map((component) => component.id)),
  exportedIds,
  '文档必须覆盖主入口全部组件'
);
assert.equal(components.length, exportedIds.size, '组件索引不能重复');
const tags = new Set(components.map((component) => `vscode-${component.id}`));
for (const component of components) {
  assert.ok(examples[component.example], `${component.id} 缺少示例`);
  assert.ok(
    componentScenarios[component.id]?.length,
    `${component.id} 缺少功能场景`
  );
  const content = await readFile(
    resolve(docs, 'components', `${component.id}.md`),
    'utf8'
  );
  assert.ok(
    content.includes(`<ComponentExamples component="${component.id}" />`),
    `${component.id} 未展示功能场景`
  );
  for (const id of componentScenarios[component.id])
    assert.ok(
      extraExamples[id]?.features.length,
      `${component.id} 的 ${id} 未声明功能覆盖`
    );
  await access(resolve(docs, 'components', `${component.id}.md`));
  await access(resolve(docs, 'api/generated', `${component.id}.md`));
}
for (const [name, example] of Object.entries(examples)) {
  assert.ok(example.title && example.html, `${name} 示例不完整`);
  for (const match of example.html.matchAll(/<(vscode-[a-z-]+)/g))
    assert.ok(tags.has(match[1]), `未知示例标签 ${match[1]}`);
  if (example.js) new Function(example.js);
}
const checks = [
  ['tree-item', /类：`VscodeTreeItem`/],
  ['tree', /vsc-tree-select/],
  ['context-menu', /vsc-context-menu-select/],
  ['tabs', /VscTabsSelectEvent/],
  ['textfield', /<code>percentage<\/code>/],
  ['textfield', /<code>false<\/code>/],
  ['fieldset', /uncheckedMode/],
  ['tabs-group', /vsc-tabs-group-layout-change/],
  ['progress-bar', /<code>indicator<\/code>/],
  ['scrollable', /vsc-scrollable-scroll/],
];
for (const [id, pattern] of checks)
  assert.match(
    await readFile(resolve(docs, 'api/generated', `${id}.md`), 'utf8'),
    pattern
  );
assert.doesNotMatch(
  await readFile(resolve(docs, 'api/generated/tabs.md'), 'utf8'),
  /syncDragTabs|markGeneratedPanel|<code>render\(/,
  '内部方法不可公开'
);
assert.doesNotMatch(
  await readFile(resolve(docs, 'api/generated/context-menu.md'), 'utf8'),
  /vsc-menu-select/,
  '不得沿用失效事件名'
);

async function markdownFiles(directory) {
  const paths = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    if (entry.name === '.vitepress' || entry.name === 'public') continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await markdownFiles(path)));
    else if (entry.name.endsWith('.md')) paths.push(path);
  }
  return paths;
}
const files = await markdownFiles(docs);
for (const file of files) {
  const relativePath = file.slice(docs.length + 1).replace(/\.md$/, '.html');
  const collision = await access(resolve(docs, 'public', relativePath)).then(
    () => true,
    () => false
  );
  assert.equal(collision, false, `${file} 与 public HTML 的构建路径冲突`);
}
const failures = [];
for (const file of files) {
  const text = (await readFile(file, 'utf8')).replace(
    /^```[^\n]*\n[\s\S]*?^```/gm,
    ''
  );
  for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
    const link = match[1]
      .replace(/^<|>$/g, '')
      .split('#')[0]
      .replace(/\/$/, '');
    if (!link || /^(https?:|mailto:)/.test(link)) continue;
    const path = link.startsWith('/')
      ? resolve(docs, `.${link}`)
      : resolve(dirname(file), decodeURIComponent(link));
    const candidates = extname(path)
      ? [path]
      : [path + '.md', resolve(path, 'index.md')];
    const found = await Promise.all(
      candidates.map((candidate) =>
        access(candidate).then(
          () => true,
          () => false
        )
      )
    );
    if (!found.some(Boolean)) failures.push(`${file}: ${link}`);
  }
}
assert.deepEqual(failures, [], '文档包含失效的本地链接');
console.log(
  `已检查 ${components.length} 个组件、${Object.keys(examples).length} 个示例、${files.length} 个 Markdown 页及本地链接。`
);
