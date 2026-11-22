// Night Train Heist — cameras.js
// The two security cameras: bolted to the car walls, sweeping their red cones back
// and forth over the routes the thief most wants to use.

import { CAMERA } from './config.js';

export function makeCameras() {
  return [
    {
      id: 0,
      x: 330,
      y: 100,
      baseAngle: Math.PI / 2, // looks down from the top wall
      phase: 0,
      period: 5.6,
      angle: Math.PI / 2,
      seesThief: false,
    },
    {
      id: 1,
      x: 1006,
      y: 632,
      baseAngle: -Math.PI / 2, // looks up from the bottom wall
      phase: 2.4,
      period: 6.8,
      angle: -Math.PI / 2,
      seesThief: false,
    },
  ];
}

export function updateCamera(camera, now) {
  const swing = Math.sin(((now + camera.phase) / camera.period) * Math.PI * 2);
  camera.angle = camera.baseAngle + swing * CAMERA.sweepArc;
}

export function coneContains(vx, vy, facing, range, halfAngle, px, py) {
  const dx = px - vx;
  const dy = py - vy;
  const d2 = dx * dx + dy * dy;
  if (d2 > range * range) return false;
  if (d2 < 4) return true;
  const to = Math.atan2(dy, dx);
  let diff = Math.abs(to - facing) % (Math.PI * 2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff < halfAngle;
}
