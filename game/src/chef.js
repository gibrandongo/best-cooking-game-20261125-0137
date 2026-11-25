// Ember & Thyme — the chef: movement, carrying, and every station interaction.
// The chef carries one loose ingredient or one plate. E (or a click) uses
// the nearest station; holding E at the chopping board chops.
import { findMatchingOrder, serveValue } from './orders.js';
import { isChoppable, isGrillable, moveCircle, nearestStation, stationAtPoint, stationCenter } from './kitchen.js';

export const CHEF_SPEED = 265;
export const CHOP_TIME = 1.4;
export const GRILL_TIME = 5;
export const BURN_TIME = 10;

export function createChef() {
  return {
    x: 640, y: 380, face: 1, moving: false,
    carrying: null, plate: null,
    moveTarget: null, pending: null, bob: 0, cooldown: 0, pickupPending: null,
  };
}

function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, vy: -46, life: 1.4, maxLife: 1.4, text, color: color || '#fff3d6', size: 20 });
}

function say(state, text) {
  state.message = text;
  state.messageT = 2.2;
}

function burst(state, x, y, color, n) {
  for (let i = 0; i < (n || 10); i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 90;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      life: 0.6 + Math.random() * 0.4, maxLife: 1, color, size: 2 + Math.random() * 3, kind: 'dot',
    });
  }
}

function steam(state, x, y) {
  state.particles.push({
    x: x + (Math.random() * 30 - 15), y, vx: 0, vy: -34 - Math.random() * 14,
    life: 0.9, maxLife: 0.9, color: '#ffffff', size: 5 + Math.random() * 4, kind: 'steam',
  });
}

// One discrete interaction with a station (E pressed, or a click on it).
export function interactWith(state, station, sound) {
  const chef = state.chef;
  if (!station) return;
  // Brief grace after any interaction: the key press that places an item
  // must not instantly pick it back up when the player holds E to chop.
  chef.cooldown = 0.4;
  const kind = station.kind;

  if (kind === 'crate') {
    if (chef.carrying || chef.plate) { say(state, 'Hands full!'); sound.error(); return; }
    chef.carrying = { kind: station.crateKind, state: 'raw' };
    sound.pickup();
    burst(state, station.x + station.w / 2, station.y + 10, '#ffe9a8', 6);
    return;
  }

  if (kind === 'board') {
    const board = state.board;
    if (!board.kind) {
      if (chef.carrying && isChoppable(chef.carrying.kind, chef.carrying.state)) {
        state.board = { kind: chef.carrying.kind, state: 'raw', progress: 0 };
        chef.carrying = null;
        sound.putdown();
      } else if (chef.carrying) {
        say(state, 'Only tomato, lettuce or onion can be chopped');
        sound.error();
      }
      return;
    }
    if (!chef.carrying && !chef.plate) {
      chef.carrying = { kind: board.kind, state: board.state };
      state.board = { kind: null, state: null, progress: 0 };
      sound.pickup();
    } else {
      say(state, 'Hands full!');
      sound.error();
    }
    return;
  }

  if (kind === 'grill') {
    const grill = state.grill;
    if (!grill.kind) {
      if (chef.carrying && isGrillable(chef.carrying.kind, chef.carrying.state)) {
        state.grill = { kind: 'patty', state: 'cooking', progress: 0, dinged: false };
        chef.carrying = null;
        sound.putdown();
      } else if (chef.carrying) {
        say(state, 'Only a raw patty goes on the grill');
        sound.error();
      }
      return;
    }
    if (!chef.carrying && !chef.plate) {
      if (grill.state === 'burnt') {
        say(state, 'Burnt! Toss it in the bin');
      }
      chef.carrying = { kind: 'patty', state: grill.state === 'ready' ? 'grilled' : grill.state === 'burnt' ? 'burnt' : 'raw' };
      state.grill = { kind: null, state: 'empty', progress: 0, dinged: false };
      sound.pickup();
    } else {
      say(state, 'Hands full!');
      sound.error();
    }
    return;
  }

  if (kind === 'assembly') {
    if (chef.plate) {
      // Put the carried plate back down on the counter.
      state.assembly = chef.plate;
      chef.plate = null;
      sound.putdown();
      return;
    }
    if (chef.carrying) {
      if (chef.carrying.state === 'burnt') { say(state, 'Burnt patty — bin it, not the plate!'); sound.error(); return; }
      state.assembly.items.push(chef.carrying);
      chef.carrying = null;
      sound.putdown();
      burst(state, station.x + station.w / 2, station.y + 30, '#ffd98a', 6);
      return;
    }
    // Empty hands: pick the plate up.
    if (state.assembly.items.length > 0) {
      chef.plate = state.assembly;
      state.assembly = { items: [] };
      sound.pickup();
    }
    return;
  }

  if (kind === 'bin') {
    if (chef.carrying) {
      chef.carrying = null;
      sound.putdown();
      burst(state, station.x + station.w / 2, station.y + 10, '#9aa0a8', 8);
    } else if (chef.plate) {
      chef.plate = null;
      sound.putdown();
      burst(state, station.x + station.w / 2, station.y + 10, '#9aa0a8', 8);
      say(state, 'Plate tossed');
    } else {
      say(state, 'Nothing to toss');
    }
    return;
  }

  if (kind === 'pass') {
    if (!chef.plate) { say(state, 'Bring a finished plate to serve'); sound.error(); return; }
    const order = findMatchingOrder(state.orders, chef.plate.items);
    if (!order) {
      say(state, 'No ticket wants this dish');
      sound.error();
      return;
    }
    const value = serveValue(order, state.combo);
    state.coins += value.coins;
    state.score += value.coins;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.orders = state.orders.filter((o) => o !== order);
    state.passFlash = 0.6;
    chef.plate = null;
    sound.serve();
    sound.coin();
    addFloat(state, station.x + 10, station.y + 120, '+' + value.coins + ' coins', '#ffd94d');
    if (value.mult > 1) addFloat(state, station.x + 10, station.y + 150, 'Combo x' + value.mult.toFixed(2), '#ff9a3d');
    burst(state, station.x + station.w / 2, station.y + 60, '#ffd94d', 16);
  }
}

