// Night Train Heist — scenes.js
// Staged moments for the game's own screenshots (and a fair demo of the real thing):
// each scene places the actual guards, cameras, thief and loot of the live game into
// a composed frame — the cover crossing, the alarm spiking, the fair catch, and the
// getaway at the door. Nothing here draws anything; render.js draws what is staged.

export function applyScene(state, name) {
  const [g1, g2, g3] = state.guards;
  const [cam1, cam2] = state.cameras;
  const player = state.player;

  if (name === 'cover') {
    state.mode = 'playing';
    Object.assign(player, { x: 560, y: 308, facing: 0.35 });
    Object.assign(g1, { x: 748, y: 162, facing: Math.PI });
    Object.assign(g2, { x: 428, y: 566, facing: 0 });
    Object.assign(g3, { x: 706, y: 300, facing: 2.55 });
    cam1.angle = Math.PI / 2 - 0.5;
    cam2.angle = -Math.PI / 2 + 0.55;
    state.alarm.level = 34;
    state.alarm.peak = 34;
  } else if (name === 'alarm') {
    state.mode = 'playing';
    Object.assign(player, { x: 838, y: 356, facing: 0.1 });
    Object.assign(g1, { x: 300, y: 162, facing: 0 });
    Object.assign(g2, { x: 902, y: 566, facing: Math.PI });
    Object.assign(g3, { x: 700, y: 336, facing: 0.14, seesThief: true });
    cam1.angle = Math.PI / 2 + 0.3;
    cam2.angle = -Math.PI / 2 + 0.3;
    state.alarm.level = 76;
    state.alarm.peak = 76;
    state.alarm.spottedBy = 'guard';
  } else if (name === 'caught') {
    state.mode = 'caught';
    Object.assign(player, { x: 838, y: 356, facing: 0.1 });
    Object.assign(g1, { x: 300, y: 162, facing: 0 });
    Object.assign(g2, { x: 902, y: 566, facing: Math.PI });
    Object.assign(g3, { x: 792, y: 346, facing: 0.22, seesThief: true });
    cam1.angle = Math.PI / 2 + 0.3;
    cam2.angle = -Math.PI / 2 + 0.3;
    state.alarm.level = 100;
    state.alarm.peak = 100;
  } else if (name === 'getaway') {
    state.mode = 'win';
    Object.assign(player, { x: 108, y: 366, facing: Math.PI, hasDiamond: true, haul: 70000 });
    for (const item of state.loot) item.taken = true;
    Object.assign(g1, { x: 820, y: 162, facing: Math.PI });
    Object.assign(g2, { x: 380, y: 566, facing: 0 });
    Object.assign(g3, { x: 700, y: 300, facing: -2.4 });
    cam1.angle = Math.PI / 2 - 0.35;
    cam2.angle = -Math.PI / 2 - 0.4;
    state.alarm.level = 18;
    state.alarm.peak = 64;
    state.winLines = [
      'Star of Java — $50,000',
      'Gold Watch — $8,000',
      'Ruby Necklace — $12,000',
      'HAUL $70,000 · out in 1:47 · peak alarm 64%',
    ];
  }
  return state;
}
