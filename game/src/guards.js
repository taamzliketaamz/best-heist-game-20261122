// Night Train Heist — guards.js
// The three train guards: their patrol routes, how they walk them, how their facing
// swings, and how a tossed coin can pull their eyes away from the thief.

import { GUARD } from './config.js';
import { angleBetween, angleLerp, distance } from './world.js';

const ROUTES = [
  // Top corridor guard, end to end along the windows.
  { points: [{ x: 150, y: 162 }, { x: 1086, y: 162 }], speed: 64 },
  // Bottom corridor guard, walking the other way.
  { points: [{ x: 1086, y: 566 }, { x: 150, y: 566 }], speed: 59 },
  // Middle guard looping the luggage block, down the lanes the thief weaves through.
  {
    points: [
      { x: 620, y: 496 },
      { x: 620, y: 190 },
      { x: 862, y: 190 },
      { x: 862, y: 496 },
    ],
    speed: 55,
  },
];

export function makeGuards() {
  return ROUTES.map((route, i) => ({
    id: i,
    x: route.points[0].x,
    y: route.points[0].y,
    route,
    targetIndex: 1,
    speed: route.speed,
    facing: i === 1 ? Math.PI : 0,
    lureUntil: -1,
    lureX: 0,
    lureY: 0,
    seesThief: false,
  }));
}

export function updateGuard(guard, dt, now, coin) {
  // A live coin lure owns the guard: he stops and stares at where it landed.
  if (coin && now < guard.lureUntil) {
    const want = angleBetween(guard.x, guard.y, guard.lureX, guard.lureY);
    guard.facing = angleLerp(guard.facing, want, GUARD.turnRate * dt);
    return;
  }
  const target = guard.route.points[guard.targetIndex];
  const d = distance(guard.x, guard.y, target.x, target.y);
  if (d < 6) {
    guard.targetIndex = (guard.targetIndex + 1) % guard.route.points.length;
    return;
  }
  const vx = ((target.x - guard.x) / d) * guard.speed;
  const vy = ((target.y - guard.y) / d) * guard.speed;
  guard.x += vx * dt;
  guard.y += vy * dt;
  const want = Math.atan2(vy, vx);
  guard.facing = angleLerp(guard.facing, want, GUARD.turnRate * dt);
}

// Called when a coin lands: every guard close enough turns to look at it.
export function lureGuards(guards, coin, now, seconds, radius) {
  for (const guard of guards) {
    if (distance(guard.x, guard.y, coin.x, coin.y) < radius) {
      guard.lureUntil = now + seconds;
      guard.lureX = coin.x;
      guard.lureY = coin.y;
    }
  }
}
