'use strict';
const test = require('node:test'); const assert = require('node:assert/strict'); const Module = require('node:module');
const documents = new Map();
let authCreationTime = '2026-08-12T00:00:00.000Z';
const clone = (value) => structuredClone(value);
const snapshot = (path) => ({ exists: documents.has(path), data: () => clone(documents.get(path)) });
const db = {
  doc: (path) => ({ path, async get() { return snapshot(path); } }),
  async runTransaction(callback) {
    const writes = [];
    const result = await callback({
      get: async (ref) => snapshot(ref.path),
      set: (ref, value, options) => writes.push(() => documents.set(ref.path, options?.merge ? { ...(documents.get(ref.path) || {}), ...clone(value) } : clone(value))),
      create: (ref, value) => writes.push(() => { if (documents.has(ref.path)) throw new Error('already exists'); documents.set(ref.path, clone(value)); }),
    });
    writes.forEach((write) => write()); return result;
  },
};
const originalLoad = Module._load;
Module._load = function mockedLoad(request, parent, isMain) {
  if (request === 'firebase-admin/app') return { getApps: () => [{}], initializeApp: () => ({}), cert: (value) => value };
  if (request === 'firebase-admin/auth') return { getAuth: () => ({ verifyIdToken: async (token) => { if (token !== 'valid-token') throw new Error('bad token'); return { uid: 'trusted-user' }; }, getUser: async () => ({ metadata: { creationTime: authCreationTime } }) }) };
  if (request === 'firebase-admin/firestore') return { getFirestore: () => db, FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' } };
  return originalLoad(request, parent, isMain);
};
process.env.FIREBASE_ADMIN_PROJECT_ID = 'project'; process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'admin@example.com'; process.env.FIREBASE_ADMIN_PRIVATE_KEY = 'key';

function response() { return { statusCode: 0, body: null, headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, json(value) { this.body = value; } }; }
async function call(route, { method = 'POST', token = 'valid-token', body = {}, contentType = method === 'POST' ? 'application/json' : null } = {}) { const res = response(); await route({ method, body, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(contentType ? { 'content-type': contentType } : {}) } }, res); return res; }

const bootstrap = require('../../api/economy/bootstrap'); const stateRoute = require('../../api/economy/state'); const purchasePack = require('../../api/economy/purchase-pack'); const purchaseCosmetic = require('../../api/economy/purchase-cosmetic'); const spendTool = require('../../api/economy/spend-tool'); const rewardPuzzle = require('../../api/economy/reward-puzzle'); const claimDaily = require('../../api/economy/claim-daily'); const claimWeekly = require('../../api/economy/claim-weekly'); const economyConfig = require('../../api/_lib/economy-config');

test('missing and invalid tokens are rejected without leaking data', async () => {
  const missing = await call(stateRoute, { method: 'GET', token: null }); assert.equal(missing.statusCode, 401); assert.equal(missing.headers['Cache-Control'], 'no-store');
  assert.equal((await call(stateRoute, { method: 'GET', token: 'invalid' })).statusCode, 401);
  const wrongMethod = await call(stateRoute, { method: 'POST' }); assert.equal(wrongMethod.statusCode, 405); assert.equal(wrongMethod.headers['Cache-Control'], 'no-store');
  const malformed = await call(purchasePack, { body: '{bad json', contentType: 'application/json' }); assert.equal(malformed.statusCode, 400); assert.equal(malformed.body.error, 'invalid_json'); assert.equal(malformed.headers['Cache-Control'], 'no-store');
});

test('bootstrap imports valid legacy state once and ignores spoofed ownership', async () => {
  authCreationTime = '2026-08-12T00:00:00.000Z';
  documents.set('users/trusted-user/saves/main', { coins: 50000, purchasedPacks: ['starter', 'fake-pack', 'epic-fantasy'], cosmetics: { ownedTables: ['warm-wood', 'fake'], ownedEffects: ['gold-spark', 'fake'] } });
  const first = await call(bootstrap); assert.equal(first.statusCode, 200); assert.equal(first.body.coins, 50000); assert.deepEqual(first.body.ownedPacks, ['starter', 'epic-fantasy']);
  documents.set('users/trusted-user/saves/main', { coins: 999999999, purchasedPacks: ['wild-n-groovy'] });
  const second = await call(bootstrap); assert.equal(second.body.coins, 50000); assert(!second.body.ownedPacks.includes('wild-n-groovy'));
});

test('post-cutoff and malformed account creation metadata fail safe to a fresh economy', async () => {
  documents.delete('economy/trusted-user');
  documents.set('users/trusted-user/saves/main', { coins: 999999, purchasedPacks: ['epic-fantasy'], cosmetics: { ownedTables: ['space-grid'], ownedEffects: ['fire-pop'] } });
  authCreationTime = '2026-08-13T00:00:00.000Z';
  const fresh = await call(bootstrap); assert.equal(fresh.statusCode, 200); assert.equal(fresh.body.coins, 250); assert.deepEqual(fresh.body.ownedPacks, ['starter']); assert.deepEqual(fresh.body.ownedTables, ['classic-table']); assert.deepEqual(fresh.body.ownedEffects, ['classic-effect']);
  documents.delete('economy/trusted-user'); authCreationTime = 'not-a-date';
  const malformed = await call(bootstrap); assert.equal(malformed.body.coins, 250); assert.deepEqual(malformed.body.ownedPacks, ['starter']);
  authCreationTime = '2026-08-12T00:00:00.000Z';
});

