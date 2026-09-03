import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import semver from 'semver';

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const changelogPath = path.join(repoRoot, 'CHANGELOG.md');

const changelogGroups = [
  ['feat', 'Added'],
  ['fix', 'Fixed'],
  ['perf', 'Performance'],
  ['refactor', 'Changed'],
  ['docs', 'Documentation'],
  ['test', 'Tests'],
  ['ci', 'Continuous integration'],
  ['chore', 'Maintenance'],
];

export function git(args, capture = false, quiet = false) {
  const output = execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', capture ? 'pipe' : 'inherit', quiet ? 'pipe' : 'inherit'],
  });
  return typeof output === 'string' ? output.trim() : '';
}

export function resolveVersion(currentVersion, requestedVersion) {
  const request = requestedVersion?.replace(/^v/, '') ?? 'patch';
  const nextVersion = ['major', 'minor', 'patch'].includes(request)
    ? semver.inc(currentVersion, request)
    : semver.valid(request);
  if (!nextVersion || !semver.gt(nextVersion, currentVersion)) {
    throw new Error(
      `Invalid version "${requestedVersion}". Use major, minor, patch, or a version newer than ${currentVersion}.`
    );
  }
  return nextVersion;
}

export function resolveVersionTag(currentVersion, requestedTag) {
  const tag = requestedTag.trim();
  if (!tag.startsWith('v'))
    throw new Error(
      `Invalid version tag "${requestedTag}". Tags must start with v.`
    );
  const version = semver.valid(tag.slice(1));
  if (!version || semver.lt(version, currentVersion)) {
    throw new Error(
      `Invalid version tag "${requestedTag}". Use v followed by a semantic version that is not older than ${currentVersion}.`
    );
  }
  return {tag: `v${version}`, version};
}

export function localTagExists(tag) {
  try {
    git(['show-ref', '--verify', '--quiet', `refs/tags/${tag}`], true, true);
    return true;
  } catch (error) {
    if (error?.status === 1) return false;
    throw error;
  }
}

export function getRemoteTagObjectId(tag) {
  try {
    const output = git(
      ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`],
      true,
      true
    );
    return output.split(/\s+/)[0] ?? '';
  } catch (error) {
    if (error?.status === 2) return '';
    throw new Error(`Could not check whether ${tag} exists on origin.`, {
      cause: error,
    });
  }
}

export function getLastReleaseRef(currentVersion, excludedTag = '') {
  try {
    const excludeArgs = excludedTag ? [`--exclude=${excludedTag}`] : [];
    return git(
      ['describe', '--tags', '--abbrev=0', ...excludeArgs, 'HEAD'],
      true,
      true
    );
  } catch {
    const releases = git(['log', '--format=%H%x09%s'], true)
      .split('\n')
      .map((line) => line.split('\t'));
    const releaseSubjects = [
      currentVersion,
      `v${currentVersion}`,
      `chore(release): publish v${currentVersion}`,
    ];
    return (
      releases.find(([, subject]) => releaseSubjects.includes(subject))?.[0] ??
      ''
    );
  }
}

export function collectCommits(lastTag) {
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const output = git(
    ['log', range, '--no-merges', '--pretty=format:%h%x09%s'],
    true
  );
  if (!output) return [];
  return output.split('\n').flatMap((line) => {
    const [hash, subject] = line.split('\t');
    if (/^chore\(release\):/i.test(subject)) return [];
    const match = subject.match(/^([a-z]+)(?:\(([^)]+)\))?:\s+(.+)$/i);
    return [
      {
        hash,
        type: match?.[1].toLowerCase() ?? 'chore',
        scope: match?.[2] ?? '',
        subject: match?.[3] ?? subject,
      },
    ];
  });
}

export function renderChangelog(version, commits, date = new Date()) {
  const lines = [`## [${version}] - ${date.toISOString().slice(0, 10)}`, ''];
  let rendered = false;
  for (const [type, heading] of changelogGroups) {
    const entries = commits.filter((commit) => commit.type === type);
    if (!entries.length) continue;
    rendered = true;
    lines.push(`### ${heading}`, '');
    for (const commit of entries) {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      lines.push(`- ${scope}${commit.subject} (${commit.hash})`);
    }
    lines.push('');
  }
  if (!rendered) lines.push('- No user-facing changes.', '');
  return lines.join('\n');
}

export function updateChangelog(version, commits, filePath = changelogPath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const block = renderChangelog(version, commits);
  const firstRelease = content.search(/^## \[/m);
  if (firstRelease < 0)
    throw new Error('Could not find where to insert the new CHANGELOG entry.');
  fs.writeFileSync(
    filePath,
    `${content.slice(0, firstRelease)}${block}\n${content.slice(firstRelease)}`
  );
}
