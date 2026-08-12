'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const config = require('../../api/_lib/economy-config');

test('trusted prices and defaults match the game', () => {
  assert.deepEqual(Object.values(config.PACKS).map((item) => item.price), [0, 500, 500, 500]);
  assert.deepEqual(config.TOOLS, { hint: 2, backgroundReveal: 3, edgeFinder: 5, autoPlace: 10 });
  assert.deepEqual(Object.values(config.COSMETICS.tables), [0, 100, 150, 200, 250, 300]);
  assert.deepEqual(Object.values(config.COSMETICS.effects), [0, 50, 75, 100, 125]);
  assert.deepEqual(config.publicEconomy(config.normalizeEconomy({})), { coins: 250, ownedPacks: ['starter'], ownedTables: ['classic-table'], ownedEffects: ['classic-effect'] });
});

test('legacy normalization keeps valid data, including 50,000 coins, and rejects unknown IDs', () => {
  const value = config.normalizeEconomy({ coins: 50000, ownedPacks: ['starter', 'fake', 'epic-fantasy'], ownedTables: ['fake', 'warm-wood'], ownedEffects: ['gold-spark', 'fake'], migratedFromLegacy: true });
  assert.equal(value.coins, 50000); assert.deepEqual(value.ownedPacks, ['starter', 'epic-fantasy']); assert.deepEqual(value.ownedTables, ['classic-table', 'warm-wood']); assert.deepEqual(value.ownedEffects, ['classic-effect', 'gold-spark']);
});

test('reward calculations and UTC challenge selection are deterministic', () => {
  assert.deepEqual(config.SWAP, { easy: 10, normal: 20, hard: 35, insane: 60 });
  assert.equal(config.jigsawTimeBonus('easy', 300), 5); assert.equal(config.jigsawTimeBonus('normal', 1800), 5); assert.equal(config.jigsawTimeBonus('hard', 2700), 20); assert.equal(config.jigsawTimeBonus('insane', 3600), 40); assert.equal(config.jigsawTimeBonus('insane', 10801), 0);
  assert.deepEqual(config.dailyForDate(new Date('2026-08-11T12:00:00Z')), config.dailyForDate(new Date('2026-08-11T23:59:59Z')));
  assert.deepEqual(config.weeklyForDate(new Date('2026-08-10T00:00:00Z')), config.weeklyForDate(new Date('2026-08-16T23:59:59Z')));
});
