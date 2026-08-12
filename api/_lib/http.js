'use strict';
function send(res, status, body) { res.status(status); res.setHeader('Cache-Control', 'no-store'); res.json(body); }
function requireMethod(req, res, method) { if (req.method === method) return true; res.setHeader('Allow', method); send(res, 405, { error: 'method_not_allowed', message: `Use ${method}.` }); return false; }
function requireJson(req, res) { const type = String(req.headers['content-type'] || '').split(';')[0]; if (type === 'application/json' && req.body && typeof req.body === 'object' && !Array.isArray(req.body)) return true; send(res, 400, { error: 'invalid_json', message: 'A JSON object body is required.' }); return false; }
function safeError(res, error) { console.error('Economy API error:', error?.message || error); const status = Number(error?.status) || 500; send(res, status, { error: error?.code || 'server_error', message: status === 500 ? 'Economy service temporarily unavailable.' : error.message }); }
function apiError(status, code, message) { return Object.assign(new Error(message), { status, code }); }
module.exports = { send, requireMethod, requireJson, safeError, apiError };
