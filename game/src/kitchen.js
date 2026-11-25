// Ember & Thyme — kitchen layout and stations.
// Pure data and geometry: every station's rectangle, what it does, and
// collision. All drawing lives in render.js; all interaction in chef.js.
export const VIEW = { w: 1280, h: 720 };
export const BOARD_TOP = 0;
export const BOARD_HEIGHT = 112;
export const FLOOR = { x: 0, y: 112, w: 1280, h: 608 };

// Ingredient crates along the left wall, top to bottom.
export const CRATES = [
  { id: 'crate-tomato', kind: 'tomato', x: 18, y: 140, w: 118, h: 62 },
  { id: 'crate-lettuce', kind: 'lettuce', x: 18, y: 212, w: 118, h: 62 },
  { id: 'crate-onion', kind: 'onion', x: 18, y: 284, w: 118, h: 62 },
  { id: 'crate-patty', kind: 'patty', x: 18, y: 356, w: 118, h: 62 },
  { id: 'crate-bun', kind: 'bun', x: 18, y: 428, w: 118, h: 62 },
  { id: 'crate-cheese', kind: 'cheese', x: 18, y: 500, w: 118, h: 62 },
];

// Work stations along the bottom and right walls.
export const STATIONS = [
  { id: 'board', kind: 'board', label: 'CHOPPING BOARD', hint: 'Hold E to chop', x: 268, y: 566, w: 180, h: 108 },
  { id: 'grill', kind: 'grill', label: 'GRILL', hint: 'Patty: 5s to grill', x: 512, y: 566, w: 210, h: 108 },
  { id: 'assembly', kind: 'assembly', label: 'ASSEMBLY COUNTER', hint: 'Stack the plate', x: 786, y: 566, w: 220, h: 108 },
  { id: 'bin', kind: 'bin', label: 'BIN', hint: 'Toss it', x: 1046, y: 596, w: 92, h: 78 },
  { id: 'pass', kind: 'pass', label: 'SERVING PASS', hint: 'Ring the bell!', x: 1150, y: 140, w: 112, h: 330 },
];

export function allStations() {
  const list = [];
  for (const c of CRATES) list.push({ id: c.id, kind: 'crate', crateKind: c.kind, label: c.kind.toUpperCase(), hint: 'Grab one', x: c.x, y: c.y, w: c.w, h: c.h });
  for (const s of STATIONS) list.push(s);
  return list;
}

export function stationCenter(st) {
  return { x: st.x + st.w / 2, y: st.y + st.h / 2 };
}

// The nearest station to a point, when the chef stands close enough to use it.
export function nearestStation(x, y, maxDist) {
  let best = null;
  let bestD = maxDist || 110;
  for (const st of allStations()) {
    const c = stationCenter(st);
    const d = Math.hypot(x - c.x, y - c.y);
    if (d < bestD) { bestD = d; best = st; }
  }
  return best;
}

// The station under a mouse click (for click-to-interact).
export function stationAtPoint(px, py) {
  for (const st of allStations()) {
    if (px >= st.x - 6 && px <= st.x + st.w + 6 && py >= st.y - 6 && py <= st.y + st.h + 6) return st;
  }
  return null;
}

// Solid rectangles the chef cannot walk through (counters, crates, walls).
export function solidRects() {
  const rects = [];
  for (const c of CRATES) rects.push({ x: c.x, y: c.y, w: c.w, h: c.h });
  for (const s of STATIONS) rects.push({ x: s.x, y: s.y, w: s.w, h: s.h });
  return rects;
}

// Move a circle (chef) by (dx, dy), sliding along solid rects. Returns new pos.
export function moveCircle(x, y, dx, dy, r) {
  let nx = x + dx;
  let ny = y;
  const rects = solidRects();
  const hits = (cx, cy) => {
    if (cx - r < 8 || cx + r > VIEW.w - 8 || cy - r < FLOOR.y + 6 || cy + r > VIEW.h - 8) return true;
    for (const rc of rects) {
      if (cx + r > rc.x + 4 && cx - r < rc.x + rc.w - 4 && cy + r > rc.y + 4 && cy - r < rc.y + rc.h - 4) return true;
    }
    return false;
  };
  if (hits(nx, ny)) nx = x;
  ny = y + dy;
  if (hits(nx, ny)) ny = y;
  return { x: nx, y: ny };
}

// Which raw ingredients can be chopped on the board.
export function isChoppable(kind, state) {
  return state === 'raw' && (kind === 'tomato' || kind === 'lettuce' || kind === 'onion');
}

// Which raw ingredients can go on the grill.
export function isGrillable(kind, state) {
  return state === 'raw' && kind === 'patty';
}
