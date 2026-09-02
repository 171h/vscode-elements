#!/usr/bin/env node

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import {
  collectCommits,
  getLastReleaseRef,
  git,
  renderChangelog,
  repoRoot,
  resolveVersion,
  updateChangelog,
} from './release-lib.mjs';

async function confirm(rl, question) {
  return ['y', 'yes'].includes(
    (await rl.question(`${question} [y/N] `)).trim().toLowerCase()
  );
}

async function main() {
  if (git(['status', '--porcelain'], true))
    throw new Error(
      'The working tree is not clean. Commit or stash your changes first.'
    );
  const currentVersion = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
  ).version;
  const version = resolveVersion(currentVersion, process.argv[2]);
  const tag = `v${version}`;
  const releaseBase = getLastReleaseRef(currentVersion);
  const commits = collectCommits(releaseBase);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log(`\nRelease ${currentVersion} -> ${version}`);
    console.log(
      `Commit range: ${releaseBase ? `${releaseBase}..HEAD` : 'HEAD'}`
    );
    console.log('\nCHANGELOG preview:\n');
    console.log(renderChangelog(version, commits));
    console.log(
      'The release will update versions and CHANGELOG, then create a commit and tag.'
    );
    if (!(await confirm(rl, 'Continue?')))
      return console.log('Release cancelled.');

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

    git([
      'add',
      'package.json',
      'package-lock.json',
      'CHANGELOG.md',
      'src/includes/VscElement.ts',
    ]);
    git(['commit', '-m', `chore(release): publish ${tag}`]);
    git(['tag', '-a', tag, '-m', tag]);
    console.log(`\nCreated release commit and tag ${tag}.`);

    if (await confirm(rl, 'Push the release commit and tag to origin?')) {
      const branch = git(['branch', '--show-current'], true);
      if (!branch)
        throw new Error('Cannot push a release from a detached HEAD.');
      git(['push', 'origin', branch]);
      git(['push', 'origin', tag]);
      console.log(
        `Tag ${tag} was pushed. Run the GitHub Actions Release workflow and enter ${tag} to build and publish nusys-ui@${version} to npmjs.`
      );
    } else {
      console.log(`Push later with: git push origin && git push origin ${tag}`);
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(
    `Release failed: ${error instanceof Error ? error.message : error}`
  );
  process.exitCode = 1;
});
