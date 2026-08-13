'use strict';
const { route } = require('../_lib/route'); const { adminServices } = require('../_lib/firebase-admin'); const { normalizeEconomy, publicEconomy, legacySwapClears, LEGACY_MIGRATION_CUTOFF } = require('../_lib/economy-config'); const { send } = require('../_lib/http');
module.exports = route('POST', async (_req, res, uid) => {
  const { auth, db, FieldValue } = adminServices(); const economyRef = db.doc(`economy/${uid}`); const legacyRef = db.doc(`users/${uid}/saves/main`);
  let mayMigrateLegacy = false;
  try { const user = await auth.getUser(uid); const createdAt = Date.parse(user?.metadata?.creationTime); mayMigrateLegacy = Number.isFinite(createdAt) && createdAt < Date.parse(LEGACY_MIGRATION_CUTOFF); }
  catch { /* Missing or malformed Auth metadata fails safe to a fresh economy. */ }
  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(economyRef); if (existing.exists) return publicEconomy(existing.data());
    const legacySnap = mayMigrateLegacy ? await tx.get(legacyRef) : null; const legacy = legacySnap?.exists ? legacySnap.data() : {};
    const cosmetics = legacy.cosmetics && typeof legacy.cosmetics === 'object' ? legacy.cosmetics : {};
    const economy = normalizeEconomy({ coins: legacy.coins, ownedPacks: legacy.purchasedPacks, ownedTables: cosmetics.ownedTables, ownedEffects: cosmetics.ownedEffects, swapClears: legacySwapClears(legacy.completed), migratedFromLegacy: legacySnap?.exists === true });
    tx.create(economyRef, { ...economy, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return publicEconomy(economy);
  });
  send(res, 200, result);
});