test('pack transaction trusts token UID and server price and is idempotent', async () => {
  documents.set('economy/trusted-user', economyConfig.normalizeEconomy({ coins: 50000, ownedPacks: ['epic-fantasy'] }));
  const first = await call(purchasePack, { body: { uid: 'victim', packId: 'raccoon-adventures', operationId: 'pack:operation-123', price: 1 } });
  assert.equal(first.statusCode, 200); assert.equal(first.body.price, 500); assert.equal(first.body.coins, 49500); assert(documents.has('economy/trusted-user')); assert(!documents.has('economy/victim'));
  const retry = await call(purchasePack, { body: { packId: 'raccoon-adventures', operationId: 'pack:operation-123' } }); assert.equal(retry.body.coins, 49500); assert.equal(retry.body.replayed, true);
  const collision = await call(purchasePack, { body: { packId: 'wild-n-groovy', operationId: 'pack:operation-123' } }); assert.equal(collision.statusCode, 409); assert.equal(collision.body.error, 'operation_id_conflict'); assert.equal(documents.get('economy/trusted-user').coins, 49500);
  const otherId = await call(purchasePack, { body: { packId: 'raccoon-adventures', operationId: 'pack:operation-456' } }); assert.equal(otherId.body.coins, 49500); assert.equal(otherId.body.alreadyOwned, true);
});

test('cosmetic and tool prices are server-controlled and never produce negative balances', async () => {
  const cosmetic = await call(purchaseCosmetic, { body: { category: 'tables', cosmeticId: 'space-grid', operationId: 'cosmetic:operation-123', price: 1 } }); assert.equal(cosmetic.body.price, 250); assert.equal(cosmetic.body.coins, 49250);
  const tool = await call(spendTool, { body: { toolId: 'autoPlace', operationId: 'tool:operation-123', amount: 0 } }); assert.equal(tool.body.price, 10); assert.equal(tool.body.coins, 49240);
  documents.set('economy/trusted-user', { ...documents.get('economy/trusted-user'), coins: 1 });
  const denied = await call(spendTool, { body: { toolId: 'autoPlace', operationId: 'tool:operation-456' } }); assert.equal(denied.statusCode, 402); assert.equal(documents.get('economy/trusted-user').coins, 1); assert(!documents.has('economyLedger/trusted-user/entries/tool:operation-456'));
});

test('puzzle, Daily, and Weekly rewards are calculated server-side and idempotent', async () => {
  documents.set('economy/trusted-user', economyConfig.normalizeEconomy({ coins: 1000 }));
  const swap = await call(rewardPuzzle, { body: { mode: 'swap', puzzleId: 'smooch-mode', difficulty: 'easy', elapsedSeconds: 30, operationId: 'puzzle:swap-first', rewardAmount: 999999 } }); assert.equal(swap.body.coinsAwarded, 10); assert.equal(swap.body.coins, 1010);
  const swapRetry = await call(rewardPuzzle, { body: { mode: 'swap', puzzleId: 'smooch-mode', difficulty: 'easy', elapsedSeconds: 30, operationId: 'puzzle:swap-first' } }); assert.equal(swapRetry.body.coins, 1010);
  const replay = await call(rewardPuzzle, { body: { mode: 'swap', puzzleId: 'smooch-mode', difficulty: 'easy', elapsedSeconds: 30, operationId: 'puzzle:swap-replay' } }); assert.equal(replay.body.coinsAwarded, 5);
  for (const [difficulty, seconds, expected] of [['easy', 300, 7], ['normal', 900, 15], ['hard', 2700, 30], ['insane', 3600, 60]]) { const result = await call(rewardPuzzle, { body: { mode: 'jigsaw', puzzleId: 'cat-mode', difficulty, elapsedSeconds: seconds, operationId: `puzzle:jigsaw-${difficulty}` } }); assert.equal(result.body.coinsAwarded, expected); }
  const daily = economyConfig.dailyForDate(new Date()); const dailyResult = await call(claimDaily, { body: { puzzleId: daily.puzzleId, difficulty: daily.difficulty, rewardAmount: 500 } }); assert.equal(dailyResult.body.coinsAwarded, 25); const dailyRetry = await call(claimDaily, { body: { puzzleId: daily.puzzleId, difficulty: daily.difficulty } }); assert.equal(dailyRetry.body.replayed, true);
  const weekly = economyConfig.weeklyForDate(new Date()); const weeklyResult = await call(claimWeekly, { body: { challengeId: weekly.id, rewardAmount: 500 } }); assert.equal(weeklyResult.body.coinsAwarded, weekly.reward); const weeklyRetry = await call(claimWeekly, { body: { challengeId: weekly.id } }); assert.equal(weeklyRetry.body.replayed, true);
});