// Route an interaction through the tap-vs-hold rule for the chopping
// board: pressing E on a raw item could mean "pick it up" (a tap) or
// "chop it" (a hold), so defer the pickup 0.25s — a release that soon
// picks it up, holding longer starts chopping instead. Every other
// station interacts at once.
function tryInteract(state, station, sound) {
  const chef = state.chef;
  if (
    station.kind === 'board' && state.board.kind &&
    isChoppable(state.board.kind, state.board.state) &&
    !chef.carrying && !chef.plate
  ) {
    chef.pickupPending = { t: 0.25 };
    return;
  }
  interactWith(state, station, sound);
}

// Movement, click-to-move, and edge-triggered interaction.
export function updateChef(state, input, sound, dt) {
  const chef = state.chef;
  let dx = 0;
  let dy = 0;
  if (input.held('left')) dx -= 1;
  if (input.held('right')) dx += 1;
  if (input.held('up')) dy -= 1;
  if (input.held('down')) dy += 1;

  // Resolve a deferred board pickup: released quickly means a tap.
  if (chef.pickupPending) {
    const stillHeld = input.held('interact') || input.mouse.down;
    chef.pickupPending.t -= dt;
    if (!stillHeld) {
      chef.pickupPending = null;
      const st = nearestStation(chef.x, chef.y, 130);
      if (st && st.kind === 'board') interactWith(state, st, sound);
    } else if (chef.pickupPending.t <= 0) {
      chef.pickupPending = null; // held past the tap window: chopping takes over
    }
  }

  if (input.mouse.clicked) {
    const st = stationAtPoint(input.mouse.clickX, input.mouse.clickY);
    if (st) {
      const c = stationCenter(st);
      const d = Math.hypot(chef.x - c.x, chef.y - c.y);
      if (d < 130 && chef.cooldown <= 0) {
        tryInteract(state, st, sound);
      } else {
        // Walk to an approach point in the open floor, never to the
        // station's centre: the centre sits inside the solid counter,
        // and a straight line to another station can wedge the chef on
        // a neighbour's corner. The pending check fires the interaction
        // as soon as the chef is close enough to use the station.
        let ax = c.x;
        let ay = c.y;
        if (st.kind === 'crate') { ax = c.x + 115; ay = c.y; }
        else if (st.kind === 'pass') { ax = c.x - 115; ay = c.y; }
        else { ax = c.x; ay = c.y - 115; }
        chef.moveTarget = { x: ax, y: ay };
        chef.pending = st;
      }
    } else if (input.mouse.clickY > 118) {
      chef.moveTarget = { x: input.mouse.clickX, y: input.mouse.clickY };
      chef.pending = null;
    }
  }

  if (dx !== 0 || dy !== 0) {
    chef.moveTarget = null;
    chef.pending = null;
  } else if (chef.moveTarget) {
    const tx = chef.moveTarget.x - chef.x;
    const ty = chef.moveTarget.y - chef.y;
    const d = Math.hypot(tx, ty);
    if (d < 8) {
      chef.moveTarget = null;
    } else {
      dx = tx / d;
      dy = ty / d;
    }
  }

  // A clicked station fires as soon as the chef is close enough to use
  // it — the target point itself sits inside the solid counter, so the
  // chef can never stand exactly on it.
  if (chef.pending) {
    const st = chef.pending;
    const c = stationCenter(st);
    if (Math.hypot(chef.x - c.x, chef.y - c.y) < 130 && chef.cooldown <= 0) {
      chef.pending = null;
      chef.moveTarget = null;
      tryInteract(state, st, sound);
    }
  }

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    const step = CHEF_SPEED * dt;
    const pos = moveCircle(chef.x, chef.y, (dx / len) * step, (dy / len) * step, 20);
    chef.x = pos.x;
    chef.y = pos.y;
    chef.moving = true;
    chef.bob += dt * 11;
    if (dx !== 0) chef.face = dx > 0 ? 1 : -1;
  } else {
    chef.moving = false;
  }

  if (input.wasPressed('interact') && chef.cooldown <= 0) {
    const st = nearestStation(chef.x, chef.y, 130);
    if (st) tryInteract(state, st, sound);
  }
  chef.cooldown = Math.max(0, chef.cooldown - dt);
}

