// Ember & Thyme — everything drawn on the canvas: the kitchen, the
// order board, the food, the chef, the HUD, and the menu screens.
// Food is drawn from shapes only, so the game ships zero image assets.
import { BOARD_HEIGHT, CRATES, FLOOR, STATIONS, VIEW, stationCenter } from './kitchen.js';
import { INGREDIENT_LABEL, RECIPES } from './orders.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, s, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#fff';
  ctx.font = (weight || 'bold') + ' ' + size + 'px Georgia, serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// One ingredient, drawn at (x, y) with radius-ish size s.
// state: 'raw' | 'chopped' | 'grilled' | 'burnt'.
export function drawIngredient(ctx, kind, state, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  if (state === 'burnt') {
    ctx.fillStyle = '#1c1a18';
    rr(ctx, -s, -s * 0.7, s * 2, s * 1.4, s * 0.4);
    ctx.fill();
    ctx.fillStyle = '#3a3532';
    circle(ctx, -s * 0.3, -s * 0.2, s * 0.18);
    circle(ctx, s * 0.35, s * 0.25, s * 0.14);
    ctx.restore();
    return;
  }
  if (state === 'chopped') {
    if (kind === 'tomato') {
      ctx.fillStyle = '#e23b2e';
      for (const [dx, dy, r] of [[-s * 0.5, -s * 0.2, 0], [s * 0.4, -s * 0.35, 0.6], [0, s * 0.45, -0.4]]) {
        ctx.save(); ctx.translate(dx, dy); ctx.rotate(r);
        ctx.beginPath(); ctx.moveTo(0, -s * 0.55); ctx.lineTo(s * 0.5, s * 0.4); ctx.lineTo(-s * 0.5, s * 0.4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#7ec850';
      circle(ctx, -s * 0.55, -s * 0.5, s * 0.16);
    } else if (kind === 'lettuce') {
      ctx.fillStyle = '#5da83c';
      for (const [dx, dy, r] of [[-s * 0.45, 0, 0.4], [s * 0.4, -s * 0.25, -0.5], [0, s * 0.4, 1.2], [s * 0.1, s * 0.05, 2.2]]) {
        ctx.save(); ctx.translate(dx, dy); ctx.rotate(r);
        rr(ctx, -s * 0.45, -s * 0.18, s * 0.9, s * 0.36, s * 0.18); ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'onion') {
      ctx.fillStyle = '#f3ead9';
      for (const [dx, dy] of [[-s * 0.4, -s * 0.3], [s * 0.35, -s * 0.35], [-s * 0.1, s * 0.35], [s * 0.45, s * 0.3]]) {
        rr(ctx, dx - s * 0.28, dy - s * 0.22, s * 0.56, s * 0.44, s * 0.12); ctx.fill();
      }
      ctx.strokeStyle = '#b678c9';
      ctx.lineWidth = Math.max(1, s * 0.08);
      ctx.beginPath(); ctx.arc(0, 0, s * 0.55, 0.3, 2.4); ctx.stroke();
    }
    ctx.restore();
    return;
  }
  if (kind === 'tomato') {
    ctx.fillStyle = '#d92b1f';
    circle(ctx, 0, 0, s);
    ctx.fillStyle = '#ef6a4d';
    circle(ctx, -s * 0.3, -s * 0.35, s * 0.45);
    ctx.fillStyle = '#4e9b32';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9); ctx.lineTo(s * 0.28, -s * 0.55); ctx.lineTo(0, -s * 0.45); ctx.lineTo(-s * 0.28, -s * 0.55);
    ctx.closePath(); ctx.fill();
  } else if (kind === 'lettuce') {
    ctx.fillStyle = '#69b844';
    circle(ctx, 0, 0, s);
    ctx.fillStyle = '#8fd45f';
    circle(ctx, -s * 0.35, -s * 0.2, s * 0.5);
    circle(ctx, s * 0.3, s * 0.25, s * 0.45);
    ctx.strokeStyle = '#4e9b32';
    ctx.lineWidth = Math.max(1, s * 0.08);
    ctx.beginPath(); ctx.moveTo(-s * 0.6, 0); ctx.quadraticCurveTo(0, s * 0.3, s * 0.6, -s * 0.1); ctx.stroke();
  } else if (kind === 'onion') {
    ctx.fillStyle = '#e9ddc8';
    circle(ctx, 0, 0, s);
    ctx.strokeStyle = '#b678c9';
    ctx.lineWidth = Math.max(1, s * 0.1);
    ctx.beginPath(); ctx.arc(0, 0, s * 0.66, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#7ec850';
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.2, -s * 1.3); ctx.lineTo(-s * 0.15, -s * 1.25); ctx.closePath(); ctx.fill();
  } else if (kind === 'patty') {
    ctx.fillStyle = state === 'grilled' ? '#6b3a1e' : '#c07a5a';
    rr(ctx, -s, -s * 0.62, s * 2, s * 1.24, s * 0.5);
    ctx.fill();
    if (state === 'grilled') {
      ctx.strokeStyle = '#3d2110';
      ctx.lineWidth = Math.max(1.5, s * 0.12);
      for (const dx of [-s * 0.5, 0, s * 0.5]) {
        ctx.beginPath(); ctx.moveTo(dx, -s * 0.5); ctx.lineTo(dx, s * 0.5); ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#a85f42';
      circle(ctx, -s * 0.4, 0, s * 0.16);
      circle(ctx, s * 0.35, -s * 0.1, s * 0.13);
    }
  } else if (kind === 'bun') {
    ctx.fillStyle = '#e0a44f';
    ctx.beginPath(); ctx.arc(0, s * 0.25, s, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c98a35';
    rr(ctx, -s, s * 0.15, s * 2, s * 0.3, s * 0.12);
    ctx.fill();
    ctx.fillStyle = '#fff2cf';
    circle(ctx, -s * 0.4, -s * 0.35, s * 0.09);
    circle(ctx, 0, -s * 0.55, s * 0.09);
    circle(ctx, s * 0.42, -s * 0.3, s * 0.09);
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.moveTo(-s, s * 0.7); ctx.lineTo(s, s * 0.7); ctx.lineTo(0, -s * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e0a92e';
    circle(ctx, -s * 0.2, s * 0.25, s * 0.14);
    circle(ctx, s * 0.25, s * 0.05, s * 0.11);
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, items, scale) {
  const s = scale || 1;
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath(); ctx.ellipse(x, y, 34 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d8cdb4';
  ctx.beginPath(); ctx.ellipse(x, y, 26 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
  if (items && items.length > 0) {
    const step = 13 * s;
    let yy = y - 6 * s;
    for (let i = items.length - 1; i >= 0; i--) {
      drawIngredient(ctx, items[i].kind, items[i].state, x, yy, 13 * s);
      yy -= step;
    }
  }
}

function drawTicket(ctx, order, x, y, w, h) {
  const urgent = order.remaining < 10;
  const frac = Math.max(0, order.remaining / order.total);
  const slide = order.fresh > 0 ? (1 - order.fresh / 0.35) * 0 : 0;
  ctx.save();
  ctx.translate(0, slide);
  ctx.fillStyle = urgent ? '#5a1f16' : '#fdf6e3';
  ctx.strokeStyle = urgent ? '#ff5a3c' : '#c9a86a';
  ctx.lineWidth = urgent ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  text(ctx, '#' + order.id + '  ' + order.recipe.name, x + 10, y + 16, 15, urgent ? '#ffd9c9' : '#5a3a1e', 'left');
  text(ctx, Math.ceil(order.remaining) + 's', x + w - 10, y + 16, 15, urgent ? '#ff8a6a' : '#8a6a3a', 'right');
  const iconGap = (w - 20) / order.recipe.needs.length;
  order.recipe.needs.forEach((need, i) => {
    drawIngredient(ctx, need.kind, need.state, x + 16 + iconGap * i + iconGap / 2, y + 46, 13);
  });
  ctx.fillStyle = '#e8dcc0';
  rr(ctx, x + 10, y + h - 16, w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5da83c' : frac > 0.25 ? '#e0a92e' : '#e23b2e';
  if (frac > 0) {
    rr(ctx, x + 10, y + h - 16, (w - 20) * frac, 8, 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloor(ctx, state) {
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // Checkerboard tile floor.
  const tile = 64;
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? '#c98d5a' : '#b57a48';
      ctx.fillRect(tx * tile, FLOOR.y + ty * tile, tile, tile);
    }
  }
  // Warm rug in the middle of the room.
  ctx.fillStyle = '#a33d2e';
  ctx.beginPath(); ctx.ellipse(640, 380, 300, 130, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8c98a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(640, 380, 272, 108, 0, 0, Math.PI * 2); ctx.stroke();
  // Wall band + hanging lamps above the floor.
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(0, BOARD_HEIGHT, VIEW.w, 10);
  ctx.fillStyle = '#ffd98a';
  for (const lx of [300, 640, 980]) {
    ctx.beginPath(); ctx.moveTo(lx - 16, BOARD_HEIGHT + 10); ctx.lineTo(lx + 16, BOARD_HEIGHT + 10); ctx.lineTo(lx, BOARD_HEIGHT + 34); ctx.closePath(); ctx.fill();
    circle(ctx, lx, BOARD_HEIGHT + 40, 7);
  }
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(0, 0, VIEW.w, BOARD_HEIGHT);
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(0, BOARD_HEIGHT - 6, VIEW.w, 6);
  // Diner name + shift clock + coins + combo.
  text(ctx, 'EMBER & THYME', 16, 22, 22, '#ffd98a', 'left');
  const remain = Math.max(0, state.shiftLength - state.elapsed);
  const mm = String(Math.floor(remain / 60));
  const ss = String(Math.floor(remain % 60)).padStart(2, '0');
  const clockColor = remain < 30 ? '#ff6a4d' : '#fff3d6';
  text(ctx, 'SHIFT ' + mm + ':' + ss, 16, 52, 20, clockColor, 'left');
  ctx.fillStyle = '#e8dcc0';
  rr(ctx, 14, 66, 180, 10, 5);
  ctx.fill();
  ctx.fillStyle = remain < 30 ? '#e23b2e' : '#5da83c';
  rr(ctx, 14, 66, 180 * (remain / state.shiftLength), 10, 5);
  ctx.fill();
  text(ctx, 'COINS ' + state.coins, 16, 96, 17, '#ffd94d', 'left');
  if (state.combo >= 2) {
    text(ctx, 'COMBO x' + state.combo, 210, 96, 17, '#ff9a3d', 'left');
  }
  text(ctx, 'SERVED ' + state.served, 210, 52, 15, '#c8f5a8', 'left');
  // Tickets.
  const tx0 = 330;
  const tw = 168;
  const gap = 10;
  state.orders.forEach((order, i) => {
    drawTicket(ctx, order, tx0 + i * (tw + gap), 8, tw, 96);
  });
  if (state.orders.length === 0) {
    text(ctx, 'No tickets — take a breath, chef.', tx0 + 10, 56, 16, '#c9a86a', 'left', 'normal');
  }
}

function drawCrates(ctx, state) {
  for (const c of CRATES) {
    ctx.fillStyle = '#7a4a22';
    rr(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#4e2c12';
    ctx.lineWidth = 2;
    rr(ctx, c.x, c.y, c.w, c.h, 8);
    ctx.stroke();
    ctx.fillStyle = '#9c6a35';
    ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, 18);
    drawIngredient(ctx, c.kind, 'raw', c.x + 26, c.y + 36, 14);
    drawIngredient(ctx, c.kind, 'raw', c.x + 58, c.y + 40, 12);
    drawIngredient(ctx, c.kind, 'raw', c.x + 88, c.y + 36, 13);
    text(ctx, INGREDIENT_LABEL[c.kind].toUpperCase(), c.x + c.w / 2, c.y + 15, 11, '#ffe9c4', 'center');
  }
}

function drawStations(ctx, state) {
  const near = state.nearStation;
  for (const st of STATIONS) {
    const isNear = near && near.id === st.id;
    if (st.kind === 'board') {
      ctx.fillStyle = '#8a5a2e';
      rr(ctx, st.x, st.y, st.w, st.h, 10); ctx.fill();
      ctx.fillStyle = '#d9b078';
      rr(ctx, st.x + 12, st.y + 12, st.w - 24, st.h - 52, 8); ctx.fill();
      ctx.strokeStyle = '#7a4a22';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(st.x + 30, st.y + 30); ctx.lineTo(st.x + st.w - 30, st.y + 30); ctx.stroke();
      if (state.board.kind) {
        drawIngredient(ctx, state.board.kind, state.board.state, st.x + st.w / 2, st.y + 38, 20);
        if (state.board.progress > 0) {
          ctx.strokeStyle = '#2e7d32';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(st.x + st.w / 2, st.y + 38, 28, -Math.PI / 2, -Math.PI / 2 + state.board.progress * Math.PI * 2);
          ctx.stroke();
        }
        if (state.board.state === 'chopped') text(ctx, 'CHOPPED!', st.x + st.w / 2, st.y + 71, 11, '#2e7d32', 'center');
      } else {
        text(ctx, 'knife + board', st.x + st.w / 2, st.y + 38, 13, '#8a6a3a', 'center', 'normal');
      }
    } else if (st.kind === 'grill') {
      ctx.fillStyle = '#3a3a40';
      rr(ctx, st.x, st.y, st.w, st.h, 10); ctx.fill();
      ctx.fillStyle = '#1e1e22';
      rr(ctx, st.x + 14, st.y + 12, st.w - 28, st.h - 52, 8); ctx.fill();
      ctx.strokeStyle = '#55555e';
      ctx.lineWidth = 3;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(st.x + 14 + i * ((st.w - 28) / 6), st.y + 16); ctx.lineTo(st.x + 14 + i * ((st.w - 28) / 6), st.y + st.h - 44); ctx.stroke();
      }
      if (state.grill.kind) {
        const gx = st.x + st.w / 2;
        const gy = st.y + 34;
        drawIngredient(ctx, 'patty', state.grill.state === 'ready' ? 'grilled' : state.grill.state === 'burnt' ? 'burnt' : 'raw', gx, gy, 20);
        const frac = Math.min(1, state.grill.progress / 5);
        ctx.fillStyle = '#e8dcc0';
        rr(ctx, st.x + 20, st.y + st.h - 36, st.w - 40, 8, 4); ctx.fill();
        ctx.fillStyle = state.grill.state === 'burnt' ? '#1c1a18' : state.grill.state === 'ready' ? '#5da83c' : '#e07840';
        rr(ctx, st.x + 20, st.y + st.h - 36, (st.w - 40) * frac, 8, 4); ctx.fill();
        if (state.grill.state === 'ready') text(ctx, 'READY!', gx, gy - 34, 14, '#c8f5a8', 'center');
        if (state.grill.state === 'burnt') text(ctx, 'BURNT!', gx, gy - 34, 14, '#ff8a6a', 'center');
      } else {
        text(ctx, 'hot grill — patty here', st.x + st.w / 2, st.y + 36, 13, '#9aa0a8', 'center', 'normal');
      }
    } else if (st.kind === 'assembly') {
      ctx.fillStyle = '#b98d5f';
      rr(ctx, st.x, st.y, st.w, st.h, 10); ctx.fill();
      ctx.fillStyle = '#e8cfa0';
      rr(ctx, st.x + 10, st.y + 10, st.w - 20, st.h - 46, 8); ctx.fill();
      drawPlate(ctx, st.x + st.w / 2, st.y + 44, state.assembly.items, 1);
      if (state.assembly.items.length === 0) text(ctx, 'plate — stack a dish', st.x + st.w / 2, st.y + 44, 12, '#8a6a3a', 'center', 'normal');
    } else if (st.kind === 'bin') {
      ctx.fillStyle = '#4a4f55';
      rr(ctx, st.x, st.y, st.w, st.h, 8); ctx.fill();
      ctx.fillStyle = '#2e3236';
      rr(ctx, st.x + 6, st.y + 6, st.w - 12, 16, 4); ctx.fill();
      text(ctx, 'BIN', st.x + st.w / 2, st.y + 44, 14, '#cfd4da', 'center');
    } else if (st.kind === 'pass') {
      ctx.fillStyle = '#7a4a22';
      rr(ctx, st.x, st.y, st.w, st.h, 10); ctx.fill();
      ctx.fillStyle = '#fdf6e3';
      rr(ctx, st.x + 8, st.y + 8, st.w - 16, 120, 8); ctx.fill();
      text(ctx, 'SERVE', st.x + st.w / 2, st.y + 30, 16, '#5a3a1e', 'center');
      text(ctx, 'window', st.x + st.w / 2, st.y + 52, 12, '#8a6a3a', 'center', 'normal');
      // Service bell.
      ctx.fillStyle = '#f7c948';
      ctx.beginPath(); ctx.arc(st.x + st.w / 2, st.y + 96, 16, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.fillRect(st.x + st.w / 2 - 20, st.y + 94, 40, 5);
      if (state.passFlash > 0) {
        ctx.fillStyle = 'rgba(255, 217, 77, ' + Math.min(1, state.passFlash * 2) + ')';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + state.passFlash;
          circle(ctx, st.x + st.w / 2 + Math.cos(a) * 30, st.y + 90 + Math.sin(a) * 30, 3);
        }
      }
      // A finished plate waiting on the pass ledge.
      if (state.passPlate) {
        drawPlate(ctx, st.x + st.w / 2, st.y + 170, state.passPlate.items, 1);
        text(ctx, 'READY TO SERVE', st.x + st.w / 2, st.y + 200, 12, '#ffe9c4', 'center');
      } else {
        text(ctx, 'bring a finished', st.x + st.w / 2, st.y + 170, 12, '#ffe9c4', 'center', 'normal');
        text(ctx, 'plate here', st.x + st.w / 2, st.y + 190, 12, '#ffe9c4', 'center', 'normal');
      }
      ctx.fillStyle = '#5a3a1e';
      ctx.fillRect(st.x, st.y + 240, st.w, 8);
      text(ctx, 'ding!', st.x + st.w / 2, st.y + 268, 13, '#ffd98a', 'center', 'normal');
    }
    // Label + hint under every station; glow when the chef is near.
    if (isNear) {
      ctx.strokeStyle = '#ffd94d';
      ctx.lineWidth = 3;
      rr(ctx, st.x - 4, st.y - 4, st.w + 8, st.h + 8, 12);
      ctx.stroke();
      text(ctx, st.hint, st.x + st.w / 2, st.y + st.h - 14, 13, '#2e2118', 'center');
    }
    ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
    rr(ctx, st.x + 8, st.y + st.h - 26, st.w - 16, 18, 6);
    ctx.fill();
    text(ctx, st.label, st.x + st.w / 2, st.y + st.h - 17, 11, '#ffe9c4', 'center');
  }
}

function drawChef(ctx, state) {
  const chef = state.chef;
  const bob = chef.moving ? Math.sin(chef.bob) * 2 : 0;
  const x = chef.x;
  const y = chef.y + bob;
  // Shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath(); ctx.ellipse(x, chef.y + 20, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Body (white apron) + head + toque.
  ctx.fillStyle = '#f4efe4';
  rr(ctx, x - 18, y - 8, 36, 34, 12); ctx.fill();
  ctx.fillStyle = '#d94f30';
  ctx.fillRect(x - 18, y + 14, 36, 6);
  ctx.fillStyle = '#f2c89b';
  circle(ctx, x, y - 18, 14);
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath(); ctx.arc(x - 8, y - 32, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 8, y - 32, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 34, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 13, y - 30, 26, 8);
  // Eyes look the way the chef faces.
  ctx.fillStyle = '#2e2118';
  circle(ctx, x + chef.face * 4 - 4, y - 18, 2);
  circle(ctx, x + chef.face * 4 + 4, y - 18, 2);
  // Carried item / plate above the head.
  if (chef.plate) {
    drawPlate(ctx, x, y - 52, chef.plate.items, 0.9);
  } else if (chef.carrying) {
    drawIngredient(ctx, chef.carrying.kind, chef.carrying.state, x, y - 50, 15);
  }
  // Click-to-move target marker.
  if (chef.moveTarget) {
    ctx.strokeStyle = 'rgba(255, 217, 77, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(chef.moveTarget.x, chef.moveTarget.y, 8 + Math.sin(state.time * 6) * 2, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = p.kind === 'steam' ? a * 0.5 : a;
    ctx.fillStyle = p.color;
    circle(ctx, p.x, p.y, p.size * (p.kind === 'steam' ? (1.6 - a * 0.6) : 1));
  }
  ctx.globalAlpha = 1;
}

function drawFloats(ctx, state) {
  for (const f of state.floats) {
    const a = Math.max(0, f.life / f.maxLife);
    ctx.globalAlpha = a;
    text(ctx, f.text, f.x, f.y, f.size, f.color, 'center');
  }
  ctx.globalAlpha = 1;
}

function drawToast(ctx, state) {
  if (state.messageT > 0 && state.message) {
    const a = Math.min(1, state.messageT);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(30, 18, 8, 0.85)';
    const w = 420;
    rr(ctx, VIEW.w / 2 - w / 2, 668, w, 34, 10);
    ctx.fill();
    text(ctx, state.message, VIEW.w / 2, 686, 16, '#ffe9c4', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawRushFrame(ctx, state) {
  const urgent = state.orders.some((o) => o.remaining < 10) || (state.shiftLength - state.elapsed) < 30;
  if (!urgent || state.screen !== 'playing') return;
  const pulse = 0.25 + 0.2 * Math.sin(state.time * 7);
  ctx.strokeStyle = 'rgba(255, 60, 30, ' + pulse.toFixed(3) + ')';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, VIEW.w - 10, VIEW.h - 10);
  if (state.orders.some((o) => o.remaining < 10)) {
    text(ctx, 'RUSH! A ticket is almost late!', VIEW.w / 2, 178, 22, '#ff6a4d', 'center');
  }
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(28, 16, 8, 0.88)';
  rr(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 16);
  ctx.stroke();
}

function drawStartScreen(ctx, state) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 290, 90, 700, 540);
  text(ctx, 'EMBER & THYME', 640, 140, 44, '#ffd98a', 'center');
  text(ctx, 'a cozy rush cooking game', 640, 178, 18, '#e8c98a', 'center', 'normal');
  const lines = [
    'Tickets arrive on the order board — cook each dish before its timer runs out.',
    'Grab ingredients from the crates on the left wall.',
    'Hold E at the chopping board to chop tomato, lettuce and onion.',
    'Grill patties for 5 seconds — leave them 10 and they burn!',
    'Stack the plate on the assembly counter, then serve it at the pass.',
    'On-time serves build your combo and pay more coins. Shift: 3 minutes.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 224 + i * 30, 16, '#fff3d6', 'center', 'normal'));
  text(ctx, 'ON THE MENU', 640, 424, 18, '#ffd94d', 'center');
  RECIPES.forEach((r, i) => {
    const y = 452 + i * 26;
    text(ctx, r.name + ' — ' + r.blurb, 400, y, 15, '#fff3d6', 'left', 'normal');
    r.needs.forEach((need, j) => drawIngredient(ctx, need.kind, need.state, 880 + j * 30, y, 11));
  });
  text(ctx, 'WASD / arrows to move  •  E or click to interact  •  P pause  •  M mute', 640, 574, 15, '#c9a86a', 'center', 'normal');
  const blink = 0.6 + 0.4 * Math.sin(state.time * 4);
  ctx.globalAlpha = blink;
  text(ctx, 'Press ENTER or click to start cooking', 640, 606, 20, '#ffd94d', 'center');
  ctx.globalAlpha = 1;
}

function drawPauseScreen(ctx, state) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.6)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 440, 260, 400, 180);
  text(ctx, 'PAUSED', 640, 310, 36, '#ffd98a', 'center');
  text(ctx, 'Press P to keep cooking', 640, 360, 17, '#fff3d6', 'center', 'normal');
  text(ctx, 'M mutes the kitchen sounds', 640, 392, 15, '#c9a86a', 'center', 'normal');
}

function drawGameOverScreen(ctx, state) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.6)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  panel(ctx, 390, 130, 500, 460);
  text(ctx, 'SHIFT OVER!', 640, 180, 40, '#ffd98a', 'center');
  text(ctx, 'The dinner rush is done. Here is how the kitchen did:', 640, 220, 16, '#e8c98a', 'center', 'normal');
  const rows = [
    ['Coins earned', String(state.coins)],
    ['Dishes served', String(state.served)],
    ['Tickets missed', String(state.missed)],
    ['Best combo', 'x' + state.bestCombo],
    ['Chopped', String(state.chopped)],
    ['Final score', String(state.score)],
  ];
  rows.forEach((row, i) => {
    const y = 262 + i * 36;
    text(ctx, row[0], 440, y, 18, '#fff3d6', 'left', 'normal');
    text(ctx, row[1], 840, y, 18, '#ffd94d', 'right');
  });
  const verdict = state.served >= 12 ? 'Head chef material!' : state.served >= 7 ? 'A solid shift, chef.' : 'The rush won this time — go again!';
  text(ctx, verdict, 640, 500, 18, '#c8f5a8', 'center', 'normal');
  const blink = 0.6 + 0.4 * Math.sin(state.time * 4);
  ctx.globalAlpha = blink;
  text(ctx, 'Press R or click to cook another shift', 640, 548, 18, '#ffd94d', 'center');
  ctx.globalAlpha = 1;
}

export function drawGame(ctx, state) {
  drawFloor(ctx, state);
  drawCrates(ctx, state);
  drawStations(ctx, state);
  drawChef(ctx, state);
  drawParticles(ctx, state);
  drawFloats(ctx, state);
  drawOrderBoard(ctx, state);
  drawToast(ctx, state);
  drawRushFrame(ctx, state);
  if (state.screen === 'start') drawStartScreen(ctx, state);
  else if (state.screen === 'paused') drawPauseScreen(ctx, state);
  else if (state.screen === 'over') drawGameOverScreen(ctx, state);
}
