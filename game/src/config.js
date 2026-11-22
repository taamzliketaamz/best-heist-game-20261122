// Night Train Heist — config.js
// Every constant the rest of the game reads: stage size, speeds, vision, alarm tuning,
// tool counts and the whole colour palette. One job: be the single place to tune the game.

export const VIEW = { w: 1280, h: 720 };

// The train car interior the whole game happens in (the walls sit on this rect).
export const CAR = { x: 24, y: 88, w: 1232, h: 556 };

export const PLAYER = {
  radius: 15,
  speed: 178, // px per second
  start: { x: 86, y: 366 },
};

export const GUARD = {
  radius: 16,
  visionRange: 190,
  visionHalfAngle: 0.56, // radians, ~32 degrees each side
  turnRate: 3.4, // radians per second a guard can swing his facing
};

export const CAMERA = {
  visionRange: 215,
  visionHalfAngle: 0.42,
  sweepArc: 0.85, // radians each side of its base angle
};

export const ALARM = {
  max: 100,
  guardRate: 58, // per second while a guard sees the thief
  cameraRate: 44, // per second while a camera sees the thief
  decay: 13, // per second while nobody sees the thief
};

export const TOOLS = {
  smokeCount: 2,
  smokeRadius: 76,
  smokeSeconds: 3.5,
  coinCount: 2,
  coinDistance: 150,
  coinLureRadius: 290,
  coinLureSeconds: 2.2,
};

export const LOOT = {
  diamondValue: 50000,
  watchValue: 8000,
  necklaceValue: 12000,
  grabDistance: 60,
};

// Bright, warm, readable palette: cream and amber train wood, teal night glass,
// one hot accent for the loot, clear danger colours for the vision cones.
export const COLORS = {
  pageBg: '#10182b',
  floor: '#e8cf9e',
  floorLine: '#d9ba7d',
  carpet: '#a33327',
  carpetEdge: '#7e241b',
  wall: '#5d3a1e',
  wallTrim: '#8a5a2b',
  windowSky: '#16283f',
  windowMoon: '#f4ecd2',
  luggage: '#8a5a2b',
  luggageDark: '#6e4520',
  luggageStrap: '#4c2f14',
  crate: '#b98a4a',
  crateBrace: '#8a5a2b',
  counter: '#6b4423',
  counterTop: '#96682f',
  brass: '#e7b958',
  pedestal: '#3f4a56',
  glass: 'rgba(170, 220, 235, 0.35)',
  diamond: '#ffc93c',
  diamondDeep: '#f59e0b',
  guardBody: '#274690',
  guardCap: '#1b2f5e',
  guardSkin: '#f0c297',
  cameraBody: '#39424e',
  cameraLens: '#11161c',
  cameraLight: '#ff4444',
  guardCone: 'rgba(255, 183, 40, 0.34)',
  guardConeHot: 'rgba(255, 92, 40, 0.45)',
  cameraCone: 'rgba(255, 70, 55, 0.26)',
  thiefBody: '#20242c',
  thiefMask: '#e8e4da',
  sack: '#7a5c33',
  smoke: 'rgba(226, 230, 235, 0.82)',
  hudBar: 'rgba(16, 22, 38, 0.88)',
  hudText: '#f5efe0',
  hudDim: '#b9ac8d',
  alarmLow: '#39d353',
  alarmMid: '#ffc93c',
  alarmHigh: '#ff5147',
  doorSky: '#0d1a2e',
};
