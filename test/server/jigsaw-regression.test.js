const test = require('node:test');
const assert = require('node:assert/strict');

let support;
test.before(async () => { support = await import('../../jigsaw-support.js'); });

function oldSave(count = 4) {
  return {
    v: 1, puzzleId: 'legacy', difficulty: 'easy', seed: 7, elapsedSeconds: 10,
    world: [1400, 900], camera: [700, 450, 1], drawOrder: Array.from({ length: count }, (_, id) => id),
    pieces: Array.from({ length: count }, (_, id) => [id * 10, id * 5, id < 2 ? 0 : id, id === 0 ? 1 : 0]),
    dailyChallenge: { active: true, dateKey: '2026-08-13', engine: undefined, callback() {} },
    toolsUsed: { hints: 1 }, updatedAt: 123,
  };
}

test('old tuple saves normalize to a Firestore-safe v2 schema and retain groups', () => {
  const save = support.normalizeActiveJigsawSave(oldSave(), 4);
  assert.equal(save.v, 2);
  assert.deepEqual(save.dailyChallenge, { active: true, dateKey: '2026-08-13' });
  assert.deepEqual(save.pieces.map(({ groupId }) => groupId), [0, 0, 2, 3]);
  assert.equal(support.hasFirestoreInvalidValue(save), false);
  assert.equal(JSON.stringify(save).includes('engine'), false);
});

test('new saves normalize without losing piece, camera, draw order, or tool state', () => {
  const first = support.normalizeActiveJigsawSave(oldSave(), 4);
  const second = support.normalizeActiveJigsawSave(first, 4);
  assert.deepEqual(second, first);
});

test('malformed piece records are rejected instead of throwing during restore normalization', () => {
  const malformed = oldSave();
  malformed.pieces[2] = null;
  assert.equal(support.normalizeActiveJigsawSave(malformed, 4), null);
});

test('Firestore validator rejects undefined, transient instances, and nested arrays', () => {
  assert.equal(support.hasFirestoreInvalidValue({ bad: undefined }), true);
  assert.equal(support.hasFirestoreInvalidValue({ bad: [[1]] }), true);
  assert.equal(support.hasFirestoreInvalidValue({ bad: new Map() }), true);
});

test('canvas sizing is finite and stable across target viewports and DPR-like backing sizes', () => {
  const viewports = [[320, 568], [360, 640], [390, 844], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1920, 1080]];
  const dprs = [1, 1.25, 1.5, 2, 3];
  for (const [width, height] of viewports) {
    const first = support.computeJigsawCanvasSize(width - 20.4, height - 180.6, 1400, 900);
    assert.ok(first && first.width >= 120 && first.height >= 90);
    assert.strictEqual(support.computeJigsawCanvasSize(width - 20.1, height - 180.2, 1400, 900, first), first);
    for (const dpr of dprs) {
      assert.ok(Number.isFinite(Math.round(first.width * dpr)) && Math.round(first.width * dpr) > 0);
    }
  }
});

test('invalid or collapsing layout measurements preserve the last known good size', () => {
  const good = support.computeJigsawCanvasSize(800, 600, 1400, 900);
  assert.equal(support.computeJigsawCanvasSize(0, 0, 1400, 900, good), null);
  assert.equal(support.computeJigsawCanvasSize(100, 80, 1400, 900, good), null);
  assert.strictEqual(support.computeJigsawCanvasSize(800.4, 600.4, 1400, 900, good), good);
});

test('guest and cloud-save failure paths remain non-blocking in game startup', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const app = fs.readFileSync(path.resolve(__dirname, '../../app.js'), 'utf8');
  const scheduler = app.slice(app.indexOf('async function saveActiveJigsawToCloud'), app.indexOf('async function getFirebaseContext'));
  const startup = app.slice(app.indexOf('  start() {'), app.indexOf('  configureBoard()'));
  assert.match(scheduler, /provider === 'guest'\) return/);
  assert.match(scheduler, /saveActiveJigsawToCloud\([\s\S]*?\.catch/);
  assert.match(startup, /createPieces\(\)[\s\S]*?requestRender\(\)[\s\S]*?scheduleActiveJigsawSave/);
  assert.doesNotMatch(startup, /await scheduleActiveJigsawSave/);
});
