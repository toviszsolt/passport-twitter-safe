import * as esbuild from 'esbuild';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path/posix';

const dist = join('dist');

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);

const commonConfig = {
  bundle: true,
  sourcemap: false,
  minify: true,
};

await esbuild.build({
  ...commonConfig,
  platform: 'node',
  format: 'esm',
  entryPoints: [join('src', 'index.js')],
  outfile: join(dist, 'index.js'),
  legalComments: 'none',
});

await esbuild.build({
  ...commonConfig,
  platform: 'node',
  format: 'cjs',
  entryPoints: [join('src', 'index.cjs')],
  outfile: join(dist, 'index.cjs'),
  legalComments: 'none',
});

copyFileSync(join('src', 'index.d.ts'), join(dist, 'index.d.ts'));
