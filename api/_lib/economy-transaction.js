'use strict';
const { adminServices } = require('./firebase-admin');
const { normalizeEconomy, publicEconomy } = require('./economy-config');
const { apiError } = require('./http');
function validOperationId(id) { return typeof id === 'string' && /^[A-Za-z0-9:_-]{8,160}$/.test(id); }
function operationKey(type, identity) { return JSON.stringify([type, identity]); }
function legacyEntryMatches(entry, type, identity) {
  if (entry.type !== type) return false;
  const result = entry.result || {};
  if (type === 'purchase-pack') return result.packId === identity.packId;
  if (type === 'purchase-cosmetic') return result.category === identity.category && result.cosmeticId === identity.cosmeticId;
  if (type === 'spend-tool') return result.toolId === identity.toolId;
  if (type === 'reward-puzzle') return result.mode === identity.mode && result.puzzleId === identity.puzzleId && result.difficulty === identity.difficulty;
  if (type === 'claim-daily') return result.dateKey === identity.dateKey && result.puzzleId === identity.puzzleId && result.difficulty === identity.difficulty;
  if (type === 'claim-weekly') return result.weekKey === identity.weekKey && result.challengeId === identity.challengeId;
  return false;
}
async function runEconomyOperation(uid, operationId, type, identity, mutate) {
  if (!validOperationId(operationId)) throw apiError(400, 'invalid_operation_id', 'A valid operationId is required.');
  const { db, FieldValue } = adminServices(); const economyRef = db.doc(`economy/${uid}`); const ledgerRef = db.doc(`economyLedger/${uid}/entries/${operationId}`);
  return db.runTransaction(async (tx) => {
    const [prior, snap] = await Promise.all([tx.get(ledgerRef), tx.get(economyRef)]); if (!snap.exists) throw apiError(409, 'bootstrap_required', 'Economy bootstrap is required.');
    if (prior.exists) { const entry = prior.data(); const matches = entry.operationKey ? entry.type === type && entry.operationKey === operationKey(type, identity) : legacyEntryMatches(entry, type, identity); if (!matches) throw apiError(409, 'operation_id_conflict', 'Operation ID was already used for a different request.'); return { ...entry.result, ...publicEconomy(snap.data()), replayed: true }; }
    const economy = normalizeEconomy(snap.data()); const details = await mutate(economy);
    if (economy.coins < 0) throw apiError(500, 'invalid_balance', 'Economy operation failed.');
    const result = { ...publicEconomy(economy), ...details };
    tx.set(economyRef, { ...economy, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(ledgerRef, { version: 1, type, operationId, operationKey: operationKey(type, identity), result, createdAt: FieldValue.serverTimestamp() });
    return result;
  });
}
module.exports = { runEconomyOperation, validOperationId };
