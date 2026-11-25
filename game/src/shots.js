// Ember & Thyme — deterministic staged scenes for screenshots.
// ?shot=cover|chop|serve|rush seeds a fixed mid-game state through the
// game's own state, so the screenshots are real renders of the game code.
import { createChef } from './chef.js';
import { recipeByName } from './orders.js';

function baseState() {
  return {
    screen: 'playing',
    time: 0,
    elapsed: 0,
    shiftLength: 180,
    coins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    chopped: 0,
    chef: createChef(),
    orders: [],
    nextOrderId: 1,
    spawnIn: 10,
    board: { kind: null, state: null, progress: 0 },
    grill: { kind: null, state: 'empty', progress: 0, dinged: false },
    assembly: { items: [] },
    passPlate: null,
    passFlash: 0,
    message: '',
    messageT: 0,
    particles: [],
    floats: [],
    nearStation: null,
  };
}

function ticket(id, name, remaining, total) {
  return { id, recipe: recipeByName(name), remaining, total, fresh: 0 };
}

// Cover: full kitchen mid-rush — order board with three tickets, chopped
// tomato on the board, a patty ready on the grill, a dish half-assembled
// on the counter, and the chef carrying a finished Garden Bowl to serve.
export function shotCover() {
  const s = baseState();
  s.elapsed = 95;
  s.coins = 148;
  s.score = 148;
  s.combo = 3;
  s.bestCombo = 4;
  s.served = 6;
  s.chopped = 9;
  s.orders = [
    ticket(7, 'Sunset Stack', 22, 42),
    ticket(8, 'Garden Bowl', 14, 42),
    ticket(9, 'Ember Melt', 31, 42),
  ];
  s.board = { kind: 'tomato', state: 'chopped', progress: 0 };
  s.grill = { kind: 'patty', state: 'ready', progress: 5.4, dinged: true };
  s.assembly = { items: [{ kind: 'bun', state: 'raw' }, { kind: 'patty', state: 'grilled' }, { kind: 'cheese', state: 'raw' }] };
  s.chef.x = 1085;
  s.chef.y = 330;
  s.chef.face = 1;
  s.chef.plate = { items: [{ kind: 'tomato', state: 'chopped' }, { kind: 'lettuce', state: 'chopped' }, { kind: 'onion', state: 'chopped' }] };
  s.floats = [{ x: 640, y: 200, vy: -46, life: 1.2, maxLife: 1.4, text: '+42 coins', color: '#ffd94d', size: 20 }];
  s.message = 'Garden Bowl ready — serve it at the pass!';
  s.messageT = 2;
  return s;
}

// Chop: the chef at the board mid-chop, progress ring half full.
export function shotChop() {
  const s = baseState();
  s.elapsed = 40;
  s.coins = 54;
  s.score = 54;
  s.combo = 1;
  s.served = 2;
  s.chopped = 3;
  s.orders = [ticket(3, 'Garden Bowl', 28, 48), ticket(4, 'Herb Soup', 19, 48)];
  s.board = { kind: 'lettuce', state: 'raw', progress: 0.55 };
  s.chef.x = 358;
  s.chef.y = 535;
  s.chef.face = 1;
  s.chef.moving = false;
  s.particles = [
    { x: 340, y: 590, vx: 30, vy: -60, life: 0.5, maxLife: 0.8, color: '#8fce6e', size: 3, kind: 'dot' },
    { x: 370, y: 585, vx: -25, vy: -70, life: 0.6, maxLife: 0.8, color: '#c8f5a8', size: 3, kind: 'dot' },
    { x: 355, y: 580, vx: 10, vy: -50, life: 0.4, maxLife: 0.8, color: '#8fce6e', size: 2, kind: 'dot' },
  ];
  s.message = 'Hold E to chop — almost there!';
  s.messageT = 2;
  return s;
}

// Serve: a finished Sunset Stack at the pass, bell ringing, coins flying.
export function shotServe() {
  const s = baseState();
  s.elapsed = 120;
  s.coins = 212;
  s.score = 212;
  s.combo = 4;
  s.bestCombo = 5;
  s.served = 9;
  s.chopped = 12;
  s.orders = [ticket(10, 'Ember Melt', 26, 36), ticket(11, 'Herb Soup', 33, 36)];
  s.grill = { kind: 'patty', state: 'cooking', progress: 2.1, dinged: false };
  s.assembly = { items: [{ kind: 'bun', state: 'raw' }] };
  s.chef.x = 1095;
  s.chef.y = 300;
  s.chef.face = 1;
  s.chef.plate = { items: [{ kind: 'bun', state: 'raw' }, { kind: 'patty', state: 'grilled' }, { kind: 'cheese', state: 'raw' }, { kind: 'lettuce', state: 'chopped' }] };
  s.passFlash = 0.6;
  s.floats = [
    { x: 1010, y: 250, vy: -46, life: 1.3, maxLife: 1.4, text: '+58 coins', color: '#ffd94d', size: 22 },
    { x: 1010, y: 280, vy: -46, life: 1.3, maxLife: 1.4, text: 'Combo x4', color: '#ff9a3d', size: 18 },
  ];
  s.message = 'Sunset Stack served — the pass is happy!';
  s.messageT = 2;
  return s;
}

// Rush: final 30 seconds, four tickets, one almost late, a burnt patty.
export function shotRush() {
  const s = baseState();
  s.elapsed = 165;
  s.coins = 320;
  s.score = 320;
  s.combo = 5;
  s.bestCombo = 6;
  s.served = 14;
  s.missed = 2;
  s.chopped = 18;
  s.orders = [
    ticket(14, 'Sunset Stack', 8, 36),
    ticket(15, 'Garden Bowl', 12, 36),
    ticket(16, 'Ember Melt', 18, 36),
    ticket(17, 'Herb Soup', 25, 36),
  ];
  s.board = { kind: 'onion', state: 'chopped', progress: 0 };
  s.grill = { kind: 'patty', state: 'burnt', progress: 11.5, dinged: true };
  s.assembly = { items: [{ kind: 'bun', state: 'raw' }, { kind: 'patty', state: 'grilled' }] };
  s.chef.x = 300;
  s.chef.y = 430;
  s.chef.face = -1;
  s.chef.carrying = { kind: 'onion', state: 'chopped' };
  s.particles = [
    { x: 617, y: 580, vx: 0, vy: -40, life: 0.7, maxLife: 0.9, color: '#ffffff', size: 7, kind: 'steam' },
    { x: 625, y: 575, vx: 0, vy: -45, life: 0.6, maxLife: 0.9, color: '#ffffff', size: 6, kind: 'steam' },
  ];
  s.message = 'RUSH! A ticket is almost late!';
  s.messageT = 2;
  return s;
}

export function applyShot(name) {
  if (name === 'cover') return shotCover();
  if (name === 'chop') return shotChop();
  if (name === 'serve') return shotServe();
  if (name === 'rush') return shotRush();
  return null;
}
