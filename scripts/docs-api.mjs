import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import ts from 'typescript';
import {components} from '../docs/data/components.mjs';

const lifecycle = new Set([
  'constructor',
  'render',
  'connectedCallback',
  'disconnectedCallback',
  'attributeChangedCallback',
  'firstUpdated',
  'updated',
  'update',
  'willUpdate',
  'shouldUpdate',
  'createRenderRoot',
  'formAssociatedCallback',
  'formDisabledCallback',
  'formResetCallback',
  'formStateRestoreCallback',
  'styles',
  'formAssociated',
]);
const html = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;');
const code = (value) =>
  value === undefined || value === ''
    ? '—'
    : `<code>${html(value).replace(/\r?\n/g, ' ')}</code>`;
const prose = (value) =>
  value
    ? html(value)
        .replace(/\r?\n/g, '<br>')
        .replace(/\{@link ([^}]+)\}/g, '$1')
    : '—';
const table = (headers, rows) =>
  rows.length
    ? `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map((row) => `| ${row.join(' | ')} |`).join('\n')}\n`
    : '源码未声明此类接口。\n';

async function sourceFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? sourceFiles(resolve(directory, entry.name))
        : entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
          ? [resolve(directory, entry.name)]
          : []
    )
  );
  return nested.flat();
}

function eventFromNode(node, source) {
  if (
    !ts.isNewExpression(node) ||
    !['Event', 'CustomEvent', 'InputEvent'].includes(
      node.expression.getText(source)
    )
  )
    return;
  const [name, options] = node.arguments || [];
  if (!name || !ts.isStringLiteral(name)) return;
  const flags = {bubbles: false, composed: false, cancelable: false};
  let detail;
  if (options && ts.isObjectLiteralExpression(options)) {
    for (const property of options.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.getText(source);
      if (key in flags)
        flags[key] = property.initializer.getText(source) === 'true';
      if (key === 'detail') detail = property.initializer.getText(source);
    }
  }
  return {
    name: name.text,
    type: {text: node.expression.getText(source)},
    flags,
    detail,
  };
}

