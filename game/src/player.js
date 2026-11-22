// Night Train Heist — player.js
// The thief: keyboard and click-to-move movement with furniture collision, and his
// two tools — smoke pellets that blind a corridor and coins that turn guards' heads.

import { PLAYER, TOOLS } from './config.js';
import { clampToCar, moveCircle } from './world.js';

export function makePlayer() {
  return {
    x: PLAYER.start.x,
    y: PLAYER.start.y,
    radius: PLAYER.radius,
    facing: 0,
    moveTarget: null,
    smokeLeft: TOOLS.smokeCount,
    coinLeft: TOOLS.coinCount,
    hasDiamond: false,
    haul: 0,
  };
}

export function updatePlayer(player, input, dt) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has('arrowleft') || input.keys.has('a')) dx -= 1;
  if (input.keys.has('arrowright') || input.keys.has('d')) dx += 1;
  if (input.keys.has('arrowup') || input.keys.has('w')) dy -= 1;
  if (input.keys.has('arrowdown') || input.keys.has('s')) dy += 1;

  if (dx !== 0 || dy !== 0) {
    player.moveTarget = null;
    const len = Math.hypot(dx, dy);
    const step = PLAYER.speed * dt;
    const moved = moveCircle(player, (dx / len) * step, (dy / len) * step, player.radius);
    player.x = moved.x;
    player.y = moved.y;
    player.facing = Math.atan2(dy, dx);
    return;
  }

  if (player.moveTarget) {
    const tx = player.moveTarget.x - player.x;
    const ty = player.moveTarget.y - player.y;
    const d = Math.hypot(tx, ty);
    if (d < 5) {
      player.moveTarget = null;
    } else {
      const step = Math.min(d, PLAYER.speed * dt);
      const moved = moveCircle(player, (tx / d) * step, (ty / d) * step, player.radius);
      player.x = moved.x;
      player.y = moved.y;
      player.facing = Math.atan2(ty, tx);
    }
  }
}

// Q: drop a smoke pellet at the thief's feet. Returns the cloud, or null if none left.
export function dropSmoke(player, now) {
  if (player.smokeLeft <= 0) return null;
  player.smokeLeft -= 1;
  return { x: player.x, y: player.y, r: TOOLS.smokeRadius, until: now + TOOLS.smokeSeconds };
}

// E: toss a coin ahead of the thief. Returns where it lands, or null if none left.
export function tossCoin(player) {
  if (player.coinLeft <= 0) return null;
  player.coinLeft -= 1;
  const x = player.x + Math.cos(player.facing) * TOOLS.coinDistance;
  const y = player.y + Math.sin(player.facing) * TOOLS.coinDistance;
  const clamped = clampToCar(x, y, 8);
  return { x: clamped.x, y: clamped.y, until: 0 };
}
