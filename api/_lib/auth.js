'use strict';
const { adminServices } = require('./firebase-admin');
const { apiError } = require('./http');
async function verifiedUser(req) { const match = /^Bearer ([^\s]+)$/.exec(String(req.headers.authorization || '')); if (!match) throw apiError(401, 'unauthorized', 'A valid Firebase ID token is required.'); try { return await adminServices().auth.verifyIdToken(match[1]); } catch { throw apiError(401, 'unauthorized', 'The Firebase ID token is invalid or expired.'); } }
module.exports = { verifiedUser };