export async function generateApi(root) {
  const manifest = JSON.parse(
    await readFile(resolve(root, 'custom-elements.json'), 'utf8')
  );
  const paths = await sourceFiles(resolve(root, 'src'));
  const program = ts.createProgram(paths, {
    target: ts.ScriptTarget.ES2022,
    experimentalDecorators: true,
    moduleResolution: ts.ModuleResolutionKind.Node10,
  });
  const checker = program.getTypeChecker();
  const classes = new Map();
  const aliases = new Map();
  const sources = new Map();
  for (const path of paths) {
    const source = program.getSourceFile(path);
    const info = {
      text: source.text,
      events: [],
      eventTypes: new Map(),
      slots: [],
      parts: [],
    };
    const visit = (node) => {
      if (ts.isClassDeclaration(node) && node.name) {
        const decorators = ts.getDecorators(node) || [];
        const tag = decorators.find(
          (d) =>
            ts.isCallExpression(d.expression) &&
            d.expression.expression.getText(source) === 'customElement'
        )?.expression.arguments[0]?.text;
        const members = new Map(
          node.members
            .filter((member) => member.name)
            .map((member) => [member.name.getText(source), member])
        );
        classes.set(node.name.text, {tag, members, source, path});
      }
      if (
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
        node.name
      ) {
        aliases.set(
          node.name.text,
          node.getText(source).replace(/^export\s+/, '')
        );
        if (
          ts.isInterfaceDeclaration(node) &&
          node.name.text === 'HTMLElementEventMap'
        ) {
          for (const member of node.members)
            if (member.name && ts.isStringLiteral(member.name))
              info.eventTypes.set(
                member.name.text,
                member.type?.getText(source)
              );
        }
      }
      const event = eventFromNode(node, source);
      if (event) info.events.push(event);
      ts.forEachChild(node, visit);
    };
    visit(source);
    info.slots = Array.from(source.text.matchAll(/<slot\b([^>]*)>/g)).map(
      (match) => ({name: match[1].match(/\bname=["']([^"']*)["']/)?.[1] || ''})
    );
    info.parts = Array.from(source.text.matchAll(/\bpart=["']([^"']+)["']/g))
      .flatMap((match) => match[1].split(/\s+/))
      .filter((name) => !name.includes('$'));
    sources.set(relative(root, path).replaceAll('\\', '/'), info);
  }
  const output = resolve(root, 'docs/api/generated');
  // 只替换指定的 API 生成目录，不涉及手写文档。
  await rm(output, {recursive: true, force: true});
  await mkdir(output, {recursive: true});
  for (const component of components) {
    const declaration = manifest.modules
      .flatMap((module) =>
        (module.declarations || []).map((d) => ({
          ...d,
          modulePath: module.path,
        }))
      )
      .find((d) => classes.get(d.name)?.tag === `vscode-${component.id}`);
    if (!declaration) throw new Error(`未找到公开组件 vscode-${component.id}`);
    const owner = classes.get(declaration.name);
    const sourceInfo = sources.get(
      relative(root, owner.path).replaceAll('\\', '/')
    );
    const getNode = (member) =>
      (classes.get(member.inheritedFrom?.name) || owner).members.get(
        member.name
      );
    const members = (declaration.members || []).filter((member) => {
      if (
        (member.privacy && member.privacy !== 'public') ||
        member.name.startsWith('_') ||
        lifecycle.has(member.name)
      )
        return false;
      const node = getNode(member);
      if (node && /@internal\b/.test(node.getFullText())) return false;
      return true;
    });
    const typeOf = (member) => {
      if (member.type?.text) return member.type.text;
      const node = getNode(member);
      return node
        ? checker.typeToString(checker.getTypeAtLocation(node))
        : undefined;
    };
    const defaultOf = (member) => {
      if (member.default !== undefined) return member.default;
      const node = getNode(member);
      if (node?.body) {
        const backing = node.body.statements.find(
          ts.isReturnStatement
        )?.expression;
        if (backing && ts.isPropertyAccessExpression(backing)) {
          const field = (
            classes.get(member.inheritedFrom?.name) || owner
          ).members.get(backing.name.text);
          return field?.initializer?.getText();
        }
      }
      return undefined;
    };
    const fields = members.filter((member) => member.kind === 'field');
    const methods = members.filter((member) => member.kind === 'method');
    const events = new Map(
      (declaration.events || []).map((event) => [event.name, {...event}])
    );
    const relatedFiles = [sourceInfo];
    if (component.id === 'tabs')
      relatedFiles.push(sources.get('src/vscode-tabs/drag-controller.ts'));
    if (component.id === 'tabs-group')
      relatedFiles.push(
        sources.get('src/vscode-tabs-group/drag-controller.ts')
      );
    for (const info of relatedFiles.filter(Boolean)) {
      for (const event of info.events) {
        // 内部通讯事件不作为公共使用接口。
        if (
          event.name.includes('internal') ||
          (component.id === 'context-menu-item' && event.name === 'vsc-click')
        )
          continue;
        events.set(event.name, {
          ...event,
          ...events.get(event.name),
          flags: event.flags,
          detail: event.detail,
        });
      }
    }
    if (component.id === 'context-menu') events.delete('vsc-menu-select');
    const eventTypeCorrections = {
      'vsc-tabs-select': 'VscTabsSelectEvent',
      ...Object.fromEntries(sourceInfo.eventTypes),
    };
    for (const event of events.values())
      if (eventTypeCorrections[event.name])
        event.type = {text: eventTypeCorrections[event.name]};
    const slots = new Map(
      (declaration.slots || []).map((slot) => [slot.name, slot])
    );
    for (const slot of sourceInfo.slots)
      if (!slots.has(slot.name)) slots.set(slot.name, slot);
    const parts = new Map(
      (declaration.cssParts || []).map((part) => [part.name, part])
    );
    for (const part of sourceInfo.parts)
      if (!parts.has(part)) parts.set(part, {name: part});
    let body = `# ${component.title} API\n\n此页由当前源码生成。标签：\`vscode-${component.id}\`；类：\`${declaration.name}\`。\n\n[使用说明与示例](../../components/${component.id}) · [API 索引](../index)\n\n`;
    body += `## 属性\n\n${table(
      ['JavaScript 属性', 'HTML 特性', '类型', '默认值', '反射', '说明'],
      fields.map((member) => [
        code((member.static ? `${declaration.name}.` : '') + member.name),
        code(member.attribute?.toLowerCase()),
        code(typeOf(member)),
        code(defaultOf(member)),
        member.reflects ? '是' : '否',
        prose(member.description) + (member.readonly ? '（只读）' : ''),
      ])
    )}\n`;
    body += `## 方法\n\n${table(
      ['方法签名', '返回类型', '说明'],
      methods.map((member) => {
        const node = getNode(member);
        const signature =
          node && ts.isMethodDeclaration(node)
            ? checker.getSignatureFromDeclaration(node)
            : undefined;
        const returnType =
          member.return?.type?.text ||
          (signature
            ? checker.typeToString(checker.getReturnTypeOfSignature(signature))
            : undefined);
        return [
          code(
            `${member.static ? declaration.name + '.' : ''}${member.name}(${(member.parameters || []).map((parameter) => `${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type?.text || 'unknown'}${parameter.default !== undefined ? ' = ' + parameter.default : ''}`).join(', ')})`
          ),
          code(returnType),
          prose(member.description),
        ];
      })
    )}\n`;
    body += `## 事件\n\n${table(
      ['事件', '类型', 'bubbles / composed / cancelable', '说明'],
      Array.from(events.values()).map((event) => [
        code(event.name),
        code(event.type?.text),
        event.flags
          ? Object.values(event.flags).map(String).join(' / ')
          : '未声明',
        prose(event.description),
      ])
    )}\n`;
    const typeNames = new Set();
    for (const event of events.values()) {
      const type = event.type?.text;
      if (aliases.has(type)) typeNames.add(type);
      else if (event.detail)
        body += `\`${event.name}\` 的 detail 构造：\n\n\`\`\`ts\n${event.detail}\n\`\`\`\n\n`;
    }
    body += `## 插槽\n\n${table(
      ['名称', '说明'],
      Array.from(slots.values()).map((slot) => [
        slot.name ? code(slot.name) : '默认插槽',
        prose(slot.description),
      ])
    )}\n`;
    body += `## CSS 部件\n\n${table(
      ['名称', '说明'],
      Array.from(parts.values()).map((part) => [
        code(part.name),
        prose(part.description),
      ])
    )}\n`;
    body += `## CSS 自定义属性\n\n${table(
      ['名称', '回退值', '说明'],
      (declaration.cssProperties || []).map((property) => [
        code(property.name),
        code(property.default),
        prose(property.description),
      ])
    )}\n`;
    for (const field of fields) {
      for (const word of (typeOf(field) || '').matchAll(/\b[A-Z][A-Za-z]+\b/g))
        if (aliases.has(word[0])) typeNames.add(word[0]);
    }
    if (typeNames.size)
      body += `## 相关类型\n\n${Array.from(typeNames)
        .map((name) => `\`\`\`ts\n${aliases.get(name)}\n\`\`\``)
        .join('\n\n')}\n`;
    await writeFile(resolve(output, `${component.id}.md`), body);
  }
  console.log(`已从源码生成 ${components.length} 个组件的 API。`);
}
