// Ember & Thyme — recipes and the order board.
// A recipe is a list of ingredient needs: { kind, state }.
// An order (ticket) is a recipe plus a countdown; serving the matching
// plate before the countdown ends pays coins and builds the combo.
export const INGREDIENTS = ['tomato', 'lettuce', 'onion', 'patty', 'bun', 'cheese'];

export const INGREDIENT_LABEL = {
  tomato: 'Tomato',
  lettuce: 'Lettuce',
  onion: 'Onion',
  patty: 'Patty',
  bun: 'Bun',
  cheese: 'Cheese',
};

export const RECIPES = [
  {
    name: 'Herb Soup',
    short: 'Soup',
    needs: [
      { kind: 'onion', state: 'chopped' },
      { kind: 'tomato', state: 'chopped' },
    ],
    base: 22,
    blurb: 'Quick warm-up bowl',
  },
  {
    name: 'Garden Bowl',
    short: 'Bowl',
    needs: [
      { kind: 'tomato', state: 'chopped' },
      { kind: 'lettuce', state: 'chopped' },
      { kind: 'onion', state: 'chopped' },
    ],
    base: 30,
    blurb: 'Crisp and fresh',
  },
  {
    name: 'Ember Melt',
    short: 'Melt',
    needs: [
      { kind: 'bun', state: 'raw' },
      { kind: 'patty', state: 'grilled' },
      { kind: 'cheese', state: 'raw' },
    ],
    base: 34,
    blurb: 'Cheese over embers',
  },
  {
    name: 'Sunset Stack',
    short: 'Stack',
    needs: [
      { kind: 'bun', state: 'raw' },
      { kind: 'patty', state: 'grilled' },
      { kind: 'cheese', state: 'raw' },
      { kind: 'lettuce', state: 'chopped' },
    ],
    base: 44,
    blurb: 'The house signature',
  },
];

export function recipeByName(name) {
  return RECIPES.find((r) => r.name === name) || RECIPES[0];
}

// How long a ticket lives, shrinking as the shift wears on.
export function ticketTimeFor(elapsed) {
  if (elapsed < 45) return 48;
  if (elapsed < 100) return 42;
  return 36;
}

// How many tickets may sit on the board at once.
export function maxOrdersFor(elapsed) {
  if (elapsed < 45) return 3;
  if (elapsed < 110) return 4;
  return 5;
}

// Seconds between new tickets, shrinking as the shift wears on.
export function spawnIntervalFor(elapsed) {
  if (elapsed < 45) return 13;
  if (elapsed < 100) return 10;
  return 8;
}

// Early tickets favour the easy recipes; the full menu opens up later.
export function pickRecipe(elapsed, rand) {
  const pool = elapsed < 30 ? RECIPES.slice(0, 2) : RECIPES;
  return pool[Math.floor(rand() * pool.length)];
}

export function newOrder(id, elapsed, rand) {
  const recipe = pickRecipe(elapsed, rand);
  const total = ticketTimeFor(elapsed);
  return { id, recipe, remaining: total, total, fresh: 0 };
}

// Does a plate (array of {kind, state}) satisfy this recipe exactly?
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.needs.length) return false;
  const rest = plateItems.slice();
  for (const need of recipe.needs) {
    const i = rest.findIndex((it) => it.kind === need.kind && it.state === need.state);
    if (i < 0) return false;
    rest.splice(i, 1);
  }
  return true;
}

// Which open ticket does this plate serve? Prefer the one closest to late.
export function findMatchingOrder(orders, plateItems) {
  let best = null;
  for (const order of orders) {
    if (!plateMatchesRecipe(plateItems, order.recipe)) continue;
    if (!best || order.remaining < best.remaining) best = order;
  }
  return best;
}

// Coins for a serve: base + speed bonus, scaled by the combo multiplier.
export function serveValue(order, combo) {
  const speedBonus = Math.round(12 * (order.remaining / order.total));
  const mult = Math.min(3, 1 + 0.25 * Math.max(0, combo - 1));
  return { coins: Math.round((order.recipe.base + speedBonus) * mult), mult };
}

// Advance every ticket's countdown. Returns the orders that just expired.
export function updateOrders(orders, dt) {
  const expired = [];
  for (const order of orders) {
    order.remaining -= dt;
    order.fresh = Math.max(0, order.fresh - dt);
    if (order.remaining <= 0) expired.push(order);
  }
  return expired;
}
