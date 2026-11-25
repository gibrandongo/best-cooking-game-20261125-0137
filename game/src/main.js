// Ember & Thyme — entry point and game loop.
// Owns the game state, the frame loop, order spawning, ticket expiry,
// particles, and the start / pause / game-over flow. ?shot=cover|chop|
// serve|rush renders a fixed staged scene for screenshots.
import { createSound } from './audio.js';
import { createChef, updateChef, updateWorkstations } from './chef.js';
import { createInput } from './input.js';
import { maxOrdersFor, newOrder, spawnIntervalFor, updateOrders } from './orders.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';
import { nearestStation } from './kitchen.js';

const SHIFT_LENGTH = 180;

export function freshState() {
  return {
    screen: 'start',
    time: 0,
    elapsed: 0,
    shiftLength: SHIFT_LENGTH,
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
    spawnIn: 2,
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
    alarmCooldown: 0,
  };
}

function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.kind === 'steam' ? -10 * dt : 160 * dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.floats) {
    f.life -= dt;
    f.y += f.vy * dt;
  }
  state.floats = state.floats.filter((f) => f.life > 0);
}

function spawnOrder(state) {
  const order = newOrder(state.nextOrderId, state.elapsed, Math.random);
  order.fresh = 0.35;
  state.orders.push(order);
  state.nextOrderId += 1;
}

function updatePlaying(state, input, sound, dt) {
  state.elapsed += dt;

  // New tickets arrive faster as the shift wears on.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    if (state.orders.length < maxOrdersFor(state.elapsed)) spawnOrder(state);
    state.spawnIn = spawnIntervalFor(state.elapsed);
  }

  // Ticket countdowns; expired tickets cost the combo.
  const expired = updateOrders(state.orders, dt);
  for (const order of expired) {
    state.orders = state.orders.filter((o) => o !== order);
    state.missed += 1;
    state.combo = 0;
    sound.expired();
    state.message = 'Ticket #' + order.id + ' (' + order.recipe.name + ') went cold!';
    state.messageT = 2.4;
  }

  // Alarm when a ticket is nearly late (at most once every 4 seconds).
  state.alarmCooldown -= dt;
  if (state.alarmCooldown <= 0 && state.orders.some((o) => o.remaining < 10)) {
    sound.alarm();
    state.alarmCooldown = 4;
  }

  updateChef(state, input, sound, dt);
  updateWorkstations(state, input, sound, dt);
  state.nearStation = nearestStation(state.chef.x, state.chef.y, 130);
  state.passFlash = Math.max(0, state.passFlash - dt);
  state.messageT = Math.max(0, state.messageT - dt);
  updateParticles(state, dt);

  if (state.elapsed >= state.shiftLength) {
    state.screen = 'over';
    state.message = '';
    sound.serve();
  }
}

function main() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const input = createInput(canvas);
  const sound = createSound();

  const params = new URLSearchParams(window.location.search);
  const shotName = params.get('shot');
  let state = freshState();
  let shotMode = false;
  if (shotName) {
    const staged = applyShot(shotName);
    if (staged) {
      state = staged;
      shotMode = true;
    }
  }

  function startShift() {
    state = freshState();
    state.screen = 'playing';
    sound.unlock();
    sound.click();
  }

  let last = performance.now();
  // Read-only debug hook for play-testing (no game logic reads it).
  Object.defineProperty(window, '__emberState', { get() { return state; } });
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    if (!shotMode) {
      state.time += dt;
      if (input.wasPressed('mute')) {
        const muted = sound.toggleMute();
        state.message = muted ? 'Sounds muted' : 'Sounds on';
        state.messageT = 1.5;
      }
      if (state.screen === 'start') {
        if (input.wasPressed('start') || input.mouse.clicked) startShift();
      } else if (state.screen === 'playing') {
        if (input.wasPressed('pause')) {
          state.screen = 'paused';
          sound.click();
        } else {
          updatePlaying(state, input, sound, dt);
        }
      } else if (state.screen === 'paused') {
        if (input.wasPressed('pause')) {
          state.screen = 'playing';
          sound.click();
        }
      } else if (state.screen === 'over') {
        if (input.wasPressed('restart') || input.mouse.clicked) startShift();
      }
      state.nearStation = state.screen === 'playing'
        ? nearestStation(state.chef.x, state.chef.y, 130)
        : state.nearStation;
    } else {
      // Staged screenshot scenes stay frozen: no timers advance.
      state.nearStation = nearestStation(state.chef.x, state.chef.y, 130);
    }

    drawGame(ctx, state);
    input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
