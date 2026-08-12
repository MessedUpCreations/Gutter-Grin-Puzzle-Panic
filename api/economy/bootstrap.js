'use strict';
const { route } = require('../_lib/route'); const { adminServices } = require('../_lib/firebase-admin'); const { normalizeEconomy, publicEconomy, legacySwapClears } = require('../_lib/economy-config'); const { send } = require('../_lib/http');
module.exports = route('POST', async (_req, res, uid) => {
  const { db, FieldValue } = adminServices(); const economyRef = db.doc(`economy/${uid}`); const legacyRef = db.doc(`users/${uid}/saves/main`);
  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(economyRef); if (existing.exists) return publicEconomy(existing.data());
    const legacySnap = await tx.get(legacyRef); const legacy = legacySnap.exists ? legacySnap.data() : {};
    const cosmetics = legacy.cosmetics && typeof legacy.cosmetics === 'object' ? legacy.cosmetics : {};
    const economy = normalizeEconomy({ coins: legacy.coins, ownedPacks: legacy.purchasedPacks, ownedTables: cosmetics.ownedTables, ownedEffects: cosmetics.ownedEffects, swapClears: legacySwapClears(legacy.completed), migratedFromLegacy: legacySnap.exists });
    tx.create(economyRef, { ...economy, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return publicEconomy(economy);
  });
  send(res, 200, result);
});
