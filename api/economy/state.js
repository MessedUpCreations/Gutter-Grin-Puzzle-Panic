'use strict';
const { route } = require('../_lib/route'); const { adminServices } = require('../_lib/firebase-admin'); const { publicEconomy } = require('../_lib/economy-config'); const { send, apiError } = require('../_lib/http');
module.exports = route('GET', async (_req, res, uid) => { const snap = await adminServices().db.doc(`economy/${uid}`).get(); if (!snap.exists) throw apiError(409, 'bootstrap_required', 'Economy bootstrap is required.'); send(res, 200, publicEconomy(snap.data())); }, { json: false });
