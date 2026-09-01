import assert from 'node:assert/strict';
import test from 'node:test';

import {renderChangelog, resolveVersion} from './release-lib.mjs';

test('resolveVersion accepts release types and explicit versions', () => {
  assert.equal(resolveVersion('2.5.1', 'patch'), '2.5.2');
  assert.equal(resolveVersion('2.5.1', 'minor'), '2.6.0');
  assert.equal(resolveVersion('2.5.1', 'v3.0.0'), '3.0.0');
  assert.throws(() => resolveVersion('2.5.1', '2.5.0'), /Invalid version/);
});

test('renderChangelog groups conventional commits', () => {
  const result = renderChangelog(
    '2.6.0',
    [
      {
        hash: 'abc1234',
        type: 'feat',
        scope: 'button',
        subject: 'add busy state',
      },
      {
        hash: 'def5678',
        type: 'fix',
        scope: '',
        subject: 'correct focus handling',
      },
    ],
    new Date('2026-09-01T00:00:00Z')
  );
  assert.match(result, /^## \[2\.6\.0\] - 2026-09-01/);
  assert.match(
    result,
    /### Added\n\n- \*\*button\*\*: add busy state \(abc1234\)/
  );
  assert.match(result, /### Fixed\n\n- correct focus handling \(def5678\)/);
});
