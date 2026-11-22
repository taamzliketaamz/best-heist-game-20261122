// Night Train Heist — entrypoint for the make.fun hand-in (Node 22, standard library only).
//
// What this program does: it copies the finished game (game/, plain static files a desktop
// browser runs offline) and its screenshots (screenshots/) into the output directory, then
// writes dossier.json there with buildDossier from the vendored make.fun library, using the
// exact caps the bounty gate grades with. The gate rebuilds the dossier from the same files
// and compares it byte for byte, so nothing here may improvise: same files in, same bytes out.
//
// Run it the way the grader does:  MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The output directory itself is a mount point in the grader: never remove it, only clear
// what is inside, so a second run starts from the same empty directory as the first.
mkdirSync(outputDir, { recursive: true });
for (const name of readdirSync(outputDir)) {
  rmSync(join(outputDir, name), { recursive: true, force: true });
}

cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The gate's own caps (from the kit's RULES.txt): at most 4 screenshots of at most 256 KiB,
// at most 993 game files and 48 MiB of game, no game path over 1000 bytes, and the dossier
// text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
