#!/usr/bin/env node

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import {fileURLToPath} from 'node:url';
import {
  collectCommits,
  getLastReleaseRef,
  getRemoteTagObjectId,
  git,
  localTagExists,
  renderChangelog,
  repoRoot,
  resolveVersion,
  resolveVersionTag,
  updateChangelog,
} from './release-lib.mjs';

export async function confirm(rl, question) {
  return ['y', 'yes'].includes(
    (await rl.question(`${question} [y/N] `)).trim().toLowerCase()
  );
}

export async function promptVersionTag(rl, currentVersion, requestedVersion) {
  const suggestedVersion = resolveVersion(currentVersion, requestedVersion);
  const suggestedTag = `v${suggestedVersion}`;

  while (true) {
    const answer = (
      await rl.question(`Version tag [${suggestedTag}]: `)
    ).trim();
    try {
      return resolveVersionTag(currentVersion, answer || suggestedTag);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }
}

function restoreReleaseFiles(originalFiles) {
  const filePaths = [...originalFiles.keys()];
  let restoreIndexError;
  try {
    git(['restore', '--staged', '--', ...filePaths], false, true);
  } catch (error) {
    restoreIndexError = error;
  }
  for (const [filePath, content] of originalFiles)
    fs.writeFileSync(path.join(repoRoot, filePath), content);
  if (restoreIndexError)
    console.warn(
      'Release files were restored, but the Git index could not be restored automatically.'
    );
}

export function buildReleasePushArgs(branch, tag, remoteTagObjectId = '') {
  const branchRef = `refs/heads/${branch}`;
  const tagRef = `refs/tags/${tag}`;
  const forceArgs = remoteTagObjectId
    ? [`--force-with-lease=${tagRef}:${remoteTagObjectId}`]
    : [];
  return [
    'push',
    '--atomic',
    ...forceArgs,
    'origin',
    `${branchRef}:${branchRef}`,
    `${tagRef}:${tagRef}`,
  ];
}

function pushRelease(branch, tag, remoteTagObjectId) {
  git(buildReleasePushArgs(branch, tag, remoteTagObjectId));
}

async function main() {
  if (git(['status', '--porcelain'], true))
    throw new Error(
      'The working tree is not clean. Commit or stash your changes first.'
    );
  const currentVersion = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
  ).version;
  const branch = git(['branch', '--show-current'], true);
  if (!branch) throw new Error('Cannot create a release from a detached HEAD.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const {tag, version} = await promptVersionTag(
      rl,
      currentVersion,
      process.argv[2]
    );
    const hasLocalTag = localTagExists(tag);
    const remoteTagObjectId = getRemoteTagObjectId(tag);
    const hasRemoteTag = Boolean(remoteTagObjectId);
    const existingLocations = [
      hasLocalTag ? 'locally' : '',
      hasRemoteTag ? 'on origin' : '',
    ].filter(Boolean);

    if (
      existingLocations.length &&
      !(await confirm(
        rl,
        `Tag ${tag} already exists ${existingLocations.join(' and ')}. Overwrite it?`
      ))
    ) {
      return console.log('Release cancelled.');
    }

    const isCurrentVersion = version === currentVersion;
    let releaseBase = '';
    let commits = [];
    if (isCurrentVersion) {
      console.log(
        `\n${tag} is the current package version. No version files or release commit will be created.`
      );
      console.log('The tag will point to the current HEAD.');
    } else {
      releaseBase = getLastReleaseRef(currentVersion, tag);
      commits = collectCommits(releaseBase);
      console.log(`\nRelease ${currentVersion} -> ${version}`);
      console.log(
        `Commit range: ${releaseBase ? `${releaseBase}..HEAD` : 'HEAD'}`
      );
      console.log('\nCHANGELOG preview:\n');
      console.log(renderChangelog(version, commits));
      console.log(
        'The release will update versions and CHANGELOG, then create a commit and tag.'
      );
    }

    if (!(await confirm(rl, `Confirm release ${tag}?`)))
      return console.log('Release cancelled.');

    if (!isCurrentVersion) {
      const releaseFiles = [
        'package.json',
        'package-lock.json',
        'CHANGELOG.md',
        'src/includes/VscElement.ts',
      ];
      const originalFiles = new Map(
        releaseFiles.map((filePath) => [
          filePath,
          fs.readFileSync(path.join(repoRoot, filePath)),
        ])
      );

      try {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
        );
        packageJson.version = version;
        fs.writeFileSync(
          path.join(repoRoot, 'package.json'),
          `${JSON.stringify(packageJson, null, 2)}\n`
        );
        const packageLock = JSON.parse(
          fs.readFileSync(path.join(repoRoot, 'package-lock.json'), 'utf8')
        );
        packageLock.version = version;
        packageLock.packages[''].version = version;
        fs.writeFileSync(
          path.join(repoRoot, 'package-lock.json'),
          `${JSON.stringify(packageLock, null, 2)}\n`
        );
        execFileSync('node', ['scripts/update-version-number.mjs'], {
          cwd: repoRoot,
          stdio: 'inherit',
        });
        updateChangelog(version, commits);

        git(['add', '--', ...releaseFiles]);
        git(['commit', '-m', `chore(release): publish ${tag}`]);
      } catch (error) {
        restoreReleaseFiles(originalFiles);
        throw error;
      }
    }

    const tagArgs = [
      'tag',
      ...(hasLocalTag ? ['--force'] : []),
      '-a',
      tag,
      '-m',
      tag,
    ];
    git(tagArgs);
    console.log(
      `\n${hasLocalTag ? 'Updated' : 'Created'} tag ${tag}${isCurrentVersion ? '.' : ' and its release commit.'}`
    );

    const pushQuestion = hasRemoteTag
      ? `Push branch ${branch} and safely force-update ${tag} on origin to publish to npmjs?`
      : `Push branch ${branch} and tag ${tag} to origin to publish to npmjs?`;
    if (await confirm(rl, pushQuestion)) {
      pushRelease(branch, tag, remoteTagObjectId);
      console.log(
        `Tag ${tag} was pushed. The GitHub Actions Release workflow will build and publish nusys-ui@${version} to npmjs using the repository's NPM_TOKEN secret. Check the workflow run for the publish result.`
      );
    } else {
      const branchRef = `refs/heads/${branch}`;
      const tagRef = `refs/tags/${tag}`;
      if (hasRemoteTag) {
        console.log(
          `Push later with: git push --atomic --force-with-lease=${tagRef}:${remoteTagObjectId} origin ${branchRef}:${branchRef} ${tagRef}:${tagRef}`
        );
      } else {
        console.log(
          `Push later with: git push --atomic origin ${branchRef}:${branchRef} ${tagRef}:${tagRef}`
        );
      }
    }
  } finally {
    rl.close();
  }
}

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    console.error(
      `Release failed: ${error instanceof Error ? error.message : error}`
    );
    process.exitCode = 1;
  });
}
