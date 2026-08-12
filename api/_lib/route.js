'use strict';
const { verifiedUser } = require('./auth');
const { requireMethod, requireJson, safeError } = require('./http');
function route(method, handler, { json = method !== 'GET' } = {}) { return async (req, res) => { if (!requireMethod(req, res, method) || (json && !requireJson(req, res))) return; try { const token = await verifiedUser(req); await handler(req, res, token.uid); } catch (error) { safeError(res, error); } }; }
module.exports = { route };
