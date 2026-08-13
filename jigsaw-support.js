export const ACTIVE_JIGSAW_SAVE_VERSION = 2;

const TOOL_KEYS = ['hints', 'backgroundReveals', 'edgeFinders', 'autoPlaces'];

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function stableDailyChallenge(value) {
  if (!value || typeof value !== 'object' || typeof value.dateKey !== 'string') return null;
  return { active: value.active === true, dateKey: value.dateKey };
}

export function normalizeActiveJigsawSave(value, expectedPieceCount) {
  if (!value || typeof value !== 'object' || ![1, 2].includes(value.v)) return null;
  const sourcePieces = Array.isArray(value.pieces) ? value.pieces : [];
  if (!Number.isInteger(expectedPieceCount) || sourcePieces.length !== expectedPieceCount) return null;
  const pieces = sourcePieces.map((record, id) => {
    const old = Array.isArray(record);
    const x = finiteNumber(old ? record[0] : record?.x, NaN);
    const y = finiteNumber(old ? record[1] : record?.y, NaN);
    const groupId = finiteNumber(old ? record[2] : record?.groupId, NaN);
    if (![x, y, groupId].every(Number.isFinite)) return null;
    return { id, x, y, groupId, placed: old ? record[3] === 1 || record[3] === true : record?.placed === true };
  });
  if (pieces.some((piece) => piece === null)) return null;

  const oldWorld = Array.isArray(value.world);
  const oldCamera = Array.isArray(value.camera);
  const world = {
    width: finiteNumber(oldWorld ? value.world[0] : value.world?.width, NaN),
    height: finiteNumber(oldWorld ? value.world[1] : value.world?.height, NaN),
  };
  const camera = {
    x: finiteNumber(oldCamera ? value.camera[0] : value.camera?.x, NaN),
    y: finiteNumber(oldCamera ? value.camera[1] : value.camera?.y, NaN),
    zoom: finiteNumber(oldCamera ? value.camera[2] : value.camera?.zoom, NaN),
  };
  if (![world.width, world.height, camera.x, camera.y, camera.zoom].every(Number.isFinite)
      || world.width <= 0 || world.height <= 0 || camera.zoom <= 0) return null;
  const drawOrder = Array.isArray(value.drawOrder)
    ? value.drawOrder.filter((id) => Number.isInteger(id) && id >= 0 && id < expectedPieceCount)
    : [];
  if (drawOrder.length !== expectedPieceCount || new Set(drawOrder).size !== expectedPieceCount) return null;
  const toolsUsed = Object.fromEntries(TOOL_KEYS.map((key) => [key, Math.max(0, finiteNumber(value.toolsUsed?.[key]))]));
  const save = {
    v: ACTIVE_JIGSAW_SAVE_VERSION,
    mode: 'jigsaw',
    puzzleId: value.puzzleId,
    difficulty: value.difficulty,
    seed: value.seed,
    elapsedSeconds: Math.max(0, finiteNumber(value.elapsedSeconds)),
    moves: Math.max(0, finiteNumber(value.moves)),
    placed: Math.max(0, finiteNumber(value.placed)),
    assisted: value.assisted === true,
    toolsUsed,
    coinsSpentOnTools: Math.max(0, finiteNumber(value.coinsSpentOnTools)),
    world,
    camera,
    drawOrder,
    pieces,
    updatedAt: Math.max(0, finiteNumber(value.updatedAt, Date.now())),
  };
  const dailyChallenge = stableDailyChallenge(value.dailyChallenge);
  if (dailyChallenge) save.dailyChallenge = dailyChallenge;
  return save;
}

export function hasFirestoreInvalidValue(value, insideArray = false, seen = new Set()) {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return true;
  if (value === null || typeof value !== 'object') return false;
  if (seen.has(value)) return true;
  seen.add(value);
  if (Array.isArray(value)) {
    if (insideArray) return true;
    return value.some((entry) => hasFirestoreInvalidValue(entry, true, seen));
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return true;
  return Object.values(value).some((entry) => hasFirestoreInvalidValue(entry, false, seen));
}

export function computeJigsawCanvasSize(availableWidth, availableHeight, worldWidth, worldHeight, previous = null) {
  const values = [availableWidth, availableHeight, worldWidth, worldHeight].map(Number);
  if (!values.every(Number.isFinite) || values.some((number) => number <= 0)) return null;
  const [availableW, availableH, worldW, worldH] = values;
  if (availableW < 120 || availableH < 90) return null;
  const scale = Math.min(availableW / worldW, availableH / worldH, 1200 / worldW, 900 / worldH);
  const width = worldW * scale;
  const height = worldH * scale;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 120 || height < 90) return null;
  if (previous && Math.abs(width - previous.width) < 1 && Math.abs(height - previous.height) < 1) return previous;
  return { width, height };
}
