'use strict';
const test = require('node:test'); const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Firestore rules expose only the authenticated user tree to clients', () => {
  const rules = read('firestore.rules');
  assert.match(rules, /match \/users\/\{userId\}\/\{document=\*\*\}/);
  assert.match(rules, /request\.auth\.uid == userId/);
  assert.match(rules, /match \/economy\/\{uid\}[\s\S]*?allow read, write: if false/);
  assert.match(rules, /match \/economyLedger\/\{uid\}\/entries\/\{entryId\}[\s\S]*?allow read, write: if false/);
  assert.doesNotMatch(rules, /match \/\{document=\*\*\}[\s\S]*?allow/);
});

test('client queues earned rewards only and service worker bypasses APIs', () => {
  const app = read('app.js'); const serviceWorker = read('sw.js');
  assert.match(app, /\['puzzle', 'daily', 'weekly'\]\.includes\(claim\.type\)/);
  assert.doesNotMatch(app, /queueEconomyClaim\('(pack|cosmetic|tool)'/);
  assert.match(app, /if \(signedInEconomyPlayer\(\)\)[\s\S]*?economyApi\.purchasePack/);
  assert.match(app, /if \(signedInEconomyPlayer\(\)\)[\s\S]*?economyApi\.purchaseCosmetic/);
  assert.match(app, /if \(signedInEconomyPlayer\(\)\)[\s\S]*?economyApi\.spendTool/);
  assert.match(serviceWorker, /pathname\.startsWith\('\/api\/'\)\) return/);
  assert.match(serviceWorker, /v24/);
});

test('signed-in cloud saves cannot persist temporary fail-closed economy state', () => {
  const app = read('app.js');
  const payload = app.slice(app.indexOf('function getCloudSavePayload()'), app.indexOf('async function savePlayerDataToCloud()'));
  assert.match(payload, /if \(!signedInEconomyPlayer\(\) \|\| authoritativeEconomyReady\) Object\.assign\(payload/);
  assert.match(payload, /coins:[\s\S]*purchasedPacks:[\s\S]*cosmetics:/);
  assert.doesNotMatch(payload.slice(0, payload.indexOf('if (!signedInEconomyPlayer()')), /coins:|purchasedPacks:|cosmetics:/);
  const failure = app.slice(app.indexOf('async function completeProviderSignIn'), app.indexOf('function showCloudSignInToast'));
  assert.doesNotMatch(failure, /state\.coins\s*=\s*0|state\.purchasedPacks\s*=|state\.cosmetics\s*=/);
});

test('fail-closed visuals do not mutate ownership and account saves remain UID-isolated', () => {
  const app = read('app.js');
  const visible = app.slice(app.indexOf('function visibleCosmetics()'), app.indexOf('function normalizePendingEconomyClaims'));
  assert.match(visible, /!authoritativeEconomyReady \? normalizeCosmetics\(\) : normalizeCosmetics\(state\.cosmetics\)/);
  assert.doesNotMatch(visible, /state\.cosmetics\s*=/);
  assert.match(app, /auth\.currentUser\.uid !== state\.profile\.uid/);
  assert.match(app, /if \(!state\.profile\?\.uid \|\| state\.profile\.provider === 'guest'\)[\s\S]*?return;/);
  assert.doesNotMatch(app, /dev(eloper)?Uid|trusted-user|50000/);
});