// Hold-to-chop on the board and the grill's cook timer.
export function updateWorkstations(state, input, sound, dt) {
  const chef = state.chef;
  const near = nearestStation(chef.x, chef.y, 130);

  // Chopping: hold E (or hold the mouse) beside the board.
  if (near && near.kind === 'board' && state.board.kind && isChoppable(state.board.kind, state.board.state)) {
    if (input.held('interact') || input.mouse.down) {
      state.board.progress += dt / CHOP_TIME;
      if (Math.random() < dt * 9) sound.chop();
      if (Math.random() < dt * 14) {
        const c = stationCenter(near);
        burst(state, c.x, c.y - 6, '#8fce6e', 2);
      }
      if (state.board.progress >= 1) {
        state.board.state = 'chopped';
        state.board.progress = 0;
        state.chopped += 1;
        sound.chopDone();
        const c = stationCenter(near);
        burst(state, c.x, c.y - 10, '#c8f5a8', 12);
        addFloat(state, c.x - 20, c.y - 30, 'Chopped!', '#c8f5a8');
      }
    }
  }

  // Grill: patty cooks, turns ready, then burns.
  const grill = state.grill;
  if (grill.kind) {
    grill.progress += dt;
    if (grill.state === 'cooking') {
      if (Math.random() < dt * 2.2) sound.sizzle();
      if (Math.random() < dt * 6) steam(state, 512 + 105, 566 + 26);
      if (grill.progress >= GRILL_TIME) {
        grill.state = 'ready';
        if (!grill.dinged) { grill.dinged = true; sound.grillReady(); }
      }
    } else if (grill.state === 'ready') {
      if (Math.random() < dt * 3) steam(state, 512 + 105, 566 + 26);
      if (grill.progress >= BURN_TIME) {
        grill.state = 'burnt';
        sound.error();
        say(state, 'The patty burnt!');
      }
    } else if (grill.state === 'burnt') {
      if (Math.random() < dt * 8) steam(state, 512 + 105, 566 + 20);
    }
  }
}
