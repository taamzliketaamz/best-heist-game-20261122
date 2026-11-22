// Night Train Heist — main.js
// The game itself: state machine (title, playing, caught, win), the frame loop, and
// the wiring between input, the thief, the guards, the cameras and the alarm.
// Everything else lives in its own module; this file only runs the heist.

import { makeAlarm, updateAlarm } from './alarm.js';
import { makeCameras, updateCamera } from './cameras.js';
import { LOOT } from './config.js';
import { makeGuards, lureGuards, updateGuard } from './guards.js';
import { makeInput, takePresses } from './input.js';
import { dropSmoke, makePlayer, tossCoin, updatePlayer } from './player.js';
import { drawScene } from './render.js';
import { applyScene } from './scenes.js';
import { DOOR, distance, makeLoot } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = makeInput(canvas);

function makeState() {
  return {
    mode: 'title',
    player: makePlayer(),
    guards: makeGuards(),
    cameras: makeCameras(),
    alarm: makeAlarm(),
    loot: makeLoot(),
    smokeClouds: [],
    coin: null,
    time: 0,
    winLines: null,
  };
}

let state = makeState();

// Screenshot staging: ?scene=cover|alarm|caught|getaway freezes a composed frame of
// the real game for the maker's screenshots. Play ignores it entirely.
const sceneName = new URLSearchParams(location.search).get('scene');
const staging = sceneName ? applyScene(makeState(), sceneName) : null;

function startRun() {
  state = makeState();
  state.mode = 'playing';
}

function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

function finishWin() {
  state.mode = 'win';
  const taken = state.loot.filter((item) => item.taken);
  state.winLines = taken.map((item) => item.name + ' — $' + item.value.toLocaleString('en-US'));
  state.winLines.push(
    'HAUL $' +
      state.player.haul.toLocaleString('en-US') +
      ' · out in ' +
      formatClock(state.time) +
      ' · peak alarm ' +
      Math.round(state.alarm.peak) +
      '%',
  );
}

function step(dt) {
  const presses = takePresses(input);

  if (state.mode !== 'playing') {
    if (presses.has('enter') || presses.has('click')) startRun();
    input.click = null;
    return;
  }

  state.time += dt;
  const now = state.time;

  if (presses.has('q')) {
    const cloud = dropSmoke(state.player, now);
    if (cloud) state.smokeClouds.push(cloud);
  }
  if (presses.has('e')) {
    const coin = tossCoin(state.player);
    if (coin) {
      coin.until = now + 2.2;
      state.coin = coin;
      lureGuards(state.guards, coin, now, 2.2, 290);
    }
  }
  if (input.click) {
    state.player.moveTarget = { x: input.click.x, y: input.click.y };
    input.click = null;
  }

  updatePlayer(state.player, input, dt);
  for (const guard of state.guards) updateGuard(guard, dt, now, state.coin);
  for (const camera of state.cameras) updateCamera(camera, now);
  state.smokeClouds = state.smokeClouds.filter((cloud) => cloud.until > now);
  if (state.coin && state.coin.until <= now) state.coin = null;

  // Grab whatever the thief is standing next to.
  for (const item of state.loot) {
    if (!item.taken && distance(state.player.x, state.player.y, item.x, item.y) < LOOT.grabDistance) {
      item.taken = true;
      state.player.haul += item.value;
      if (item.main) state.player.hasDiamond = true;
    }
  }

  // Home free: back at the door with the diamond in the sack.
  const atDoor =
    state.player.x < DOOR.x + 68 && Math.abs(state.player.y - (DOOR.y + DOOR.h / 2)) < 58;
  if (atDoor && state.player.hasDiamond) {
    finishWin();
    return;
  }

  if (updateAlarm(state.alarm, state.player, state.guards, state.cameras, state.smokeClouds, dt)) {
    state.mode = 'caught';
  }
}

let last = performance.now();
function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  if (staging) {
    drawScene(ctx, staging, 2.0);
  } else {
    step(dt);
    drawScene(ctx, state, state.time);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
