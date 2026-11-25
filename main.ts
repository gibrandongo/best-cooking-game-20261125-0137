// Ember & Thyme — make.fun entry program (program/v1).
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Node standard library only, deterministic:
// two runs write byte-identical output.
//
// The grader runs as uid 65534 with a read-only parent of /output, so
// this program never removes the output directory itself: it creates it
// (mkdirSync recursive) and clears only the directory's contents.
import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function clearDirectoryContents(dir) {
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dest, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTree(from, to);
    } else if (st.isFile()) {
      cpSync(from, to);
    }
  }
}

mkdirSync(outputDir, { recursive: true });
clearDirectoryContents(outputDir);

const gameSrc = join(repoRoot, 'game');
const shotsSrc = join(repoRoot, 'screenshots');
if (!existsSync(gameSrc)) throw new Error('game/ is missing from the repository');
if (!existsSync(shotsSrc)) throw new Error('screenshots/ is missing from the repository');
copyTree(gameSrc, join(outputDir, 'game'));
copyTree(shotsSrc, join(outputDir, 'screenshots'));

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
