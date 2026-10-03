import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
console.log(
  `压缩包大小：${gzipSync(readFileSync('dist/bundled.js'), {level: 9}).length} 字节（gzip）`
);
