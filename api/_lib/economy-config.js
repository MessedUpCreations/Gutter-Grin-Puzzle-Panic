'use strict';

const PACKS = Object.freeze({
  starter: { price: 0 },
  'raccoon-adventures': { price: 500 },
  'wild-n-groovy': { price: 500 },
  'epic-fantasy': { price: 500 },
});

const COSMETICS = Object.freeze({
  tables: Object.freeze({ 'classic-table': 0, 'warm-wood': 100, 'neon-arcade': 150, 'dungeon-stone': 200, 'space-grid': 250, 'dumpster-deluxe': 300 }),
  effects: Object.freeze({ 'classic-effect': 0, 'gold-spark': 50, 'fire-pop': 75, 'rainbow-burst': 100, 'retro-pixel': 125 }),
});

const TOOLS = Object.freeze({ hint: 2, backgroundReveal: 3, edgeFinder: 5, autoPlace: 10 });
const STARTING_COINS = 250;
// Accounts created before this instant may import the retired client-writable save once.
const LEGACY_MIGRATION_CUTOFF = '2026-08-13T00:00:00.000Z';
const SWAP = Object.freeze({ easy: 10, normal: 20, hard: 35, insane: 60 });
const JIGSAW = Object.freeze({
  easy: { base: 2, fastest: 300, slowest: 900, min: 1, max: 5 },
  normal: { base: 5, fastest: 900, slowest: 1800, min: 5, max: 10 },
  hard: { base: 10, fastest: 2700, slowest: 3600, min: 10, max: 20 },
  insane: { base: 20, tiers: [[3600, 40], [7200, 30], [10800, 20], [Infinity, 0]] },
});
const PUZZLE_IDS = Object.freeze([
  'smooch-mode', 'cat-mode', 'yas-queens', 'damn-that-raccoon', 'gutter-grin',
  'raccoon-campfire', 'raccoon-dumpster-fire', 'raccoon-goes-camping', 'raccoon-grocery-run', 'raccoon-pirate-adventure',
  'disco-apocalypse', 'groovy-shrooms', 'groovy-van-vibes', 'groovy-shrooms-2', 'groovy-van-2',
  'blacksmith-working', 'dragon-castle', 'dwarven-pub', 'miners-haven', 'overcast-forest',
]);
const WEEKLY = Object.freeze([
  { id: 'puzzle-bender', reward: 100 }, { id: 'jigsaw-junkie', reward: 100 },
  { id: 'hard-headed-week', reward: 125 }, { id: 'daily-degenerate', reward: 125 },
]);

function stableHash(value) { let hash = 2166136261; for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function utcDateKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function utcWeekKey(date = new Date()) { const monday = new Date(date); monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7)); return utcDateKey(monday); }
function dailyForDate(date = new Date()) { const dateKey = utcDateKey(date); const day = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86400000); const puzzleId = PUZZLE_IDS[(stableHash('gutter-grin:daily:puzzle:v1') + day * 7) % PUZZLE_IDS.length]; const slots = ['easy', 'easy', 'normal', 'normal', 'hard']; return { dateKey, puzzleId, difficulty: slots[stableHash(`gutter-grin:daily:difficulty:${dateKey}`) % slots.length] }; }
function weeklyForDate(date = new Date()) { const weekKey = utcWeekKey(date); const week = Math.floor(Date.parse(`${weekKey}T00:00:00Z`) / 604800000); return { weekKey, ...WEEKLY[(stableHash('gutter-grin:weekly:v1') + week) % WEEKLY.length] }; }
function jigsawTimeBonus(difficulty, seconds) { const rule = JIGSAW[difficulty]; if (rule.tiers) return rule.tiers.find(([max]) => seconds <= max)[1]; if (seconds <= rule.fastest) return rule.max; if (seconds > rule.slowest) return 0; return Math.max(rule.min, Math.min(rule.max, Math.ceil(rule.min + (rule.max - rule.min) * (rule.slowest - seconds) / (rule.slowest - rule.fastest)))); }
function legacySwapClears(completed) { const source = completed && typeof completed === 'object' ? completed : {}; return Object.fromEntries(Object.entries(source).filter(([key, record]) => { const parts = key.split(':'); return parts.length === 2 && PUZZLE_IDS.includes(parts[0]) && Object.hasOwn(SWAP, parts[1]) && Number(record?.clears || 0) > 0; }).map(([key, record]) => [key, Math.floor(Number(record.clears))])); }
function normalizeEconomy(value = {}) { const ownedPacks = [...new Set(['starter', ...(Array.isArray(value.ownedPacks) ? value.ownedPacks : [])])].filter((id) => PACKS[id]); const ownedTables = [...new Set(['classic-table', ...(Array.isArray(value.ownedTables) ? value.ownedTables : [])])].filter((id) => Object.hasOwn(COSMETICS.tables, id)); const ownedEffects = [...new Set(['classic-effect', ...(Array.isArray(value.ownedEffects) ? value.ownedEffects : [])])].filter((id) => Object.hasOwn(COSMETICS.effects, id)); return { version: 1, coins: Number.isFinite(value.coins) && value.coins >= 0 ? Math.floor(value.coins) : STARTING_COINS, ownedPacks, ownedTables, ownedEffects, migratedFromLegacy: value.migratedFromLegacy === true, swapClears: value.swapClears && typeof value.swapClears === 'object' ? value.swapClears : {} }; }
function publicEconomy(value) { const e = normalizeEconomy(value); return { coins: e.coins, ownedPacks: e.ownedPacks, ownedTables: e.ownedTables, ownedEffects: e.ownedEffects }; }

module.exports = { PACKS, COSMETICS, TOOLS, SWAP, JIGSAW, PUZZLE_IDS, STARTING_COINS, LEGACY_MIGRATION_CUTOFF, normalizeEconomy, publicEconomy, utcDateKey, utcWeekKey, dailyForDate, weeklyForDate, jigsawTimeBonus, legacySwapClears };
