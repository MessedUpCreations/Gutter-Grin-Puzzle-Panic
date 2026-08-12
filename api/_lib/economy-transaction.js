'use strict';
const { adminServices } = require('./firebase-admin');
const { normalizeEconomy, publicEconomy } = require('./economy-config');
const { apiError } = require('./http');
function validOperationId(id) { return typeof id === 'string' && /^[A-Za-z0-9:_-]{8,160}$/.test(id); }
async function runEconomyOperation(uid, operationId, type, mutate) {
  if (!validOperationId(operationId)) throw apiError(400, 'invalid_operation_id', 'A valid operationId is required.');
  const { db, FieldValue } = adminServices(); const economyRef = db.doc(`economy/${uid}`); const ledgerRef = db.doc(`economyLedger/${uid}/entries/${operationId}`);
  return db.runTransaction(async (tx) => {
    const [prior, snap] = await Promise.all([tx.get(ledgerRef), tx.get(economyRef)]); if (!snap.exists) throw apiError(409, 'bootstrap_required', 'Economy bootstrap is required.');
    if (prior.exists) return { ...prior.data().result, ...publicEconomy(snap.data()), replayed: true };
    const economy = normalizeEconomy(snap.data()); const details = await mutate(economy);
    if (economy.coins < 0) throw apiError(500, 'invalid_balance', 'Economy operation failed.');
    const result = { ...publicEconomy(economy), ...details };
    tx.set(economyRef, { ...economy, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.create(ledgerRef, { version: 1, type, operationId, result, createdAt: FieldValue.serverTimestamp() });
    return result;
  });
}
module.exports = { runEconomyOperation, validOperationId };
