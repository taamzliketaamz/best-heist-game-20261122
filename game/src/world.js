// Night Train Heist — world.js
// The layout of the mail-and-luggage car: walls, the furniture that makes the routes,
// the loot on its stands, the door the thief came in (and must leave by), and the
// geometry helpers (collision, line of sight) every other module shares.

import { CAR } from './config.js';

// Solid furniture. Three horizontal routes cross the car: the top corridor along the
// windows, the weave through the luggage in the middle, and the bottom corridor.
// Every stack is cover: it blocks movement and it blocks sight.
export const OBSTACLES = [
  { x: 178, y: 226, w: 152, h: 62, kind: 'luggage' },
  { x: 178, y: 402, w: 152, h: 62, kind: 'luggage' },
  { x: 418, y: 196, w: 62, h: 104, kind: 'crate' },
  { x: 418, y: 330, w: 176, h: 68, kind: 'counter' },
  { x: 418, y: 452, w: 62, h: 60, kind: 'crate' },
  { x: 676, y: 236, w: 152, h: 62, kind: 'luggage' },
  { x: 676, y: 414, w: 152, h: 62, kind: 'luggage' },
  { x: 918, y: 196, w: 62, h: 104, kind: 'crate' },
  { x: 918, y: 452, w: 62, h: 60, kind: 'crate' },
  { x: 896, y: 330, w: 118, h: 68, kind: 'counter' },
  { x: 1122, y: 330, w: 66, h: 72, kind: 'case' },
];

// The getaway door in the left wall: slip in here, and get back here with the diamond.
export const DOOR = { x: CAR.x, y: 322, w: 26, h: 96 };

// Everything worth stealing. The diamond is the job; the other two are gravy.
export function makeLoot() {
  return [
    { id: 'diamond', name: 'Star of Java', x: 1155, y: 366, value: 50000, taken: false, main: true },
    { id: 'watch', name: 'Gold Watch', x: 506, y: 300, value: 8000, taken: false, main: false },
    { id: 'necklace', name: 'Ruby Necklace', x: 752, y: 540, value: 12000, taken: false, main: false },
  ];
}

export function clampToCar(x, y, r) {
  return {
    x: Math.min(CAR.x + CAR.w - r, Math.max(CAR.x + r, x)),
    y: Math.min(CAR.y + CAR.h - r, Math.max(CAR.y + r, y)),
  };
}

export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.min(rect.x + rect.w, Math.max(rect.x, cx));
  const ny = Math.min(rect.y + rect.h, Math.max(rect.y, cy));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

// Move a circle one axis at a time so it slides along furniture instead of sticking.
export function moveCircle(pos, dx, dy, r) {
  const next = { x: pos.x + dx, y: pos.y + dy };
  const clampedX = clampToCar(next.x, pos.y, r);
  next.x = clampedX.x;
  for (const o of OBSTACLES) {
    if (circleHitsRect(next.x, pos.y, r, o)) {
      next.x = dx > 0 ? o.x - r : o.x + o.w + r;
    }
  }
  const clamped = clampToCar(next.x, next.y, r);
  next.x = clamped.x;
  next.y = clamped.y;
  for (const o of OBSTACLES) {
    if (circleHitsRect(next.x, next.y, r, o)) {
      next.y = dy > 0 ? o.y - r : o.y + o.h + r;
    }
  }
  const finalClamp = clampToCar(next.x, next.y, r);
  return finalClamp;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Liang–Barsky: does the segment cross the rect at all?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - rect.x, rect.x + rect.w - x1, y1 - rect.y, rect.y + rect.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

function segmentCrossesCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.min(1, Math.max(0, t));
  const px = x1 + t * dx - cx;
  const py = y1 + t * dy - cy;
  return px * px + py * py < r * r;
}

// Clear sight between two points: no furniture in the way and no smoke cloud in the way.
export function lineOfSight(x1, y1, x2, y2, smokeClouds) {
  for (const o of OBSTACLES) {
    if (segmentHitsRect(x1, y1, x2, y2, o)) return false;
  }
  for (const s of smokeClouds || []) {
    if (segmentCrossesCircle(x1, y1, x2, y2, s.x, s.y, s.r)) return false;
  }
  return true;
}

export function angleLerp(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, t);
}

export function angleBetween(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
