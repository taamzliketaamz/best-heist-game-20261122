// Night Train Heist — alarm.js
// Detection and the alarm meter: who can see the thief right now (vision cone plus a
// clear line of sight), how fast the alarm climbs for each watcher, and how it cools
// down again while the thief stays hidden. Full meter means a fair catch: the thief
// always gets time to break the line of sight first.

import { ALARM, CAMERA, GUARD } from './config.js';
import { coneContains } from './cameras.js';
import { lineOfSight } from './world.js';

export function makeAlarm() {
  return { level: 0, peak: 0, spottedBy: null };
}

function hiddenInSmoke(player, smokeClouds) {
  for (const s of smokeClouds) {
    const dx = player.x - s.x;
    const dy = player.y - s.y;
    if (dx * dx + dy * dy < s.r * s.r) return true;
  }
  return false;
}

// Works out every watcher's view of the thief and moves the meter. Returns true the
// moment the meter fills and the thief is caught.
export function updateAlarm(alarm, player, guards, cameras, smokeClouds, dt) {
  let heat = 0;
  let watcher = null;
  const inSmoke = hiddenInSmoke(player, smokeClouds);

  for (const guard of guards) {
    guard.seesThief =
      !inSmoke &&
      coneContains(guard.x, guard.y, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, player.x, player.y) &&
      lineOfSight(guard.x, guard.y, player.x, player.y, smokeClouds);
    if (guard.seesThief) {
      heat += ALARM.guardRate;
      watcher = 'guard';
    }
  }
  for (const camera of cameras) {
    camera.seesThief =
      !inSmoke &&
      coneContains(camera.x, camera.y, camera.angle, CAMERA.visionRange, CAMERA.visionHalfAngle, player.x, player.y) &&
      lineOfSight(camera.x, camera.y, player.x, player.y, smokeClouds);
    if (camera.seesThief) {
      heat += ALARM.cameraRate;
      watcher = 'camera';
    }
  }

  if (heat > 0) {
    alarm.level = Math.min(ALARM.max, alarm.level + heat * dt);
  } else {
    // A hot alarm cools at half speed: once the car is loud, hiding has to be
    // decisive, not a two-step out of a cone. Below the hot line it cools normally.
    const rate = alarm.level > 75 ? ALARM.decay / 2 : ALARM.decay;
    alarm.level = Math.max(0, alarm.level - rate * dt);
  }
  alarm.spottedBy = watcher;
  if (alarm.level > alarm.peak) alarm.peak = alarm.level;
  return alarm.level >= ALARM.max;
}
