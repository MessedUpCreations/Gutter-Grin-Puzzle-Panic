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
  assert.match(serviceWorker, /v23/);
});
