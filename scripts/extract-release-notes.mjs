import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

export function extractReleaseNotes(changelog, version) {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = changelog.match(
    new RegExp(
      `^## \\[${escapedVersion}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|(?![\\s\\S]))`,
      'm'
    )
  );
  if (!match) throw new Error(`CHANGELOG entry for ${version} was not found.`);
  return match[1].trim();
}

function main() {
  const version = process.argv[2]?.replace(/^v/, '');
  if (!version)
    throw new Error('Usage: node scripts/extract-release-notes.mjs <version>');
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
  );
  const notes = extractReleaseNotes(
    fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8'),
    version
  );
  fs.mkdirSync(path.join(repoRoot, 'dist'), {recursive: true});
  fs.writeFileSync(path.join(repoRoot, 'dist/release-notes.md'), `${notes}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
