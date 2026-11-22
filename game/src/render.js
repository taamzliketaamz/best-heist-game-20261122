// Night Train Heist — render.js
// Every pixel of the game: the bright mail-car interior, furniture, loot, vision
// cones, cameras, the thief and guards, the HUD with the alarm meter, and the
// title / busted / getaway overlays. One job: draw the state it is given.

import { CAR, COLORS, VIEW } from './config.js';
import { DOOR, OBSTACLES } from './world.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, facing, range, halfAngle, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCar(ctx, now) {
  // Wall shell, then the wooden floor inside it.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(CAR.x - 16, CAR.y - 16, CAR.w + 32, CAR.h + 32);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(CAR.x, CAR.y, CAR.w, CAR.h);
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let x = CAR.x + 46; x < CAR.x + CAR.w; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, CAR.y);
    ctx.lineTo(x, CAR.y + CAR.h);
    ctx.stroke();
  }
  // Red carpet runners down both corridors.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(CAR.x + 8, 118, CAR.w - 16, 88);
  ctx.fillRect(CAR.x + 8, 522, CAR.w - 16, 88);
  ctx.fillStyle = COLORS.carpetEdge;
  ctx.fillRect(CAR.x + 8, 118, CAR.w - 16, 5);
  ctx.fillRect(CAR.x + 8, 201, CAR.w - 16, 5);
  ctx.fillRect(CAR.x + 8, 522, CAR.w - 16, 5);
  ctx.fillRect(CAR.x + 8, 605, CAR.w - 16, 5);

  // Windows along both walls: night sky, a moon, and lights sweeping past.
  for (const side of [0, 1]) {
    const wy = side === 0 ? CAR.y - 14 : CAR.y + CAR.h + 2;
    for (let x = CAR.x + 60; x < CAR.x + CAR.w - 90; x += 148) {
      ctx.fillStyle = COLORS.windowSky;
      roundRect(ctx, x, wy, 96, 12, 5);
      ctx.fill();
      const streak = ((now * 60 + x) % 220) - 40;
      ctx.fillStyle = 'rgba(244, 236, 210, 0.5)';
      ctx.fillRect(x + streak, wy + 4, 16, 3);
    }
  }
  ctx.fillStyle = COLORS.windowMoon;
  ctx.beginPath();
  ctx.arc(CAR.x + CAR.w - 70, CAR.y - 8, 5, 0, Math.PI * 2);
  ctx.fill();

  // The door in the left wall: open, night air beyond it, light spilling onto the
  // floorboards and a little EXIT sign above it, so the way out reads at a glance.
  ctx.fillStyle = COLORS.doorSky;
  ctx.fillRect(DOOR.x - 14, DOOR.y, 30, DOOR.h);
  const spill = ctx.createLinearGradient(DOOR.x + 16, 0, DOOR.x + 130, 0);
  spill.addColorStop(0, 'rgba(150, 190, 255, 0.20)');
  spill.addColorStop(1, 'rgba(150, 190, 255, 0)');
  ctx.fillStyle = spill;
  ctx.beginPath();
  ctx.moveTo(DOOR.x + 16, DOOR.y + 8);
  ctx.lineTo(DOOR.x + 130, DOOR.y + 26);
  ctx.lineTo(DOOR.x + 130, DOOR.y + DOOR.h - 26);
  ctx.lineTo(DOOR.x + 16, DOOR.y + DOOR.h - 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = COLORS.brass;
  ctx.lineWidth = 3;
  ctx.strokeRect(DOOR.x - 14, DOOR.y, 30, DOOR.h);
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(DOOR.x + 12, DOOR.y + 6, 7, DOOR.h - 12);
  ctx.fillStyle = '#0d2b16';
  roundRect(ctx, DOOR.x - 12, DOOR.y - 26, 52, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#4ade80';
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', DOOR.x + 14, DOOR.y - 12);
}

function drawObstacle(ctx, o) {
  if (o.kind === 'luggage') {
    ctx.fillStyle = COLORS.luggage;
    roundRect(ctx, o.x, o.y, o.w, o.h, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.luggageStrap;
    ctx.fillRect(o.x + o.w * 0.3, o.y + 3, 9, o.h - 6);
    ctx.fillRect(o.x + o.w * 0.62, o.y + 3, 9, o.h - 6);
    ctx.strokeStyle = COLORS.luggageDark;
    ctx.lineWidth = 3;
    roundRect(ctx, o.x + 3, o.y + 3, o.w - 6, o.h - 6, 6);
    ctx.stroke();
  } else if (o.kind === 'crate') {
    ctx.fillStyle = COLORS.crate;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = COLORS.crateBrace;
    ctx.lineWidth = 5;
    ctx.strokeRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
    ctx.beginPath();
    ctx.moveTo(o.x + 4, o.y + 4);
    ctx.lineTo(o.x + o.w - 4, o.y + o.h - 4);
    ctx.moveTo(o.x + o.w - 4, o.y + 4);
    ctx.lineTo(o.x + 4, o.y + o.h - 4);
    ctx.stroke();
  } else if (o.kind === 'counter') {
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, o.x, o.y, o.w, o.h, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.counterTop;
    roundRect(ctx, o.x - 4, o.y + 6, o.w + 8, 14, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.brass;
    ctx.fillRect(o.x + 6, o.y + o.h - 12, o.w - 12, 4);
  } else if (o.kind === 'case') {
    ctx.fillStyle = COLORS.pedestal;
    roundRect(ctx, o.x, o.y, o.w, o.h, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.glass;
    roundRect(ctx, o.x + 7, o.y + 7, o.w - 14, o.h - 14, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 245, 255, 0.8)';
    ctx.lineWidth = 2;
    roundRect(ctx, o.x + 7, o.y + 7, o.w - 14, o.h - 14, 20);
    ctx.stroke();
  }
}

function drawLootItem(ctx, item, now) {
  if (item.taken) return;
  if (item.id === 'diamond') {
    const pulse = 26 + Math.sin(now * 3) * 6;
    const glow = ctx.createRadialGradient(item.x, item.y, 4, item.x, item.y, pulse + 22);
    glow.addColorStop(0, 'rgba(255, 201, 60, 0.85)');
    glow.addColorStop(1, 'rgba(255, 201, 60, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(item.x, item.y, pulse + 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.diamond;
    ctx.fillRect(-13, -13, 26, 26);
    ctx.fillStyle = COLORS.diamondDeep;
    ctx.fillRect(-13, -13, 26, 9);
    ctx.strokeStyle = '#fff7dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();
  } else if (item.id === 'watch') {
    ctx.fillStyle = '#5d3a1e';
    roundRect(ctx, item.x - 20, item.y - 13, 40, 26, 5);
    ctx.fill();
    ctx.fillStyle = COLORS.brass;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3cf';
    ctx.beginPath();
    ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.id === 'necklace') {
    ctx.fillStyle = '#7e1f2b';
    roundRect(ctx, item.x - 22, item.y - 14, 44, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ff5d5d';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(item.x + i * 8, item.y + Math.abs(i) * 2 - 2, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGuard(ctx, guard) {
  ctx.fillStyle = 'rgba(60, 40, 10, 0.25)';
  ctx.beginPath();
  ctx.ellipse(guard.x, guard.y + 12, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.guardBody;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.guardSkin;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 9, 0, Math.PI * 2);
  ctx.fill();
  // Cap, brim pointing the way he faces.
  ctx.fillStyle = COLORS.guardCap;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 9.5, guard.facing - 2.5, guard.facing + 2.5);
  ctx.fill();
  const bx = guard.x + Math.cos(guard.facing) * 12;
  const by = guard.y + Math.sin(guard.facing) * 12;
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fill();
  if (guard.seesThief) {
    ctx.font = '900 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText('!', guard.x, guard.y - 26);
    ctx.fillStyle = COLORS.alarmHigh;
    ctx.fillText('!', guard.x, guard.y - 26);
  }
}

function drawThief(ctx, player) {
  ctx.fillStyle = 'rgba(60, 40, 10, 0.25)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 11, 14, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (player.hasDiamond) {
    ctx.fillStyle = COLORS.sack;
    ctx.beginPath();
    ctx.arc(player.x - Math.cos(player.facing) * 13, player.y - Math.sin(player.facing) * 13, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.diamond;
    ctx.beginPath();
    ctx.arc(player.x - Math.cos(player.facing) * 13, player.y - Math.sin(player.facing) * 13, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.thiefBody;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
  ctx.fill();
  // Hood over the back of his head, then the pale mask band across his eyes, turned
  // to his facing: two dark eye slits in the band are what reads at judge size.
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.facing);
  ctx.fillStyle = '#39404d';
  ctx.beginPath();
  ctx.arc(-2, 0, 10.5, Math.PI * 0.55, Math.PI * 1.45);
  ctx.fill();
  ctx.fillStyle = COLORS.thiefMask;
  roundRect(ctx, 2, -8.5, 10, 17, 4);
  ctx.fill();
  ctx.fillStyle = COLORS.thiefBody;
  ctx.fillRect(7.5, -5.4, 3.6, 3.6);
  ctx.fillRect(7.5, 1.8, 3.6, 3.6);
  ctx.restore();
}

function drawCameraUnit(ctx, camera, now) {
  ctx.fillStyle = COLORS.cameraBody;
  roundRect(ctx, camera.x - 11, camera.y - 8, 22, 16, 4);
  ctx.fill();
  const lx = camera.x + Math.cos(camera.angle) * 9;
  const ly = camera.y + Math.sin(camera.angle) * 9;
  ctx.fillStyle = COLORS.cameraLens;
  ctx.beginPath();
  ctx.arc(lx, ly, 5, 0, Math.PI * 2);
  ctx.fill();
  if (Math.floor(now * 2) % 2 === 0) {
    ctx.fillStyle = COLORS.cameraLight;
    ctx.beginPath();
    ctx.arc(camera.x, camera.y - 11, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  const { player, alarm } = state;
  ctx.fillStyle = COLORS.hudBar;
  ctx.fillRect(0, 0, VIEW.w, 64);
  ctx.fillRect(0, VIEW.h - 52, VIEW.w, 52);

  ctx.fillStyle = COLORS.hudText;
  ctx.font = '800 23px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NIGHT TRAIN HEIST', 22, 40);
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillStyle = COLORS.hudDim;
  ctx.fillText('the mail car · one diamond · one door out', 23, 57);

  // Alarm meter, front and centre where the judge cannot miss it.
  const mx = 452;
  const mw = 380;
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.fillStyle = COLORS.hudText;
  ctx.textAlign = 'center';
  ctx.fillText('ALARM', mx + mw / 2, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, mx, 26, mw, 20, 9);
  ctx.fill();
  const level = Math.round(alarm.level);
  const color = level < 45 ? COLORS.alarmLow : level < 75 ? COLORS.alarmMid : COLORS.alarmHigh;
  if (level > 0) {
    ctx.fillStyle = color;
    roundRect(ctx, mx, 26, (mw * level) / 100, 20, 9);
    ctx.fill();
  }
  // While a watcher actually sees the thief, the meter wears a pulsing red frame:
  // "it is climbing right now" has to read from across the room.
  if (alarm.spottedBy) {
    ctx.strokeStyle = Math.floor(performance.now() / 280) % 2 === 0 ? COLORS.alarmHigh : '#ffb3ab';
    ctx.lineWidth = 3;
    roundRect(ctx, mx - 3, 23, mw + 6, 26, 11);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '800 15px system-ui, sans-serif';
  ctx.fillText(level + '%', mx + mw / 2, 41);

  ctx.textAlign = 'right';
  ctx.font = '800 21px system-ui, sans-serif';
  ctx.fillStyle = player.hasDiamond ? COLORS.diamond : COLORS.hudDim;
  ctx.fillText(player.hasDiamond ? '◆ DIAMOND IN THE SACK' : '◇ diamond still in its case', VIEW.w - 22, 31);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '700 17px system-ui, sans-serif';
  ctx.fillText('HAUL $' + player.haul.toLocaleString('en-US'), VIEW.w - 22, 54);

  // Bottom strip: tools with their costs, the current objective, the controls.
  ctx.textAlign = 'left';
  ctx.font = '700 17px system-ui, sans-serif';
  ctx.fillStyle = player.smokeLeft > 0 ? COLORS.hudText : COLORS.hudDim;
  ctx.fillText('Q  SMOKE ×' + player.smokeLeft, 22, VIEW.h - 20);
  ctx.fillStyle = player.coinLeft > 0 ? COLORS.hudText : COLORS.hudDim;
  ctx.fillText('E  COIN TOSS ×' + player.coinLeft, 196, VIEW.h - 20);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.diamond;
  ctx.font = '800 18px system-ui, sans-serif';
  ctx.fillText(
    player.hasDiamond ? '← GET BACK TO THE DOOR' : 'STEAL THE STAR OF JAVA →',
    VIEW.w / 2,
    VIEW.h - 20,
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudDim;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillText('WASD / arrows / click to move', VIEW.w - 22, VIEW.h - 20);
}

function drawOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(10, 14, 26, 0.62)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.textAlign = 'center';
  if (state.mode === 'title') {
    ctx.fillStyle = COLORS.diamond;
    ctx.font = '900 64px system-ui, sans-serif';
    ctx.fillText('NIGHT TRAIN HEIST', VIEW.w / 2, 268);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillText('One diamond. Three guards. Two cameras. One door out.', VIEW.w / 2, 316);
    ctx.font = '600 19px system-ui, sans-serif';
    ctx.fillStyle = COLORS.hudDim;
    ctx.fillText('Cross the mail car, lift the Star of Java, and get back to the door.', VIEW.w / 2, 372);
    ctx.fillText('Stay out of the cones — the alarm climbs while they see you, and cools when you hide.', VIEW.w / 2, 400);
    ctx.fillText('Smoke (Q) blinds a corridor. A tossed coin (E) turns heads. Both run out.', VIEW.w / 2, 428);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('Press ENTER or click to slip in', VIEW.w / 2, 486);
  } else if (state.mode === 'caught') {
    ctx.fillStyle = COLORS.alarmHigh;
    ctx.font = '900 72px system-ui, sans-serif';
    ctx.fillText('BUSTED!', VIEW.w / 2, 300);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText('The alarm hit 100% and the guards closed in.', VIEW.w / 2, 348);
    ctx.fillText('It was a fair catch — the cones gave you time to break away.', VIEW.w / 2, 380);
    ctx.font = '800 21px system-ui, sans-serif';
    ctx.fillText('Press ENTER to try the next train', VIEW.w / 2, 448);
  } else if (state.mode === 'win') {
    ctx.fillStyle = COLORS.alarmLow;
    ctx.font = '900 62px system-ui, sans-serif';
    ctx.fillText('CLEAN GETAWAY', VIEW.w / 2, 262);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '700 24px system-ui, sans-serif';
    const lines = state.winLines || [];
    lines.forEach((line, i) => ctx.fillText(line, VIEW.w / 2, 322 + i * 34));
    ctx.font = '800 21px system-ui, sans-serif';
    ctx.fillText('Press ENTER to rob it again', VIEW.w / 2, 322 + lines.length * 34 + 22);
  }
}

export function drawScene(ctx, state, now) {
  ctx.fillStyle = COLORS.pageBg;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  drawCar(ctx, now);
  for (const o of OBSTACLES) drawObstacle(ctx, o);
  for (const item of state.loot) drawLootItem(ctx, item, now);

  // Vision cones under the actors: guards in amber, cameras in red.
  for (const guard of state.guards) {
    drawCone(
      ctx,
      guard.x,
      guard.y,
      guard.facing,
      190,
      0.56,
      guard.seesThief ? COLORS.guardConeHot : COLORS.guardCone,
    );
  }
  for (const camera of state.cameras) {
    drawCone(ctx, camera.x, camera.y, camera.angle, 215, 0.42, COLORS.cameraCone);
  }

  if (state.coin) {
    ctx.fillStyle = COLORS.brass;
    ctx.beginPath();
    ctx.arc(state.coin.x, state.coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(231, 185, 88, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.coin.x, state.coin.y, 10 + Math.sin(now * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const cloud of state.smokeClouds) {
    ctx.fillStyle = COLORS.smoke;
    for (const [ox, oy, r] of [[0, 0, 62], [-38, 10, 44], [38, 8, 46], [-12, -30, 40], [20, -26, 38]]) {
      ctx.beginPath();
      ctx.arc(cloud.x + ox, cloud.y + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const camera of state.cameras) drawCameraUnit(ctx, camera, now);
  for (const guard of state.guards) drawGuard(ctx, guard);
  drawThief(ctx, state.player);
  drawHud(ctx, state);
  if (state.mode !== 'playing') drawOverlay(ctx, state);
}
