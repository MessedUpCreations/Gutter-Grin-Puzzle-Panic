const PUZZLES = [
  // Keep these five legacy IDs stable so existing completion and Jigsaw save keys remain valid.
  { id: 'smooch-mode', title: 'Backyard Cookout', image: 'assets/puzzles/starter/backyard-cookout.webp', width: 1402, height: 1122, pack: 'starter' },
  { id: 'cat-mode', title: 'Chaotic Garage Sale', image: 'assets/puzzles/starter/chaotic-garage-sale.webp', width: 1402, height: 1122, pack: 'starter' },
  { id: 'yas-queens', title: 'Laundromat From Hell', image: 'assets/puzzles/starter/laundromat-from-hell.webp', width: 1402, height: 1122, pack: 'starter' },
  { id: 'damn-that-raccoon', title: 'Raccoon Eating Pizza', image: 'assets/puzzles/starter/raccoon-eating-pizza.webp', width: 1402, height: 1122, pack: 'starter' },
  { id: 'gutter-grin', title: "The Dragon's Pit", image: 'assets/puzzles/starter/the-dragons-pit.webp', width: 1402, height: 1122, pack: 'starter' },
  { id: 'raccoon-campfire', title: 'Raccoon Campfire', image: 'assets/puzzles/raccoon-adventures/raccoon-campfire.webp', width: 1402, height: 1122, pack: 'raccoon-adventures' },
  { id: 'raccoon-dumpster-fire', title: 'Raccoon Dumpster Fire', image: 'assets/puzzles/raccoon-adventures/raccoon-dumpster-fire.webp', width: 1154, height: 1363, pack: 'raccoon-adventures' },
  { id: 'raccoon-goes-camping', title: 'Raccoon Goes Camping', image: 'assets/puzzles/raccoon-adventures/raccoon-goes-camping.webp', width: 1402, height: 1122, pack: 'raccoon-adventures' },
  { id: 'raccoon-grocery-run', title: 'Raccoon Grocery Run', image: 'assets/puzzles/raccoon-adventures/raccoon-grocery-run.webp', width: 1464, height: 1075, pack: 'raccoon-adventures' },
  { id: 'raccoon-pirate-adventure', title: 'Raccoon Pirate Adventure', image: 'assets/puzzles/raccoon-adventures/raccoon-pirate-adventure.webp', width: 1536, height: 1024, pack: 'raccoon-adventures' },
  { id: 'disco-apocalypse', title: 'Disco Apocalypse', image: 'assets/puzzles/wild-n-groovy/disco-apocalypse.webp', width: 1402, height: 1122, pack: 'wild-n-groovy' },
  { id: 'groovy-shrooms', title: 'Groovy Shrooms', image: 'assets/puzzles/wild-n-groovy/groovy-shrooms.webp', width: 3000, height: 3000, pack: 'wild-n-groovy' },
  { id: 'groovy-van-vibes', title: 'Groovy Van Vibes', image: 'assets/puzzles/wild-n-groovy/groovy-van-vibes.webp', width: 1920, height: 1920, pack: 'wild-n-groovy' },
  { id: 'groovy-shrooms-2', title: 'Groovy Shrooms 2', image: 'assets/puzzles/wild-n-groovy/groovy-shrooms-2.webp', width: 1500, height: 1000, pack: 'wild-n-groovy' },
  { id: 'groovy-van-2', title: 'Groovy Van 2', image: 'assets/puzzles/wild-n-groovy/groovy-van-2.webp', width: 2560, height: 2560, pack: 'wild-n-groovy' },
  { id: 'blacksmith-working', title: 'Blacksmith Working', image: 'assets/puzzles/epic-fantasy/blacksmith-working.webp', width: 1536, height: 1024, pack: 'epic-fantasy' },
  { id: 'dragon-castle', title: 'Dragon Castle', image: 'assets/puzzles/epic-fantasy/dragon-castle.webp', width: 1254, height: 1254, pack: 'epic-fantasy' },
  { id: 'dwarven-pub', title: 'Dwarven Pub', image: 'assets/puzzles/epic-fantasy/dwarven-pub.webp', width: 1254, height: 1254, pack: 'epic-fantasy' },
  { id: 'miners-haven', title: "Miners' Haven", image: 'assets/puzzles/epic-fantasy/miners-haven.webp', width: 1536, height: 1024, pack: 'epic-fantasy' },
  { id: 'overcast-forest', title: 'Overcast Forest', image: 'assets/puzzles/epic-fantasy/overcast-forest.webp', width: 1536, height: 1024, pack: 'epic-fantasy' },
];

const PACKS = [
  { id: 'starter', title: 'Starter Pack', count: 5, price: 0, owned: true, available: true, image: 'assets/puzzles/starter/backyard-cookout.webp', description: 'Five chaotic puzzles included with the game.' },
  { id: 'raccoon-adventures', title: 'Raccoon Adventures', count: 5, price: 500, owned: false, available: true, image: 'assets/puzzles/raccoon-adventures/raccoon-campfire.webp', description: 'Trash-panda trouble from the campground to the high seas.' },
  { id: 'wild-n-groovy', title: "Wild n' Groovy", count: 5, price: 500, owned: false, available: true, image: 'assets/puzzles/wild-n-groovy/disco-apocalypse.webp', description: 'Disco chaos, psychedelic shrooms, and groovy vans.' },
  { id: 'epic-fantasy', title: 'Epic Fantasy', count: 5, price: 500, owned: false, available: true, image: 'assets/puzzles/epic-fantasy/dragon-castle.webp', description: 'Dragons, dwarves, blacksmiths, and fantastic wilds.' },
];

function ownsPack(pack) {
  return pack.owned || state.purchasedPacks.includes(pack.id);
}

const SWAP_DIFFICULTIES = {
  easy:   { label: 'Easy', cols: 3, rows: 3, reward: 10 },
  normal: { label: 'Normal', cols: 4, rows: 4, reward: 20 },
  hard:   { label: 'Hard', cols: 5, rows: 5, reward: 35 },
  insane: { label: 'Insane', cols: 6, rows: 6, reward: 60 },
};

// Timing values are in seconds so Stage 9B can calculate time bonuses directly.
const JIGSAW_DIFFICULTIES = {
  easy: { label: 'Easy', pieces: 52, reward: 2, timeBonus: { type: 'sliding', fastestSeconds: 300, slowestSeconds: 900, minCoins: 1, maxCoins: 5 } },
  normal: { label: 'Normal', pieces: 252, reward: 5, timeBonus: { type: 'sliding', fastestSeconds: 900, slowestSeconds: 1800, minCoins: 5, maxCoins: 10 } },
  hard: { label: 'Hard', pieces: 500, reward: 10, timeBonus: { type: 'sliding', fastestSeconds: 2700, slowestSeconds: 3600, minCoins: 10, maxCoins: 20 } },
  insane: { label: 'Insane', pieces: 1000, reward: 20, timeBonus: { type: 'tiers', tiers: [
    { maxSeconds: 3600, coins: 40 }, { maxSeconds: 7200, coins: 30 },
    { maxSeconds: 10800, coins: 20 }, { maxSeconds: null, coins: 0 },
  ] } },
};

const JIGSAW_TOOLS = Object.freeze({
  hint: { label: 'Hint', icon: '💡', cost: 2, counter: 'hints', description: 'Briefly show where a piece belongs.' },
  backgroundReveal: { label: 'Background Reveal', icon: '👁', cost: 3, counter: 'backgroundReveals', description: 'Show the completed image beneath the puzzle for 10 seconds.' },
  edgeFinder: { label: 'Edge Finder', icon: '🧩', cost: 5, counter: 'edgeFinders', description: 'Highlight loose outside-edge pieces for 15 seconds.' },
  autoPlace: { label: 'Auto-Place', icon: '✨', cost: 10, counter: 'autoPlaces', description: 'Correctly place one random loose piece.' },
});

const DAILY_CHALLENGE = Object.freeze({
  bonusCoins: 25,
  puzzleIds: Object.freeze([
    'smooch-mode', 'cat-mode', 'yas-queens', 'damn-that-raccoon', 'gutter-grin',
    'raccoon-campfire', 'raccoon-dumpster-fire', 'raccoon-goes-camping', 'raccoon-grocery-run', 'raccoon-pirate-adventure',
    'disco-apocalypse', 'groovy-shrooms', 'groovy-van-vibes', 'groovy-shrooms-2', 'groovy-van-2',
    'blacksmith-working', 'dragon-castle', 'dwarven-pub', 'miners-haven', 'overcast-forest',
  ]),
  difficultySlots: Object.freeze(['easy', 'easy', 'normal', 'normal', 'hard']),
});

const DEFAULT_DAILY_CHALLENGE_STATS = Object.freeze({
  lastCompletedDate: null,
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  fastestSeconds: null,
  fastestPuzzleId: null,
  fastestDifficulty: null,
});

function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function adjacentUtcDateKey(dateKey, offsetDays) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return utcDateKey(date);
}

function stableDailyHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dailyChallengeForDate(dateOrKey = new Date()) {
  const dateKey = typeof dateOrKey === 'string' ? dateOrKey : utcDateKey(dateOrKey);
  const pool = DAILY_CHALLENGE.puzzleIds;
  const utcDayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00.000Z`) / 86400000);
  // Seven is coprime with the 20-item pool, producing a stable full rotation with no consecutive duplicates.
  const puzzleIndex = (stableDailyHash('gutter-grin:daily:puzzle:v1') + utcDayNumber * 7) % pool.length;
  const difficulty = DAILY_CHALLENGE.difficultySlots[
    stableDailyHash(`gutter-grin:daily:difficulty:${dateKey}`) % DAILY_CHALLENGE.difficultySlots.length
  ];
  return { dateKey, puzzleId: pool[puzzleIndex], difficulty };
}

function normalizeDailyChallengeStats(value) {
  const stats = value && typeof value === 'object' ? value : {};
  return {
    lastCompletedDate: typeof stats.lastCompletedDate === 'string' ? stats.lastCompletedDate : null,
    currentStreak: Math.max(0, Number(stats.currentStreak || 0)),
    longestStreak: Math.max(0, Number(stats.longestStreak || 0)),
    totalCompletions: Math.max(0, Number(stats.totalCompletions || 0)),
    fastestSeconds: Number.isFinite(stats.fastestSeconds) && stats.fastestSeconds > 0 ? stats.fastestSeconds : null,
    fastestPuzzleId: typeof stats.fastestPuzzleId === 'string' ? stats.fastestPuzzleId : null,
    fastestDifficulty: ['easy', 'normal', 'hard'].includes(stats.fastestDifficulty) ? stats.fastestDifficulty : null,
  };
}

const DEFAULT_LIFETIME_STATS = Object.freeze({
  totalJigsawPiecesPlaced: 0,
  toolsUsedLifetime: Object.freeze({ hints: 0, backgroundReveals: 0, edgeFinders: 0, autoPlaces: 0 }),
});

function normalizeLifetimeStats(value) {
  const stats = value && typeof value === 'object' ? value : {};
  const tools = stats.toolsUsedLifetime && typeof stats.toolsUsedLifetime === 'object' ? stats.toolsUsedLifetime : {};
  return {
    totalJigsawPiecesPlaced: Math.max(0, Number(stats.totalJigsawPiecesPlaced || 0)),
    toolsUsedLifetime: {
      hints: Math.max(0, Number(tools.hints || 0)),
      backgroundReveals: Math.max(0, Number(tools.backgroundReveals || 0)),
      edgeFinders: Math.max(0, Number(tools.edgeFinders || 0)),
      autoPlaces: Math.max(0, Number(tools.autoPlaces || 0)),
    },
  };
}

function normalizeAchievements(value) {
  const unlocked = value?.unlocked && typeof value.unlocked === 'object' ? value.unlocked : {};
  return {
    unlocked: Object.fromEntries(Object.entries(unlocked)
      .filter(([id, record]) => typeof id === 'string' && record && typeof record.unlockedAt === 'string')
      .map(([id, record]) => [id, { unlockedAt: record.unlockedAt }])),
  };
}

function completionEntries() {
  return Object.entries(state.completed || {}).filter(([, record]) => Number(record?.clears || 0) > 0);
}

function totalPuzzleCompletions() {
  const recordedClears = completionEntries().reduce((total, [, record]) => total + Number(record.clears || 0), 0);
  return Math.max(Number(state.puzzlesCompleted || 0), recordedClears);
}

function completedPuzzleInEitherMode(puzzleId) {
  return completionEntries().some(([key]) => key.startsWith(`${puzzleId}:`) || key.startsWith(`jigsaw:${puzzleId}:`));
}

function completedJigsawDifficulty(difficulty) {
  return completionEntries().some(([key]) => key.startsWith('jigsaw:') && key.endsWith(`:${difficulty}`));
}

function packCompletionCount(packId) {
  return PUZZLES.filter((puzzle) => puzzle.pack === packId && completedPuzzleInEitherMode(puzzle.id)).length;
}

function ownedPackCount() {
  return PACKS.filter((pack) => pack.owned || state.purchasedPacks.includes(pack.id)).length;
}

function lifetimeToolUseCount() {
  return Object.values(normalizeLifetimeStats(state.lifetimeStats).toolsUsedLifetime).reduce((total, count) => total + count, 0);
}

const ACHIEVEMENTS = Object.freeze([
  { id: 'first-piece-of-trash', title: 'First Piece of Trash', description: 'Complete your first puzzle.', category: 'general', icon: '🗑️', target: 1, unit: 'puzzles', progress: totalPuzzleCompletions },
  { id: 'getting-the-hang-of-this', title: 'Getting the Hang of This', description: 'Complete 10 puzzles.', category: 'general', icon: '🏆', target: 10, unit: 'puzzles', progress: totalPuzzleCompletions },
  { id: 'piece-addict', title: 'Piece Addict', description: 'Place 10,000 Jigsaw pieces.', category: 'general', icon: '🧩', target: 10000, unit: 'pieces', progress: () => normalizeLifetimeStats(state.lifetimeStats).totalJigsawPiecesPlaced },
  { id: 'touch-grass', title: 'Touch Grass', description: 'Spend 10 hours solving puzzles.', category: 'general', icon: '🌱', target: 36000, unit: 'seconds', progress: () => state.totalSeconds || 0 },
  { id: 'easy-does-it', title: 'Easy Does It', description: 'Complete an Easy Jigsaw puzzle.', category: 'difficulty', icon: '🙂', target: 1, progress: () => completedJigsawDifficulty('easy') ? 1 : 0 },
  { id: 'normal-is-relative', title: 'Normal Is Relative', description: 'Complete a Normal Jigsaw puzzle.', category: 'difficulty', icon: '😅', target: 1, progress: () => completedJigsawDifficulty('normal') ? 1 : 0 },
  { id: 'hard-headed', title: 'Hard Headed', description: 'Complete a Hard Jigsaw puzzle.', category: 'difficulty', icon: '🤕', target: 1, progress: () => completedJigsawDifficulty('hard') ? 1 : 0 },
  { id: 'masochist', title: 'Masochist', description: 'Complete a 1,000-piece Insane Jigsaw puzzle.', category: 'difficulty', icon: '😈', target: 1, progress: () => completedJigsawDifficulty('insane') ? 1 : 0 },
  { id: 'daily-dose', title: 'Daily Dose', description: 'Complete your first Daily Challenge.', category: 'daily', icon: '📅', target: 1, unit: 'days', progress: () => normalizeDailyChallengeStats(state.dailyChallengeStats).totalCompletions },
  { id: 'three-day-bender', title: 'Three-Day Bender', description: 'Reach a 3-day Daily Challenge streak.', category: 'daily', icon: '🔥', target: 3, unit: 'days', progress: () => normalizeDailyChallengeStats(state.dailyChallengeStats).longestStreak },
  { id: 'week-long-problem', title: 'Week-Long Problem', description: 'Reach a 7-day Daily Challenge streak.', category: 'daily', icon: '🔥', target: 7, unit: 'days', progress: () => normalizeDailyChallengeStats(state.dailyChallengeStats).longestStreak },
  { id: 'habit-forming', title: 'Habit Forming', description: 'Complete 30 Daily Challenges.', category: 'daily', icon: '🗓️', target: 30, unit: 'days', progress: () => normalizeDailyChallengeStats(state.dailyChallengeStats).totalCompletions },
  { id: 'dumpster-diver', title: 'Dumpster Diver', description: 'Complete every Raccoon Adventures puzzle.', category: 'collections', icon: '🦝', target: 5, unit: 'puzzles', progress: () => packCompletionCount('raccoon-adventures') },
  { id: 'groovy-baby', title: 'Groovy, Baby', description: "Complete every Wild n' Groovy puzzle.", category: 'collections', icon: '🪩', target: 5, unit: 'puzzles', progress: () => packCompletionCount('wild-n-groovy') },
  { id: 'quest-complete', title: 'Quest Complete', description: 'Complete every Epic Fantasy puzzle.', category: 'collections', icon: '🐉', target: 5, unit: 'puzzles', progress: () => packCompletionCount('epic-fantasy') },
  { id: 'collector', title: 'Collector', description: 'Own every currently available puzzle pack.', category: 'collections', icon: '📦', target: () => PACKS.filter((pack) => pack.available).length, unit: 'packs', progress: ownedPackCount },
  { id: 'need-a-little-help', title: 'Need a Little Help?', description: 'Use your first Jigsaw Tool.', category: 'tools', icon: '🛠️', target: 1, unit: 'tools', progress: lifetimeToolUseCount },
  { id: 'training-wheels', title: 'Training Wheels', description: 'Use Auto-Place 25 times.', category: 'tools', icon: '✨', target: 25, unit: 'Auto-Places', progress: () => normalizeLifetimeStats(state.lifetimeStats).toolsUsedLifetime.autoPlaces },
].map((achievement) => Object.freeze({ hidden: false, ...achievement })));

const GAME_MODES = {
  swap: { label: 'Swap Puzzle', icon: '⇄', description: 'Swap scrambled tiles until the artwork is back where it belongs.', difficulties: SWAP_DIFFICULTIES },
  jigsaw: { label: 'Classic Jigsaw', icon: '🧩', description: 'Piece together a traditional interlocking jigsaw before the clock beats you.', difficulties: JIGSAW_DIFFICULTIES },
};

const STORAGE_KEY = 'gutterGrinPuzzlePanic.v1';
const JIGSAW_SAVE_KEY = 'gutterGrinPuzzlePanic.jigsawActive.v1';
const defaultState = {
  profile: { provider: 'guest', name: 'Guest Player', uid: null },
  coins: 250,
  selectedMode: 'swap',
  difficulty: 'normal',
  completed: {},
  purchasedPacks: ['starter'],
  totalMoves: 0,
  totalSeconds: 0,
  puzzlesCompleted: 0,
  dailyChallengeStats: { ...DEFAULT_DAILY_CHALLENGE_STATS },
  lifetimeStats: { totalJigsawPiecesPlaced: 0, toolsUsedLifetime: { ...DEFAULT_LIFETIME_STATS.toolsUsedLifetime } },
  achievements: { unlocked: {} },
};

let state = loadState();
let currentView = 'home';
let game = null;
let timerHandle = null;
let previewHandle = null;
let firebaseContext = null;
let puzzleFlow = { step: 'mode', puzzleId: null };
let jigsawGame = null;
let activeJigsawSave = null;
let jigsawLocalSaveTimer = null;
let jigsawCloudSaveTimer = null;
let playerProgressCloudSaveTimer = null;
const achievementNotificationQueue = [];
let achievementNotificationActive = false;

function achievementTarget(achievement) {
  return typeof achievement.target === 'function' ? achievement.target() : achievement.target;
}

function evaluateAchievements({ notify = true } = {}) {
  state.achievements = normalizeAchievements(state.achievements);
  const newlyUnlocked = [];
  ACHIEVEMENTS.forEach((achievement) => {
    if (state.achievements.unlocked[achievement.id]) return;
    const target = achievementTarget(achievement);
    if (Number(achievement.progress()) < target) return;
    state.achievements.unlocked[achievement.id] = { unlockedAt: new Date().toISOString() };
    newlyUnlocked.push(achievement);
  });
  if (notify && newlyUnlocked.length) queueAchievementNotifications(newlyUnlocked);
  return newlyUnlocked;
}

function queueAchievementNotifications(achievements) {
  achievementNotificationQueue.push(...achievements);
  showNextAchievementNotification();
}

function showNextAchievementNotification() {
  if (achievementNotificationActive || !achievementNotificationQueue.length) return;
  achievementNotificationActive = true;
  const achievement = achievementNotificationQueue.shift();
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span>${achievement.icon}</span><div><small>🏆 ACHIEVEMENT UNLOCKED!</small><strong>${escapeHtml(achievement.title)}</strong><p>${escapeHtml(achievement.description)}</p></div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    achievementNotificationActive = false;
    showNextAchievementNotification();
  }, 3800);
}

function schedulePlayerProgressSave() {
  saveLocalState();
  if (!state.profile?.uid || state.profile.provider === 'guest') return;
  clearTimeout(playerProgressCloudSaveTimer);
  playerProgressCloudSaveTimer = setTimeout(() => {
    savePlayerDataToCloud().catch((error) => console.error('Progress cloud save failed:', error));
  }, 1500);
}

async function flushPlayerProgressSave() {
  clearTimeout(playerProgressCloudSaveTimer);
  saveLocalState();
  if (!state.profile?.uid || state.profile.provider === 'guest') return;
  try { await savePlayerDataToCloud(); } catch (error) { console.error('Progress cloud save failed:', error); }
}

function recordLifetimeJigsawPiecesPlaced(count) {
  if (!Number.isInteger(count) || count <= 0) return;
  state.lifetimeStats = normalizeLifetimeStats(state.lifetimeStats);
  state.lifetimeStats.totalJigsawPiecesPlaced += count;
  evaluateAchievements();
  schedulePlayerProgressSave();
}

function recordLifetimeToolUse(counter) {
  if (!Object.hasOwn(DEFAULT_LIFETIME_STATS.toolsUsedLifetime, counter)) return;
  state.lifetimeStats = normalizeLifetimeStats(state.lifetimeStats);
  state.lifetimeStats.toolsUsedLifetime[counter] += 1;
  evaluateAchievements();
}

function jigsawSaveScope() { return state.profile?.uid || 'guest'; }
function validActiveJigsawSave(save) {
  return !!save && save.v === 1 && PUZZLES.some((p) => p.id === save.puzzleId)
    && JIGSAW_DIFFICULTIES[save.difficulty]?.pieces === save.pieces?.length
    && Number.isInteger(save.seed) && Array.isArray(save.camera) && Array.isArray(save.drawOrder);
}
function readLocalActiveJigsaw() {
  try {
    const all = JSON.parse(localStorage.getItem(JIGSAW_SAVE_KEY)) || {};
    const save = all[jigsawSaveScope()];
    return validActiveJigsawSave(save) ? save : null;
  } catch { return null; }
}
function writeLocalActiveJigsaw(save) {
  let all = {};
  try { all = JSON.parse(localStorage.getItem(JIGSAW_SAVE_KEY)) || {}; } catch { /* replace invalid data */ }
  if (save) all[jigsawSaveScope()] = save; else delete all[jigsawSaveScope()];
  localStorage.setItem(JIGSAW_SAVE_KEY, JSON.stringify(all));
  activeJigsawSave = save;
}
async function saveActiveJigsawToCloud(save) {
  if (!state.profile?.uid || state.profile.provider === 'guest') return;
  const { db, firestoreMod, auth } = await getFirebaseContext();
  if (auth.currentUser?.uid !== state.profile.uid) return;
  const ref = firestoreMod.doc(db, 'users', state.profile.uid, 'jigsawSaves', 'active');
  await firestoreMod.setDoc(ref, save);
}
async function deleteActiveJigsawFromCloud() {
  if (!state.profile?.uid || state.profile.provider === 'guest') return;
  const { db, firestoreMod, auth } = await getFirebaseContext();
  if (auth.currentUser?.uid !== state.profile.uid) return;
  await firestoreMod.deleteDoc(firestoreMod.doc(db, 'users', state.profile.uid, 'jigsawSaves', 'active'));
}
async function hydrateActiveJigsawSave() {
  const local = readLocalActiveJigsaw();
  let cloud = null;
  if (state.profile?.uid && state.profile.provider !== 'guest') {
    try {
      const { db, firestoreMod } = await getFirebaseContext();
      const snapshot = await firestoreMod.getDoc(firestoreMod.doc(db, 'users', state.profile.uid, 'jigsawSaves', 'active'));
      if (snapshot.exists() && validActiveJigsawSave(snapshot.data())) cloud = snapshot.data();
    } catch (error) { console.error('Active Jigsaw load failed:', error); }
  }
  activeJigsawSave = !cloud || (local?.updatedAt || 0) > (cloud.updatedAt || 0) ? local : cloud;
  if (activeJigsawSave) {
    writeLocalActiveJigsaw(activeJigsawSave);
    if (activeJigsawSave === local && state.profile?.uid) saveActiveJigsawToCloud(activeJigsawSave).catch(() => {});
  }
  if (currentView === 'puzzles' && puzzleFlow.step === 'mode') renderPuzzles();
}
function clearActiveJigsawSave() {
  clearTimeout(jigsawLocalSaveTimer); clearTimeout(jigsawCloudSaveTimer);
  writeLocalActiveJigsaw(null);
  return deleteActiveJigsawFromCloud().catch((error) => console.error('Active Jigsaw delete failed:', error));
}
function scheduleActiveJigsawSave(engine, immediate = false) {
  if (!engine || engine.completed) return Promise.resolve();
  const persist = () => { const save = engine.serializeActiveSave(); writeLocalActiveJigsaw(save); return save; };
  clearTimeout(jigsawLocalSaveTimer); clearTimeout(jigsawCloudSaveTimer);
  if (immediate) { const save = persist(); return saveActiveJigsawToCloud(save).catch((e) => console.error('Active Jigsaw cloud save failed:', e)); }
  jigsawLocalSaveTimer = setTimeout(persist, 250);
  jigsawCloudSaveTimer = setTimeout(() => saveActiveJigsawToCloud(persist()).catch((e) => console.error('Active Jigsaw cloud save failed:', e)), 2000);
  return Promise.resolve();
}

async function getFirebaseContext() {
  const config = window.GG_FIREBASE_CONFIG;

  if (!config) {
    throw new Error('Firebase configuration is missing.');
  }

  if (firebaseContext) {
    return firebaseContext;
  }

  const [appMod, authMod, firestoreMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),
  ]);

  const firebaseApp = appMod.getApps().length
    ? appMod.getApps()[0]
    : appMod.initializeApp(config);

  firebaseContext = {
    authMod,
    firestoreMod,
    auth: authMod.getAuth(firebaseApp),
    db: firestoreMod.getFirestore(firebaseApp),
  };

  return firebaseContext;
}

async function syncPlayerProfileToCloud(user, providerName) {
  const { db, firestoreMod } = await getFirebaseContext();

  const userRef = firestoreMod.doc(db, 'users', user.uid);
  const existing = await firestoreMod.getDoc(userRef);

  const profileData = {
    displayName:
      user.displayName ||
      user.email ||
      `${capitalize(providerName)} Player`,
    email: user.email || null,
    photoURL: user.photoURL || null,
    provider: providerName,
    lastLoginAt: firestoreMod.serverTimestamp(),
  };

  if (existing.exists()) {
    await firestoreMod.updateDoc(userRef, profileData);
  } else {
    await firestoreMod.setDoc(userRef, {
      ...profileData,
      createdAt: firestoreMod.serverTimestamp(),
    });
  }
}
function getCloudSavePayload() {
  return {
    version: 1,
    coins: Number(state.coins || 0),
    selectedMode: GAME_MODES[state.selectedMode] ? state.selectedMode : 'swap',
    difficulty: state.difficulty || 'normal',
    completed: state.completed || {},
    purchasedPacks: Array.isArray(state.purchasedPacks)
      ? state.purchasedPacks
      : ['starter'],
    totalMoves: Number(state.totalMoves || 0),
    totalSeconds: Number(state.totalSeconds || 0),
    puzzlesCompleted: Number(state.puzzlesCompleted || 0),
    dailyChallengeStats: normalizeDailyChallengeStats(state.dailyChallengeStats),
    lifetimeStats: normalizeLifetimeStats(state.lifetimeStats),
    achievements: normalizeAchievements(state.achievements),
  };
}

async function savePlayerDataToCloud() {
  if (!state.profile?.uid || state.profile.provider === 'guest') {
    return;
  }

  const { db, firestoreMod, auth } = await getFirebaseContext();

  if (!auth.currentUser || auth.currentUser.uid !== state.profile.uid) {
    return;
  }

  const saveRef = firestoreMod.doc(
    db,
    'users',
    state.profile.uid,
    'saves',
    'main'
  );

  await firestoreMod.setDoc(
    saveRef,
    {
      ...getCloudSavePayload(),
      updatedAt: firestoreMod.serverTimestamp(),
    },
    { merge: true }
  );
}

async function loadOrCreatePlayerSave(user, providerName, localBeforeSignIn) {
  const { db, firestoreMod } = await getFirebaseContext();

  const saveRef = firestoreMod.doc(
    db,
    'users',
    user.uid,
    'saves',
    'main'
  );

  const saveSnapshot = await firestoreMod.getDoc(saveRef);

  const signedInProfile = {
    provider: providerName,
    name:
      user.displayName ||
      `${capitalize(providerName)} Player`,
    uid: user.uid,
    photoURL: user.photoURL || null,
  };

  // Existing cloud save: cloud data wins.
  if (saveSnapshot.exists()) {
    const cloud = saveSnapshot.data();

    state = {
      ...structuredClone(defaultState),
      profile: signedInProfile,
      coins: cloud.coins ?? defaultState.coins,
      selectedMode: GAME_MODES[cloud.selectedMode] ? cloud.selectedMode : 'swap',
      difficulty: cloud.difficulty ?? defaultState.difficulty,
      completed: cloud.completed || {},
      purchasedPacks: Array.isArray(cloud.purchasedPacks)
        ? cloud.purchasedPacks
        : ['starter'],
      totalMoves: cloud.totalMoves ?? 0,
      totalSeconds: cloud.totalSeconds ?? 0,
      puzzlesCompleted: cloud.puzzlesCompleted ?? 0,
      dailyChallengeStats: normalizeDailyChallengeStats(cloud.dailyChallengeStats),
      lifetimeStats: normalizeLifetimeStats(cloud.lifetimeStats),
      achievements: normalizeAchievements(cloud.achievements),
    };

    saveLocalState();
    return 'loaded';
  }

  // First login: preserve progress already earned as a guest.
  state = {
    ...structuredClone(defaultState),
    ...localBeforeSignIn,
    profile: signedInProfile,
    completed: { ...(localBeforeSignIn.completed || {}) },
    purchasedPacks: Array.isArray(localBeforeSignIn.purchasedPacks)
      ? [...localBeforeSignIn.purchasedPacks]
      : ['starter'],
    dailyChallengeStats: normalizeDailyChallengeStats(localBeforeSignIn.dailyChallengeStats),
    lifetimeStats: normalizeLifetimeStats(localBeforeSignIn.lifetimeStats),
    achievements: normalizeAchievements(localBeforeSignIn.achievements),
  };

  saveLocalState();
  await savePlayerDataToCloud();

  return 'created';
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const authScreen = $('#authScreen');
const mainScreen = $('#mainScreen');
const gameScreen = $('#gameScreen');
const jigsawPrepScreen = $('#jigsawPrepScreen');
const jigsawScreen = $('#jigsawScreen');
const viewHost = $('#viewHost');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const loaded = { ...structuredClone(defaultState), ...saved, profile: { ...defaultState.profile, ...(saved?.profile || {}) } };
    loaded.selectedMode = GAME_MODES[loaded.selectedMode] ? loaded.selectedMode : 'swap';
    loaded.dailyChallengeStats = normalizeDailyChallengeStats(saved?.dailyChallengeStats);
    loaded.lifetimeStats = normalizeLifetimeStats(saved?.lifetimeStats);
    loaded.achievements = normalizeAchievements(saved?.achievements);
    return loaded;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateWallet();
}

function saveState() {
  saveLocalState();

  if (state.profile?.uid && state.profile.provider !== 'guest') {
    savePlayerDataToCloud().catch((error) => {
      console.error('Cloud save failed:', error);
    });
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  saveState();
}

function showScreen(screen) {
  [authScreen, mainScreen, gameScreen, jigsawPrepScreen, jigsawScreen].forEach((el) => el.classList.remove('active'));
  screen.classList.add('active');
}

function enterApp() {
  showScreen(mainScreen);
  navigate('home');
}

function updateWallet() {
  $('#coinCount').textContent = Number(state.coins || 0).toLocaleString();
  const toolsBalance = $('#jigsawToolsBalance');
  if (toolsBalance) toolsBalance.textContent = Number(state.coins || 0).toLocaleString();
}

function renderJigsawToolsPanel() {
  const panel = $('#jigsawToolsPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="tools-panel-head"><h2>PUZZLE TOOLS</h2><p>Your Coins: <span id="jigsawToolsBalance">${Number(state.coins || 0).toLocaleString()}</span></p></div>
    ${Object.entries(JIGSAW_TOOLS).map(([id, tool]) => `
      <button class="tool-option" type="button" data-jigsaw-tool="${id}" aria-label="Use ${tool.label} for ${tool.cost} coins">
        <span aria-hidden="true">${tool.icon}</span><span><strong>${tool.label}</strong><small>${tool.description}</small></span><b>${tool.cost} coins</b>
      </button>`).join('')}`;
  panel.querySelectorAll('[data-jigsaw-tool]').forEach((button) => button.addEventListener('click', () => requestJigsawTool(button.dataset.jigsawTool)));
}

function setJigsawToolsPanel(open) {
  const panel = $('#jigsawToolsPanel');
  const button = $('#jigsawToolsBtn');
  if (!panel || !button) return;
  panel.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
  if (open) { renderJigsawToolsPanel(); panel.querySelector('.tool-option')?.focus(); }
}

function closeJigsawToolsPanel() {
  setJigsawToolsPanel(false);
}

function toolFailureMessage(reason) {
  const messages = {
    completed: 'Puzzle tools are unavailable after completion.',
    previewing: 'Wait for the preview to finish before using a tool.',
    hintActive: 'Select a piece or cancel the current Hint first.',
    backgroundActive: 'Background Reveal is already active.',
    noLoosePieces: 'No loose pieces are available for a Hint.',
    noEdgePieces: 'All outside-edge pieces are already placed.',
    noSingletons: 'No individual loose pieces are available to auto-place.',
  };
  return messages[reason] || 'That tool cannot be used right now.';
}

function requestJigsawTool(toolId) {
  const tool = JIGSAW_TOOLS[toolId];
  const engine = jigsawGame instanceof JigsawEngine ? jigsawGame : null;
  if (!tool || !engine || !jigsawScreen.classList.contains('active')) return;
  const unavailable = engine.toolUnavailableReason(toolId);
  if (unavailable) { closeJigsawToolsPanel(); return showToast(toolFailureMessage(unavailable)); }
  if (state.coins < tool.cost) {
    closeJigsawToolsPanel();
    return showModal('Not Enough Coins', `Need ${tool.cost} coins — you have ${state.coins}.`, [{ label: 'Got it', primary: true }], '🪙');
  }
  closeJigsawToolsPanel();
  showModal(`Use ${tool.label}?`, `Use ${tool.label} for ${tool.cost} coins?`, [
    { label: 'Cancel' },
    { label: 'Use Tool', primary: true, action: () => activateJigsawTool(toolId) },
  ], tool.icon);
}

function activateJigsawTool(toolId) {
  const tool = JIGSAW_TOOLS[toolId];
  const engine = jigsawGame instanceof JigsawEngine ? jigsawGame : null;
  if (!tool || !engine || engine.completed) return;
  const unavailable = engine.toolUnavailableReason(toolId);
  if (unavailable) return showToast(toolFailureMessage(unavailable));
  if (state.coins < tool.cost) return showModal('Not Enough Coins', `Need ${tool.cost} coins — you have ${state.coins}.`, [{ label: 'Got it', primary: true }], '🪙');
  if (toolId === 'hint') return engine.beginHintSelection();
  if (!engine.activateTool(toolId)) return;
  completeJigsawToolPurchase(engine, toolId);
}

function completeJigsawToolPurchase(engine, toolId) {
  const tool = JIGSAW_TOOLS[toolId];
  if (!tool || engine.completed || state.coins < tool.cost) return false;
  state.coins -= tool.cost;
  engine.assisted = true;
  engine.toolsUsed[tool.counter] += 1;
  engine.coinsSpentOnTools += tool.cost;
  recordLifetimeToolUse(tool.counter);
  if (engine.placed === engine.pieceCount) {
    updateWallet();
    finishJigsaw(engine);
    return true;
  }
  saveState();
  scheduleActiveJigsawSave(engine);
  updateWallet();
  return true;
}

function navigate(view) {
  if (view === 'puzzles' && currentView !== 'puzzles') puzzleFlow = { step: 'mode', puzzleId: null };
  currentView = view;
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.nav === view));
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderView() {
  if (currentView === 'home') renderHome();
  if (currentView === 'puzzles') renderPuzzles();
  if (currentView === 'shop') renderShop();
  if (currentView === 'profile') renderProfile();
  updateWallet();
}

function completionKey(mode, puzzleId, difficulty) {
  // Preserve legacy Swap keys; reserve a mode prefix for future Jigsaw clears.
  return mode === 'swap' ? `${puzzleId}:${difficulty}` : `${mode}:${puzzleId}:${difficulty}`;
}

function completionCountForPuzzle(id, mode = 'swap') {
  return Object.keys(state.completed || {}).filter((key) => mode === 'swap'
    ? key.startsWith(`${id}:`)
    : key.startsWith(`${mode}:${id}:`)).length;
}

function currentDailyChallenge(date = new Date()) {
  const selection = dailyChallengeForDate(date);
  return { ...selection, puzzle: PUZZLES.find((puzzle) => puzzle.id === selection.puzzleId), config: JIGSAW_DIFFICULTIES[selection.difficulty] };
}

function isTodaysDailyChallengeSave(save, challenge = currentDailyChallenge()) {
  return validActiveJigsawSave(save) && save.dailyChallenge?.active === true
    && save.dailyChallenge.dateKey === challenge.dateKey
    && save.puzzleId === challenge.puzzleId
    && save.difficulty === challenge.difficulty;
}

function normalizedDailyContext(context, puzzleId, difficulty, date = new Date()) {
  if (!context || typeof context.dateKey !== 'string') return null;
  const selection = dailyChallengeForDate(context.dateKey);
  const validIdentity = selection.puzzleId === puzzleId && selection.difficulty === difficulty;
  return {
    active: context.active === true && validIdentity && context.dateKey === utcDateKey(date),
    dateKey: context.dateKey,
  };
}

function recordDailyChallengeCompletion(engine, seconds, date = new Date()) {
  const today = utcDateKey(date);
  const context = normalizedDailyContext(engine.dailyChallenge, engine.puzzle.id, engine.difficulty, date);
  if (!context?.active || context.dateKey !== today) return { eligible: false, firstToday: false, bonus: 0, statsChanged: false };

  const stats = normalizeDailyChallengeStats(state.dailyChallengeStats);
  const firstToday = stats.lastCompletedDate !== today;
  let statsChanged = false;

  if (firstToday) {
    stats.currentStreak = stats.lastCompletedDate === adjacentUtcDateKey(today, -1) ? stats.currentStreak + 1 : 1;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    stats.lastCompletedDate = today;
    stats.totalCompletions += 1;
    statsChanged = true;
  }

  if (!Number.isFinite(stats.fastestSeconds) || seconds < stats.fastestSeconds) {
    stats.fastestSeconds = seconds;
    stats.fastestPuzzleId = engine.puzzle.id;
    stats.fastestDifficulty = engine.difficulty;
    statsChanged = true;
  }

  state.dailyChallengeStats = stats;
  return { eligible: true, firstToday, bonus: firstToday ? DAILY_CHALLENGE.bonusCoins : 0, statsChanged };
}

function launchDailyChallenge() {
  const challenge = currentDailyChallenge();
  if (!challenge.puzzle || !challenge.config) return showToast('Today’s Daily Challenge is unavailable');
  activeJigsawSave = readLocalActiveJigsaw();
  if (isTodaysDailyChallengeSave(activeJigsawSave, challenge)) return resumeActiveJigsaw();

  const prepare = async () => {
    state.selectedMode = 'jigsaw';
    state.difficulty = challenge.difficulty;
    saveState();
    showJigsawPreparation(challenge.puzzle, { dailyChallenge: { active: true, dateKey: challenge.dateKey } });
  };

  if (validActiveJigsawSave(activeJigsawSave)) {
    return showModal('Unfinished Jigsaw', 'Continue your saved puzzle, or replace it with today’s Daily Challenge?', [
      { label: 'Continue Existing', action: resumeActiveJigsaw },
      { label: 'Replace With Daily Challenge', primary: true, action: async () => { await clearActiveJigsawSave(); await prepare(); } },
    ], '📅');
  }
  prepare();
}

function renderHome() {
  const starterPuzzles = PUZZLES.filter((p) => p.pack === 'starter');
  const completedUnique = starterPuzzles.filter((p) => completionCountForPuzzle(p.id) > 0).length;
  const daily = currentDailyChallenge();
  const dailyStats = normalizeDailyChallengeStats(state.dailyChallengeStats);
  const completedToday = dailyStats.lastCompletedDate === daily.dateKey;
  const dailySave = readLocalActiveJigsaw();
  const continueToday = isTodaysDailyChallengeSave(dailySave, daily);
  viewHost.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">STARTER PACK · 5 PUZZLES</p>
        <h2>Make a mess.<br>Put it back together.</h2>
        <p>Pick a Gutter Grin artwork, choose your difficulty, and swap scrambled pieces until the picture is whole again.</p>
        <div class="hero-actions">
          <button class="btn primary" id="quickPlayBtn">Quick Play</button>
          <button class="btn subtle" data-go="puzzles">Choose a Mode</button>
        </div>
      </div>
    </section>

    <section class="daily-challenge-card ${completedToday ? 'completed' : ''}">
      <img src="${daily.puzzle.image}" alt="${escapeHtml(daily.puzzle.title)} Daily Challenge artwork" />
      <div class="daily-challenge-copy">
        <p class="eyebrow">DAILY CHALLENGE · ${daily.dateKey}</p>
        <h3>${escapeHtml(daily.puzzle.title)}</h3>
        <p>${daily.config.label} · ${daily.config.pieces.toLocaleString()} pieces</p>
        <strong>${completedToday ? '✓ Completed Today · Daily bonus already earned' : `Daily Bonus: +${DAILY_CHALLENGE.bonusCoins} coins`}</strong>
        <div class="daily-stats" aria-label="Daily Challenge progress">
          <span><b>${dailyStats.currentStreak}</b><small>Current Streak</small></span>
          <span><b>${dailyStats.longestStreak}</b><small>Longest Streak</small></span>
          <span><b>${dailyStats.totalCompletions}</b><small>Days Completed</small></span>
        </div>
      </div>
      <button class="btn primary" id="dailyChallengeBtn">${continueToday ? 'Continue Challenge' : completedToday ? 'Replay Challenge' : 'Start Challenge'}</button>
    </section>

    <div class="section-head">
      <div><h3>Starter Pack</h3><p>${completedUnique} of ${starterPuzzles.length} puzzles completed</p></div>
      <button class="text-btn" data-go="puzzles">See all</button>
    </div>
    <div class="puzzle-grid">${starterPuzzles.map((puzzle) => puzzleCard(puzzle, 'browse')).join('')}</div>
  `;
  bindViewEvents();
  $('#quickPlayBtn').addEventListener('click', () => {
    puzzleFlow = { step: 'mode', puzzleId: null };
    navigate('puzzles');
  });
  $('#dailyChallengeBtn').addEventListener('click', launchDailyChallenge);
}

function puzzleCard(puzzle, context = 'select') {
  const mode = context === 'browse' ? 'swap' : state.selectedMode;
  const solved = completionCountForPuzzle(puzzle.id, mode) > 0;
  return `
    <button class="puzzle-card" ${context === 'browse' ? 'data-go="puzzles"' : `data-puzzle="${puzzle.id}"`}>
      <img class="puzzle-thumb" src="${puzzle.image}" alt="${escapeHtml(puzzle.title)} puzzle artwork" loading="lazy" />
      <div class="puzzle-info">
        <strong>${escapeHtml(puzzle.title)}</strong>
        <div class="puzzle-meta">
          <span>${context === 'browse' ? 'Choose mode to play' : GAME_MODES[mode].label}</span>
          <span class="${solved ? 'complete-dot' : ''}">${solved ? '✓ Solved' : 'Play'}</span>
        </div>
      </div>
    </button>`;
}

function renderPuzzles() {
  if (puzzleFlow.step === 'mode') return renderModeSelection();
  if (puzzleFlow.step === 'puzzle') return renderPuzzleSelection();
  return renderDifficultySelection();
}

function flowHeader(kicker, title, copy, backStep) {
  return `<div class="flow-head">
    ${backStep ? `<button class="flow-back" data-flow-back="${backStep}" aria-label="Go back">← Back</button>` : '<span></span>'}
    <p class="eyebrow">${kicker}</p><h2>${title}</h2><p>${copy}</p>
  </div>`;
}

function renderModeSelection() {
  activeJigsawSave = readLocalActiveJigsaw();
  const resumedPuzzle = activeJigsawSave && PUZZLES.find((p) => p.id === activeJigsawSave.puzzleId);
  viewHost.innerHTML = `
    ${flowHeader('STEP 1 OF 4', 'Choose your mode', 'How do you want to put the chaos back together?')}
    ${resumedPuzzle ? `<section class="play-panel"><p class="eyebrow">UNFINISHED JIGSAW</p><h3>${escapeHtml(resumedPuzzle.title)}</h3><p>${JIGSAW_DIFFICULTIES[activeJigsawSave.difficulty].label} · ${activeJigsawSave.pieces.length.toLocaleString()} pieces · ${formatTime(activeJigsawSave.elapsedSeconds || 0)}</p><button class="btn primary" id="continueJigsawBtn">Continue Puzzle</button></section>` : ''}
    <div class="mode-grid">${Object.entries(GAME_MODES).map(([key, mode]) => `
      <button class="mode-card ${key}" data-mode="${key}">
        <span class="mode-icon">${mode.icon}</span><span><strong>${mode.label}</strong><small>${mode.description}</small></span><b>Choose →</b>
      </button>`).join('')}</div>
  `;
  $('#continueJigsawBtn')?.addEventListener('click', resumeActiveJigsaw);
  $$('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    state.selectedMode = button.dataset.mode;
    saveState();
    puzzleFlow = { step: 'puzzle', puzzleId: null };
    renderPuzzles();
  }));
}

function renderPuzzleSelection() {
  const ownedPacks = PACKS.filter(ownsPack);
  viewHost.innerHTML = `${flowHeader('STEP 2 OF 4', 'Choose an artwork', `${GAME_MODES[state.selectedMode].label} · ${ownedPacks.length} owned ${ownedPacks.length === 1 ? 'pack' : 'packs'}`, 'mode')}
    ${ownedPacks.map((pack) => `<div class="section-head"><div><h3>${escapeHtml(pack.title)}</h3><p>${pack.count} puzzles</p></div></div>
      <div class="puzzle-grid">${PUZZLES.filter((puzzle) => puzzle.pack === pack.id).map((puzzle) => puzzleCard(puzzle)).join('')}</div>`).join('')}`;
  bindFlowBack();
  bindViewEvents();
}

function timeBonusLabel(diff) {
  if (diff.timeBonus.type === 'sliding') return `+${diff.timeBonus.minCoins}–${diff.timeBonus.maxCoins} time bonus · ${diff.timeBonus.fastestSeconds / 60}–${diff.timeBonus.slowestSeconds / 60} min window`;
  return '+40 ≤60 min · +30 ≤120 · +20 ≤180';
}

function renderDifficultySelection() {
  const puzzle = PUZZLES.find((item) => item.id === puzzleFlow.puzzleId);
  if (!puzzle) { puzzleFlow = { step: 'puzzle', puzzleId: null }; return renderPuzzles(); }
  const difficulties = GAME_MODES[state.selectedMode].difficulties;
  viewHost.innerHTML = `${flowHeader('STEP 3 OF 4', 'Choose difficulty', `${puzzle.title} · ${GAME_MODES[state.selectedMode].label}`, 'puzzle')}
    <div class="difficulty-grid">${Object.entries(difficulties).map(([key, diff]) => `
      <button class="difficulty-card ${key === state.difficulty ? 'selected' : ''}" data-difficulty="${key}">
        <span><strong>${diff.label}</strong><small>${state.selectedMode === 'swap' ? `${diff.cols}×${diff.rows} grid` : `${diff.pieces.toLocaleString()} pieces`}</small></span>
        <span class="reward-line">+${diff.reward} base coins</span>
        ${state.selectedMode === 'jigsaw' ? `<small class="bonus-line">${timeBonusLabel(diff)}</small>` : ''}
      </button>`).join('')}</div>
    <section class="play-panel"><p class="eyebrow">STEP 4 OF 4</p><h3>Ready to panic?</h3><p>${puzzle.title} · ${difficulties[state.difficulty].label}</p><button class="btn primary xl" id="playSelectedBtn">Play ${GAME_MODES[state.selectedMode].label}</button></section>`;
  bindFlowBack();
  $$('[data-difficulty]').forEach((button) => button.addEventListener('click', () => {
    state.difficulty = button.dataset.difficulty;
    saveState();
    renderDifficultySelection();
  }));
  $('#playSelectedBtn').addEventListener('click', () => {
    if (state.selectedMode === 'jigsaw') {
      const conflicts = activeJigsawSave && (activeJigsawSave.puzzleId !== puzzle.id
        || activeJigsawSave.difficulty !== state.difficulty || activeJigsawSave.dailyChallenge?.active === true);
      if (conflicts) return showModal('Unfinished Jigsaw', 'Continue your saved puzzle, or replace it with this new one?', [
        { label: 'Continue Existing', action: resumeActiveJigsaw },
        { label: 'Replace With New', primary: true, action: async () => { await clearActiveJigsawSave(); showJigsawPreparation(puzzle); } },
      ], '🧩');
      return showJigsawPreparation(puzzle);
    }
    startGame(puzzle);
  });
}

function bindFlowBack() {
  $('[data-flow-back]')?.addEventListener('click', (event) => {
    puzzleFlow.step = event.currentTarget.dataset.flowBack;
    if (puzzleFlow.step === 'mode') puzzleFlow.puzzleId = null;
    renderPuzzles();
  });
}

function renderShop() {
  viewHost.innerHTML = `
    <div class="section-head" style="margin-top:4px">
      <div><h3>Puzzle Shop</h3><p>Unlock new five-puzzle packs with coins.</p></div>
    </div>
    <div class="shop-grid">
      ${PACKS.map((pack) => {
        const owned = ownsPack(pack);
        return `
          <article class="pack-card">
            ${pack.image ? `<img class="pack-art" src="${pack.image}" alt="" />` : `<div class="pack-art pack-placeholder">🔒</div>`}
            <div>
              <span class="badge ${owned ? 'owned' : ''}">${owned ? '✓ OWNED' : pack.available ? 'AVAILABLE' : 'COMING SOON'}</span>
              <h4>${escapeHtml(pack.title)}</h4>
              <p>${escapeHtml(pack.description)} · ${pack.count} puzzles</p>
            </div>
            <div class="pack-price">
              <strong>${pack.price === 0 ? 'FREE' : `${pack.price} 🪙`}</strong>
              ${owned
                ? `<button class="btn ghost" disabled>Owned</button>`
                : pack.available
                  ? `<button class="btn buy" data-buy-pack="${pack.id}">Buy</button>`
                  : `<button class="btn ghost" disabled>Soon</button>`}
            </div>
          </article>`;
      }).join('')}
    </div>
  `;
  $$('[data-buy-pack]').forEach((btn) => btn.addEventListener('click', () => buyPack(btn.dataset.buyPack)));
}

function buyPack(packId) {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack || !pack.available) return;
  if (state.coins < pack.price) return showModal('Not Enough Coins', `You need ${pack.price - state.coins} more coins for this pack.`, [{ label: 'Got it', primary: true }], '🪙');
  state.coins -= pack.price;
  state.purchasedPacks.push(pack.id);
  evaluateAchievements();
  saveState();
  showToast(`${pack.title} unlocked!`);
  renderShop();
}

function formatProfileDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function achievementProgressLabel(achievement) {
  const current = Math.max(0, Number(achievement.progress() || 0));
  const target = achievementTarget(achievement);
  if (achievement.unit === 'seconds') return `${formatProfileDuration(current)} / 10h`;
  if (target === 1 && !achievement.unit) return current >= target ? 'Unlocked' : 'Locked';
  return `${Math.min(current, target).toLocaleString()} / ${target.toLocaleString()}${achievement.unit ? ` ${achievement.unit}` : ''}`;
}

function renderProfile() {
  const backfilled = evaluateAchievements({ notify: false });
  if (backfilled.length) saveState();
  const profile = state.profile || defaultState.profile;
  const signedIn = profile.provider !== 'guest';
  const providerLabel = signedIn ? `Signed In · ${capitalize(profile.provider)}` : 'Guest · saved on this device';
  const lifetime = normalizeLifetimeStats(state.lifetimeStats);
  const daily = normalizeDailyChallengeStats(state.dailyChallengeStats);
  const entries = completionEntries();
  const jigsawCompletions = entries.filter(([key]) => key.startsWith('jigsaw:')).reduce((total, [, record]) => total + Number(record.clears || 0), 0);
  const swapCompletions = entries.filter(([key]) => !key.startsWith('jigsaw:')).reduce((total, [, record]) => total + Number(record.clears || 0), 0);
  const ownedPacks = PACKS.filter((pack) => pack.owned || state.purchasedPacks.includes(pack.id));
  const unlockedIds = state.achievements.unlocked;
  const unlockedCount = ACHIEVEMENTS.filter((achievement) => unlockedIds[achievement.id]).length;
  const categoryNames = { general: 'General', difficulty: 'Difficulty', daily: 'Daily', collections: 'Collections', tools: 'Tools' };
  const avatar = signedIn && profile.photoURL
    ? `<img id="profileAvatarImage" class="avatar avatar-image" src="${escapeHtml(profile.photoURL)}" alt="${escapeHtml(profile.name || 'Player')} profile photo" referrerpolicy="no-referrer" />`
    : `<div class="avatar">${escapeHtml((profile.name || 'G').slice(0, 1).toUpperCase())}</div>`;
  const fastestDaily = Number.isFinite(daily.fastestSeconds) ? formatTime(daily.fastestSeconds) : '—';

  viewHost.innerHTML = `
    <div class="section-head profile-heading"><div><h3>Player Profile</h3><p>Your private progression, statistics, and achievements.</p></div></div>
    <section class="profile-card">
      <div class="profile-row">
        ${avatar}
        <div><h3>${escapeHtml(profile.name || 'Guest Player')}</h3><p>${escapeHtml(providerLabel)}</p></div>
        <div class="profile-wallet"><span>🪙</span><strong>${Number(state.coins || 0).toLocaleString()}</strong><small>COINS</small></div>
      </div>
      <div class="profile-stat-grid">
        <div class="profile-stat"><span>🏆</span><strong>${totalPuzzleCompletions().toLocaleString()}</strong><small>Puzzles Completed</small></div>
        <div class="profile-stat"><span>🧩</span><strong>${lifetime.totalJigsawPiecesPlaced.toLocaleString()}</strong><small>Jigsaw Pieces Placed</small></div>
        <div class="profile-stat"><span>↔</span><strong>${Number(state.totalMoves || 0).toLocaleString()}</strong><small>Total Moves</small></div>
        <div class="profile-stat"><span>⏱</span><strong>${formatProfileDuration(state.totalSeconds)}</strong><small>Total Puzzle Time</small></div>
        <div class="profile-stat"><span>⇄</span><strong>${swapCompletions.toLocaleString()}</strong><small>Swap Completions</small></div>
        <div class="profile-stat"><span>🧩</span><strong>${jigsawCompletions.toLocaleString()}</strong><small>Jigsaw Completions</small></div>
        <div class="profile-stat"><span>📦</span><strong>${ownedPacks.length} / ${PACKS.filter((pack) => pack.available).length}</strong><small>Owned Packs</small></div>
        <div class="profile-stat"><span>📅</span><strong>${daily.totalCompletions.toLocaleString()}</strong><small>Daily Challenges</small></div>
        <div class="profile-stat"><span>🔥</span><strong>${daily.currentStreak.toLocaleString()}</strong><small>Current Streak</small></div>
        <div class="profile-stat"><span>🔥</span><strong>${daily.longestStreak.toLocaleString()}</strong><small>Longest Streak</small></div>
        <div class="profile-stat"><span>⚡</span><strong>${fastestDaily}</strong><small>Fastest Daily</small></div>
        <div class="profile-stat"><span>💰</span><strong>${Number(state.coins || 0).toLocaleString()}</strong><small>Current Coins</small></div>
      </div>
      <div class="owned-pack-list"><strong>Owned Packs</strong><p>${ownedPacks.map((pack) => escapeHtml(pack.title)).join(' · ')}</p></div>
      <div class="profile-actions">
        ${profile.provider === 'guest' ? `
          <button class="btn provider" id="profileGoogleBtn"><span class="provider-icon">G</span> Connect Google</button>
          <button class="btn provider" id="profileFacebookBtn"><span class="provider-icon">f</span> Connect Facebook</button>` : `
          <button class="btn subtle" id="logoutBtn">Sign Out</button>`}
        <button class="btn ghost" id="resetBtn">Reset Local Progress</button>
      </div>
    </section>

    <div class="section-head achievements-heading"><div><h3>Achievements</h3><p>Unlocked ${unlockedCount} / ${ACHIEVEMENTS.length}</p></div></div>
    <div class="achievement-groups">
      ${Object.entries(categoryNames).map(([category, label]) => `
        <section class="achievement-group"><h4>${label}</h4><div class="achievement-grid">
          ${ACHIEVEMENTS.filter((achievement) => achievement.category === category).map((achievement) => {
            const unlocked = !!unlockedIds[achievement.id];
            const current = Math.max(0, Number(achievement.progress() || 0));
            const target = achievementTarget(achievement);
            const percent = Math.max(0, Math.min(100, current / target * 100));
            return `<article class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
              <span class="achievement-icon">${achievement.icon}</span><div><h5>${escapeHtml(achievement.title)}</h5><p>${escapeHtml(achievement.description)}</p>
              <div class="achievement-progress"><span style="width:${percent}%"></span></div><small>${achievementProgressLabel(achievement)}</small></div>
            </article>`;
          }).join('')}
        </div></section>`).join('')}
    </div>
  `;
  $('#profileGoogleBtn')?.addEventListener('click', () => signInWithProvider('google'));
  $('#profileFacebookBtn')?.addEventListener('click', () => signInWithProvider('facebook'));
  $('#profileAvatarImage')?.addEventListener('error', (event) => {
    const fallback = document.createElement('div');
    fallback.className = 'avatar';
    fallback.textContent = (profile.name || 'P').slice(0, 1).toUpperCase();
    event.currentTarget.replaceWith(fallback);
  });
  $('#logoutBtn')?.addEventListener('click', async () => {
  try {
    const { auth, authMod } = await getFirebaseContext();
    await authMod.signOut(auth);
  } catch (error) {
    console.error('Firebase sign-out failed:', error);
  }

  state.profile = structuredClone(defaultState.profile);
  saveLocalState();
  renderProfile();

  showToast('Signed out · Guest mode active');
});
  $('#resetBtn').addEventListener('click', () => showModal('Reset Progress?', 'This removes coins, puzzle completions and local player progress from this device.', [
    { label: 'Cancel' },
    { label: 'Reset Everything', primary: true, action: () => { resetState(); renderProfile(); } },
  ], '↺'));
}

function bindViewEvents() {
  $$('[data-go]').forEach((el) => el.addEventListener('click', () => navigate(el.dataset.go)));
  $$('[data-puzzle]').forEach((el) => el.addEventListener('click', () => {
    const puzzle = PUZZLES.find((p) => p.id === el.dataset.puzzle);
    if (puzzle) {
      puzzleFlow = { step: 'difficulty', puzzleId: puzzle.id };
      renderPuzzles();
    }
  }));
}

function startGame(puzzle) {
  clearInterval(timerHandle);
  clearTimeout(previewHandle);
  const diff = SWAP_DIFFICULTIES[state.difficulty];
  const count = diff.cols * diff.rows;
  const pieces = Array.from({ length: count }, (_, i) => i);
  let shuffled = shuffle(pieces.slice());
  while (shuffled.every((v, i) => v === i)) shuffled = shuffle(pieces.slice());
  game = {
    puzzle,
    diff,
    board: shuffled,
    selected: null,
    moves: 0,
    seconds: 0,
    startedAt: Date.now(),
    completed: false,
  };

  $('#gameTitle').textContent = puzzle.title;
  $('#gameDifficulty').textContent = `${diff.label} · ${diff.cols}×${diff.rows}`;
  $('#moveText').textContent = '0';
  $('#timerText').textContent = '00:00';
  $('#rewardText').textContent = `+${diff.reward} 🪙`;
  $('#previewImage').src = puzzle.image;

  renderBoard();
  showScreen(gameScreen);
  timerHandle = setInterval(() => {
    if (!game || game.completed) return;
    game.seconds = Math.floor((Date.now() - game.startedAt) / 1000);
    $('#timerText').textContent = formatTime(game.seconds);
  }, 250);
}

function renderBoard() {
  if (!game) return;
  const { puzzle, diff, board, selected } = game;
  const boardEl = $('#puzzleBoard');
  boardEl.style.gridTemplateColumns = `repeat(${diff.cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${diff.rows}, 1fr)`;
  sizePuzzleBoard(boardEl, puzzle);

  boardEl.innerHTML = board.map((piece, pos) => {
    const col = piece % diff.cols;
    const row = Math.floor(piece / diff.cols);
    const x = diff.cols === 1 ? 0 : (col / (diff.cols - 1)) * 100;
    const y = diff.rows === 1 ? 0 : (row / (diff.rows - 1)) * 100;
    const selectedClass = selected === pos ? 'selected' : '';
    const correctClass = piece === pos ? 'correct' : '';
    return `<button class="tile ${selectedClass} ${correctClass}" data-pos="${pos}" aria-label="Puzzle piece ${pos + 1}" style="background-image:url('${puzzle.image}');background-size:${diff.cols * 100}% ${diff.rows * 100}%;background-position:${x}% ${y}%"></button>`;
  }).join('');

  $$('.tile').forEach((tile) => tile.addEventListener('click', () => selectTile(Number(tile.dataset.pos))));
}

function sizePuzzleBoard(boardEl, puzzle) {
  const aspect = puzzle.width / puzzle.height;
  const maxW = Math.min(window.innerWidth * 0.94, 720);
  const maxH = Math.max(260, window.innerHeight * 0.68);
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  boardEl.style.width = `${Math.floor(width)}px`;
  boardEl.style.height = `${Math.floor(height)}px`;
  boardEl.style.aspectRatio = 'auto';
}

function selectTile(pos) {
  if (!game || game.completed) return;
  if (game.selected === null) {
    game.selected = pos;
    renderBoard();
    return;
  }
  if (game.selected === pos) {
    game.selected = null;
    renderBoard();
    return;
  }
  const first = game.selected;
  [game.board[first], game.board[pos]] = [game.board[pos], game.board[first]];
  game.selected = null;
  game.moves += 1;
  $('#moveText').textContent = String(game.moves);
  renderBoard();
  if (game.board.every((v, i) => v === i)) finishGame();
}

function finishGame() {
  if (!game || game.completed) return;
  game.completed = true;
  clearInterval(timerHandle);
  game.seconds = Math.max(1, Math.floor((Date.now() - game.startedAt) / 1000));
  $('#timerText').textContent = formatTime(game.seconds);

  const key = completionKey('swap', game.puzzle.id, state.difficulty);
  const firstClear = !state.completed[key];
  const reward = firstClear ? game.diff.reward : Math.max(5, Math.round(game.diff.reward * 0.2));
  const prior = state.completed[key];
  state.completed[key] = {
    bestSeconds: prior ? Math.min(prior.bestSeconds, game.seconds) : game.seconds,
    bestMoves: prior ? Math.min(prior.bestMoves, game.moves) : game.moves,
    clears: (prior?.clears || 0) + 1,
  };
  state.coins += reward;
  state.totalMoves = (state.totalMoves || 0) + game.moves;
  state.totalSeconds = (state.totalSeconds || 0) + game.seconds;
  state.puzzlesCompleted = (state.puzzlesCompleted || 0) + 1;
  evaluateAchievements();
  saveState();

  showModal(
    'Puzzle Complete!',
    `${formatTime(game.seconds)} · ${game.moves} moves · ${firstClear ? 'First-clear bonus' : 'Replay reward'}: +${reward} coins`,
    [
      { label: 'Back to Puzzles', action: () => { showScreen(mainScreen); puzzleFlow = { step: 'puzzle', puzzleId: null }; currentView = 'puzzles'; renderView(); } },
      { label: 'Play Again', primary: true, action: () => startGame(game.puzzle) },
    ],
    '✓'
  );
}

function previewPuzzle() {
  if (!game) return;
  const img = $('#previewImage');
  img.classList.add('show');
  clearTimeout(previewHandle);
  previewHandle = setTimeout(() => img.classList.remove('show'), 1800);
}

function reshuffle() {
  if (!game || game.completed) return;
  game.board = shuffle(game.board.slice());
  game.selected = null;
  game.moves += 1;
  $('#moveText').textContent = String(game.moves);
  renderBoard();
}

function showJigsawPreparation(puzzle, options = {}) {
  clearInterval(timerHandle);
  const difficulty = JIGSAW_DIFFICULTIES[state.difficulty] ? state.difficulty : 'easy';
  const config = JIGSAW_DIFFICULTIES[difficulty];
  const dailyChallenge = normalizedDailyContext(options.dailyChallenge, puzzle.id, difficulty);
  jigsawGame = { puzzle, difficulty, started: false, dailyChallenge };
  $('#jigsawPrepTitle').textContent = puzzle.title;
  $('#jigsawPrepMode').textContent = dailyChallenge?.active ? `DAILY CHALLENGE · ${config.label.toUpperCase()}` : `CLASSIC JIGSAW · ${config.label.toUpperCase()}`;
  $('#jigsawPrepPieces').textContent = config.pieces.toLocaleString();
  $('#jigsawPrepReward').textContent = `+${config.reward}`;
  if (config.timeBonus.type === 'tiers') {
    $('#jigsawPrepBonus').textContent = '+0–40';
    $('#jigsawPrepBonusCopy').textContent = 'Earn +40 within 60 minutes, +30 within 120, or +20 within 180.';
  } else if (difficulty === 'hard') {
    $('#jigsawPrepBonus').textContent = '+10–20';
    $('#jigsawPrepBonusCopy').textContent = 'Finish within 45 minutes for +20 bonus coins. The bonus slides down to +10 at 60 minutes.';
  } else {
    $('#jigsawPrepBonus').textContent = `+${config.timeBonus.minCoins}–${config.timeBonus.maxCoins}`;
    $('#jigsawPrepBonusCopy').textContent = difficulty === 'easy'
      ? 'Finish within 5 minutes for +5 bonus coins. The bonus slides down to +1 coin at 15 minutes.'
      : 'Finish within 15 minutes for +10 bonus coins. The bonus slides down to +5 coins at 30 minutes.';
  }
  $('#jigsawPrepImage').src = puzzle.image;
  $('#jigsawPrepImage').alt = `${puzzle.title} completed artwork`;
  $('#jigsawDailyPrepBonus').hidden = !dailyChallenge?.active;
  $('#jigsawDailyPrepBonus').textContent = `📅 Daily Challenge Bonus: +${DAILY_CHALLENGE.bonusCoins} coins`;
  $('#prepCoinCount').textContent = Number(state.coins || 0).toLocaleString();
  showScreen(jigsawPrepScreen);
}

async function startJigsaw(resumeSave = null) {
  resumeSave = validActiveJigsawSave(resumeSave) ? resumeSave : null;
  const puzzle = jigsawGame?.puzzle;
  const difficulty = jigsawGame?.difficulty || 'easy';
  if (!puzzle) return;
  const image = new Image();
  image.src = puzzle.image;
  try { await image.decode(); } catch { /* The load event fallback below still validates dimensions. */ }
  if (!image.complete || !image.naturalWidth) {
    return showModal('Artwork Could Not Load', 'Please check your connection and try starting this puzzle again.', [{ label: 'Back', primary: true }], '!');
  }
  const startButton = $('#startJigsawBtn');
  startButton.disabled = true; startButton.textContent = resumeSave ? 'Restoring Puzzle…' : 'Preparing Puzzle…';
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  jigsawGame = new JigsawEngine($('#jigsawCanvas'), puzzle, image, difficulty, {
    seed: resumeSave?.seed,
    resumeSave,
    dailyChallenge: resumeSave?.dailyChallenge || jigsawGame?.dailyChallenge,
  });
  $('#jigsawTitle').textContent = puzzle.title;
  $('#jigsawTimerText').textContent = '00:00';
  $('#jigsawDifficultyText').textContent = `${jigsawGame.config.label} · ${jigsawGame.pieceCount.toLocaleString()} pieces`;
  $('#jigsawPlacedText').textContent = `0 / ${jigsawGame.pieceCount.toLocaleString()}`;
  $('#jigsawMoveText').textContent = '0';
  closeJigsawToolsPanel();
  $('#jigsawToolsBtn').disabled = false;
  $('#jigsawToolStatus').hidden = true;
  jigsawScreen.classList.remove('hint-selecting');
  showScreen(jigsawScreen);
  jigsawGame.start();
  startButton.disabled = false; startButton.textContent = 'Start Puzzle';
}

async function resumeActiveJigsaw() {
  const save = activeJigsawSave || readLocalActiveJigsaw();
  const puzzle = save && PUZZLES.find((p) => p.id === save.puzzleId);
  if (!puzzle || !validActiveJigsawSave(save)) return showToast('Saved Jigsaw is unavailable');
  state.selectedMode = 'jigsaw'; state.difficulty = save.difficulty; saveLocalState();
  jigsawGame = { puzzle, difficulty: save.difficulty, started: false, dailyChallenge: normalizedDailyContext(save.dailyChallenge, save.puzzleId, save.difficulty) };
  await startJigsaw(save);
}

function jigsawTimeBonus(difficulty, seconds) {
  const bonus = JIGSAW_DIFFICULTIES[difficulty].timeBonus;
  if (bonus.type === 'tiers') return bonus.tiers.find((tier) => tier.maxSeconds === null || seconds <= tier.maxSeconds).coins;
  if (seconds <= bonus.fastestSeconds) return bonus.maxCoins;
  if (seconds > bonus.slowestSeconds) return 0;
  return Math.max(bonus.minCoins, Math.min(bonus.maxCoins, Math.ceil(bonus.minCoins + (bonus.maxCoins - bonus.minCoins) * (bonus.slowestSeconds - seconds) / (bonus.slowestSeconds - bonus.fastestSeconds))));
}

function finishJigsaw(engine) {
  if (jigsawGame !== engine || engine.completed) return;
  engine.completed = true;
  closeJigsawToolsPanel();
  $('#jigsawToolsBtn').disabled = true;
  engine.stopTimer();
  engine.renderCompleted();
  const seconds = engine.seconds;
  const baseReward = engine.config.reward;
  const timeBonus = jigsawTimeBonus(engine.difficulty, seconds);
  const dailyResult = recordDailyChallengeCompletion(engine, seconds);
  const reward = baseReward + timeBonus + dailyResult.bonus;
  const key = completionKey('jigsaw', engine.puzzle.id, engine.difficulty);
  const prior = state.completed[key];
  state.completed[key] = {
    bestSeconds: Number.isFinite(prior?.bestSeconds) ? Math.min(prior.bestSeconds, seconds) : seconds,
    bestMoves: Number.isFinite(prior?.bestMoves) ? Math.min(prior.bestMoves, engine.moves) : engine.moves,
    clears: (prior?.clears || 0) + 1,
    assisted: engine.assisted,
    toolsUsed: { ...engine.toolsUsed },
    coinsSpentOnTools: engine.coinsSpentOnTools,
  };
  state.coins += reward;
  state.totalMoves = (state.totalMoves || 0) + engine.moves;
  state.totalSeconds = (state.totalSeconds || 0) + seconds;
  state.puzzlesCompleted = (state.puzzlesCompleted || 0) + 1;
  evaluateAchievements();
  saveState();
  clearActiveJigsawSave();
  setTimeout(() => showModal(
    dailyResult.eligible ? 'Daily Challenge Complete!' : 'Jigsaw Complete!',
    dailyResult.eligible
      ? `${formatTime(seconds)} · ${engine.moves} moves\nBase Reward       +${baseReward}\nTime Bonus        +${timeBonus}\nDaily Bonus       ${dailyResult.bonus ? `+${dailyResult.bonus}` : 'Already claimed'}\nTotal             +${reward}\n\n🔥 Daily Streak: ${state.dailyChallengeStats.currentStreak}`
      : `${formatTime(seconds)} · ${engine.moves} moves\nBase reward: +${baseReward} · Time bonus: +${timeBonus} · Total earned: +${reward} coins`,
    [
      { label: dailyResult.eligible ? 'Back Home' : 'Back to Puzzles', action: dailyResult.eligible ? returnFromDailyChallenge : returnFromJigsaw },
      { label: 'Play Again', primary: true, action: () => {
        state.difficulty = engine.difficulty;
        showJigsawPreparation(engine.puzzle, { dailyChallenge: engine.dailyChallenge });
      } },
    ],
    '✓'
  ), 350);
}

function returnFromDailyChallenge() {
  jigsawGame?.destroy?.();
  jigsawGame = null;
  showScreen(mainScreen);
  currentView = 'home';
  renderView();
}

function returnFromJigsaw() {
  jigsawGame?.destroy?.();
  jigsawGame = null;
  showScreen(mainScreen);
  puzzleFlow = { step: 'puzzle', puzzleId: null };
  currentView = 'puzzles';
  renderView();
}

class JigsawEngine {
  static EASY_ROW_COUNTS = [7, 6, 7, 6, 7, 6, 7, 6];
  static MIN_ZOOM = .2;
  static MAX_ZOOM = 3;

  constructor(canvas, puzzle, image, difficulty = 'easy', options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.puzzle = puzzle;
    this.image = image;
    this.difficulty = JIGSAW_DIFFICULTIES[difficulty] ? difficulty : 'easy';
    this.config = JIGSAW_DIFFICULTIES[this.difficulty];
    this.pieceCount = this.config.pieces;
    const worlds = { easy: [1400, 900], normal: [2400, 1600], hard: [3600, 2400], insane: [5200, 3400] };
    [this.worldWidth, this.worldHeight] = options.resumeSave?.world || worlds[this.difficulty];
    this.seed = Number.isInteger(options.seed) ? options.seed : this.createSeed();
    this.randomState = this.seed >>> 0;
    this.resumeSave = options.resumeSave || null;
    this.dailyChallenge = normalizedDailyContext(options.resumeSave?.dailyChallenge || options.dailyChallenge, puzzle.id, this.difficulty);
    this.pieces = [];
    this.groups = new Map();
    this.neighbors = [];
    this.drawOrder = [];
    this.drag = null;
    this.moves = 0;
    this.placed = 0;
    this.seconds = 0;
    this.elapsedBase = 0;
    this.startedAt = 0;
    this.completed = false;
    this.previewing = false;
    this.assisted = false;
    this.toolsUsed = { hints: 0, backgroundReveals: 0, edgeFinders: 0, autoPlaces: 0 };
    this.coinsSpentOnTools = 0;
    this.hintSelectionActive = false;
    this.hintTarget = null;
    this.backgroundRevealUntil = 0;
    this.edgeFinderUntil = 0;
    this.autoPlacePulse = null;
    this.effectTimers = new Set();
    this.framePending = false;
    this.camera = { x: this.worldWidth / 2, y: this.worldHeight / 2, zoom: 1 };
    this.metrics = { geometryMs: 0, setupMs: 0, firstRenderMs: null };
    this.activePointers = new Map();
    this.pan = null;
    this.pinch = null;
    this.spacePressed = false;
    this.spatialCellSize = this.pieceCount >= 500 ? 140 : 0;
    this.spatialIndex = new Map();
    this.resizeObserver = new ResizeObserver(() => { this.resizeCanvas(); this.requestRender(); });
    this.onPointerDown = (event) => this.pointerDown(event);
    this.onPointerMove = (event) => this.pointerMove(event);
    this.onPointerUp = (event) => this.pointerUp(event);
    this.onWheel = (event) => this.wheel(event);
    this.onKeyDown = (event) => { if (event.code === 'Space') { this.spacePressed = true; event.preventDefault(); } };
    this.onKeyUp = (event) => { if (event.code === 'Space') this.spacePressed = false; };
  }

  createSeed() {
    if (globalThis.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] | 0;
    return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) | 0;
  }

  random() {
    this.randomState = (this.randomState + 0x6D2B79F5) | 0;
    let value = this.randomState;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }

  start() {
    const setupStarted = performance.now();
    this.configureBoard();
    const geometryStarted = performance.now();
    this.createPieces();
    this.metrics.geometryMs = performance.now() - geometryStarted;
    if (this.resumeSave) this.restoreActiveSave(this.resumeSave); else this.scatterPieces();
    this.rebuildSpatialIndex();
    this.metrics.setupMs = performance.now() - setupStarted;
    this.bindEvents();
    this.resizeCanvas();
    if (!this.resumeSave) this.applyDefaultWorkingView(false);
    this.startedAt = Date.now();
    this.firstRenderStartedAt = performance.now();
    this.timer = setInterval(() => {
      if (this.completed) return;
      this.seconds = this.elapsedBase + Math.floor((Date.now() - this.startedAt) / 1000);
      $('#jigsawTimerText').textContent = formatTime(this.seconds);
    }, 250);
    this.requestRender();
    if (!this.resumeSave) scheduleActiveJigsawSave(this, true);
    this.checkpointTimer = setInterval(() => scheduleActiveJigsawSave(this), 30000);
  }

  configureBoard() {
    const aspect = this.puzzle.width / this.puzzle.height;
    const maxWidths = { easy: 760, normal: 1260, hard: 1750, insane: 2400 };
    const maxHeights = { easy: 620, normal: 1100, hard: 1500, insane: 2000 };
    let width = maxWidths[this.difficulty];
    let height = width / aspect;
    const maxHeight = maxHeights[this.difficulty];
    if (height > maxHeight) { height = maxHeight; width = height * aspect; }
    this.board = { x: (this.worldWidth - width) / 2, y: (this.worldHeight - height) / 2, width, height };
    if (this.difficulty !== 'easy') {
      const grids = { normal: [[18, 14], [14, 18]], hard: [[25, 20], [20, 25]], insane: [[40, 25], [25, 40]] };
      const candidates = grids[this.difficulty].map(([cols, rows]) => ({ cols, rows }));
      this.topology = candidates.reduce((best, candidate) => {
        const pieceAspect = aspect * candidate.rows / candidate.cols;
        const error = Math.abs(Math.log(pieceAspect));
        return !best || error < best.error ? { ...candidate, error } : best;
      }, null);
      this.rows = this.topology.rows;
      this.cols = this.topology.cols;
    } else {
      this.rows = JigsawEngine.EASY_ROW_COUNTS.length;
      this.cols = null;
      this.topology = { rowCounts: [...JigsawEngine.EASY_ROW_COUNTS] };
    }
    this.pieceHeight = height / this.rows;
  }

  createPieces() {
    this.pieces = [];
    if (this.difficulty !== 'easy') this.createRegularPieces();
    else this.createEasyPieces();
    if (this.pieces.length !== this.pieceCount) throw new Error(`${this.config.label} Jigsaw must contain exactly ${this.pieceCount} pieces.`);
    this.initializeGroupsAndNeighbors();
  }

  finishPieceRecord(piece) {
    piece.path = this.difficulty !== 'easy' ? this.makeRegularPiecePath(piece) : this.makePiecePath(piece);
    piece.visualBounds = this.difficulty !== 'easy' ? this.calculateRegularVisualBounds(piece) : this.calculateVisualBounds(piece);
    piece.snapTolerance = Math.min(
      piece.visualBounds.maxX - piece.visualBounds.minX,
      piece.visualBounds.maxY - piece.visualBounds.minY
    ) * .42;
    this.pieces.push(piece);
  }

  createEasyPieces() {
    // Alternating full-width rows create 7+6+7+6+7+6+7+6 = exactly 52.
    // Each shared horizontal boundary is one continuous cached contour, so
    // differently spaced vertical seams never create gaps or overlaps.
    this.horizontalContours = Array.from({ length: this.rows - 1 }, (_, boundary) => ({
      signs: Array.from({ length: 7 }, (__, segment) => ((boundary + segment) % 2 ? -1 : 1) * (this.random() < .72 ? 1 : -1)),
      depths: Array.from({ length: 7 }, (__, segment) => this.pieceHeight * (0.14 + ((boundary + segment) % 3) * 0.018)),
    }));
    const vertical = this.topology.rowCounts.map((count) =>
      Array.from({ length: count - 1 }, () => this.random() < .5 ? -1 : 1));
    let id = 0;
    for (let row = 0; row < this.rows; row += 1) {
      const count = this.topology.rowCounts[row];
      const width = this.board.width / count;
      for (let col = 0; col < count; col += 1) {
        const targetX = this.board.x + col * width;
        const targetY = this.board.y + row * this.pieceHeight;
        const edges = {
          right: col === count - 1 ? 0 : vertical[row][col],
          left: col === 0 ? 0 : -vertical[row][col - 1],
        };
        const tabDepth = Math.min(width, this.pieceHeight) * (0.17 + ((id % 3) * 0.018));
        const piece = { id, row, col, targetX, targetY, width, tabDepth, x: 0, y: 0, edges, placed: false, groupId: id,
          isExterior: row === 0 || row === this.rows - 1 || col === 0 || col === count - 1 };
        this.finishPieceRecord(piece);
        id += 1;
      }
    }
  }

  createRegularPieces() {
    const width = this.board.width / this.cols;
    const vertical = Array.from({ length: this.rows }, () => Array.from({ length: this.cols - 1 }, () => this.random() < .5 ? -1 : 1));
    const horizontal = Array.from({ length: this.rows - 1 }, () => Array.from({ length: this.cols }, () => this.random() < .5 ? -1 : 1));
    let id = 0;
    for (let row = 0; row < this.rows; row += 1) for (let col = 0; col < this.cols; col += 1) {
      const tabDepth = Math.min(width, this.pieceHeight) * (0.17 + ((id % 3) * .018));
      const piece = {
        id, row, col, width, tabDepth,
        targetX: this.board.x + col * width,
        targetY: this.board.y + row * this.pieceHeight,
        x: 0, y: 0, placed: false, groupId: id,
        isExterior: row === 0 || row === this.rows - 1 || col === 0 || col === this.cols - 1,
        edges: {
          top: row === 0 ? 0 : -horizontal[row - 1][col],
          right: col === this.cols - 1 ? 0 : vertical[row][col],
          bottom: row === this.rows - 1 ? 0 : horizontal[row][col],
          left: col === 0 ? 0 : -vertical[row][col - 1],
        },
      };
      this.finishPieceRecord(piece);
      id += 1;
    }
  }

  initializeGroupsAndNeighbors() {
    this.groups.clear();
    this.neighbors = this.pieces.map(() => new Set());
    this.pieces.forEach((piece) => this.groups.set(piece.id, new Set([piece.id])));
    const connect = (a, b) => { this.neighbors[a.id].add(b.id); this.neighbors[b.id].add(a.id); };
    const rows = Array.from({ length: this.rows }, (_, row) => this.pieces.filter((piece) => piece.row === row));
    rows.forEach((rowPieces) => {
      for (let index = 0; index < rowPieces.length - 1; index += 1) connect(rowPieces[index], rowPieces[index + 1]);
    });
    for (let row = 0; row < this.rows - 1; row += 1) {
      if (this.difficulty !== 'easy') {
        for (let col = 0; col < this.cols; col += 1) connect(rows[row][col], rows[row + 1][col]);
      } else {
        rows[row].forEach((upper) => rows[row + 1].forEach((lower) => {
          const sharedWidth = Math.min(upper.targetX + upper.width, lower.targetX + lower.width) - Math.max(upper.targetX, lower.targetX);
          if (sharedWidth > .001) connect(upper, lower);
        }));
      }
    }
  }

  makePiecePath(piece) {
    const path = new Path2D();
    const x = piece.targetX, w = piece.width, h = this.pieceHeight;
    const depth = piece.tabDepth;
    path.moveTo(x, this.horizontalBoundaryY(piece.row - 1, x));
    this.addHorizontalBoundary(path, piece.row - 1, x, x + w);
    this.addEdge(path, x + w, this.horizontalBoundaryY(piece.row - 1, x + w), x + w, this.horizontalBoundaryY(piece.row, x + w), 1, 0, piece.edges.right, depth);
    this.addHorizontalBoundary(path, piece.row, x + w, x);
    this.addEdge(path, x, this.horizontalBoundaryY(piece.row, x), x, this.horizontalBoundaryY(piece.row - 1, x), -1, 0, piece.edges.left, depth);
    path.closePath();
    return path;
  }

  makeRegularPiecePath(piece) {
    const path = new Path2D();
    const x = piece.targetX, y = piece.targetY, w = piece.width, h = this.pieceHeight, depth = piece.tabDepth;
    path.moveTo(x, y);
    this.addEdge(path, x, y, x + w, y, 0, -1, piece.edges.top, depth);
    this.addEdge(path, x + w, y, x + w, y + h, 1, 0, piece.edges.right, depth);
    this.addEdge(path, x + w, y + h, x, y + h, 0, 1, piece.edges.bottom, depth);
    this.addEdge(path, x, y + h, x, y, -1, 0, piece.edges.left, depth);
    path.closePath();
    return path;
  }

  calculateRegularVisualBounds(piece) {
    return {
      minX: piece.edges.left === 1 ? -piece.tabDepth : 0,
      maxX: piece.width + (piece.edges.right === 1 ? piece.tabDepth : 0),
      minY: piece.edges.top === 1 ? -piece.tabDepth : 0,
      maxY: this.pieceHeight + (piece.edges.bottom === 1 ? piece.tabDepth : 0),
    };
  }

  calculateVisualBounds(piece) {
    let minY = piece.targetY;
    let maxY = piece.targetY + this.pieceHeight;
    const segmentWidth = this.board.width / 7;
    const sampleXs = [piece.targetX, piece.targetX + piece.width];
    for (let segment = 0; segment < 7; segment += 1) {
      const peakX = this.board.x + (segment + .5) * segmentWidth;
      if (peakX > piece.targetX && peakX < piece.targetX + piece.width) sampleXs.push(peakX);
    }
    sampleXs.forEach((x) => {
      minY = Math.min(minY, this.horizontalBoundaryY(piece.row - 1, x), this.horizontalBoundaryY(piece.row, x));
      maxY = Math.max(maxY, this.horizontalBoundaryY(piece.row - 1, x), this.horizontalBoundaryY(piece.row, x));
    });
    return {
      minX: piece.edges.left === 1 ? -piece.tabDepth : 0,
      maxX: piece.width + (piece.edges.right === 1 ? piece.tabDepth : 0),
      minY: minY - piece.targetY,
      maxY: maxY - piece.targetY,
    };
  }

  clampPiecePosition(piece, x, y, margin = 8) {
    const bounds = piece.visualBounds;
    return {
      x: Math.max(margin - bounds.minX, Math.min(this.worldWidth - margin - bounds.maxX, x)),
      y: Math.max(margin - bounds.minY, Math.min(this.worldHeight - margin - bounds.maxY, y)),
    };
  }

  groupMembers(groupId) {
    return [...(this.groups.get(groupId) || [])].map((id) => this.pieces[id]);
  }

  pieceWorldBounds(piece) {
    return {
      minX: piece.x + piece.visualBounds.minX,
      maxX: piece.x + piece.visualBounds.maxX,
      minY: piece.y + piece.visualBounds.minY,
      maxY: piece.y + piece.visualBounds.maxY,
    };
  }

  visibleWorldBounds(padding = 0) {
    const halfWidth = this.worldWidth / (2 * this.camera.zoom);
    const halfHeight = this.worldHeight / (2 * this.camera.zoom);
    return {
      minX: this.camera.x - halfWidth - padding,
      maxX: this.camera.x + halfWidth + padding,
      minY: this.camera.y - halfHeight - padding,
      maxY: this.camera.y + halfHeight + padding,
    };
  }

  groupBounds(groupId, positions = null) {
    const members = this.groupMembers(groupId);
    return members.reduce((bounds, piece) => {
      const position = positions?.get(piece.id) || piece;
      return {
        minX: Math.min(bounds.minX, position.x + piece.visualBounds.minX),
        maxX: Math.max(bounds.maxX, position.x + piece.visualBounds.maxX),
        minY: Math.min(bounds.minY, position.y + piece.visualBounds.minY),
        maxY: Math.max(bounds.maxY, position.y + piece.visualBounds.maxY),
      };
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  }

  clampGroupTranslation(groupId, dx, dy, positions = null, margin = 8) {
    const bounds = this.groupBounds(groupId, positions);
    return {
      dx: Math.max(margin - bounds.minX, Math.min(this.worldWidth - margin - bounds.maxX, dx)),
      dy: Math.max(margin - bounds.minY, Math.min(this.worldHeight - margin - bounds.maxY, dy)),
    };
  }

  translateGroup(groupId, dx, dy) {
    this.groupMembers(groupId).forEach((piece) => { piece.x += dx; piece.y += dy; });
  }

  bringGroupToFront(groupId) {
    const ids = this.groups.get(groupId) || new Set();
    this.drawOrder = [...this.drawOrder.filter((id) => !ids.has(id)), ...this.drawOrder.filter((id) => ids.has(id))];
  }

  horizontalBoundaryY(boundary, x) {
    const baseY = this.board.y + (boundary + 1) * this.pieceHeight;
    if (boundary < 0 || boundary >= this.rows - 1) return baseY;
    const local = Math.max(0, Math.min(this.board.width, x - this.board.x));
    const segmentWidth = this.board.width / 7;
    const segment = Math.min(6, Math.floor(local / segmentWidth));
    const progress = (local - segment * segmentWidth) / segmentWidth;
    const contour = this.horizontalContours[boundary];
    const tabProgress = Math.max(0, Math.min(1, (progress - .27) / .46));
    const tabProfile = progress < .27 || progress > .73 ? 0 : Math.sin(Math.PI * tabProgress) ** 2;
    return baseY + contour.signs[segment] * contour.depths[segment] * tabProfile;
  }

  addHorizontalBoundary(path, boundary, fromX, toX) {
    const steps = Math.max(12, Math.ceil(Math.abs(toX - fromX) / 7));
    for (let step = 1; step <= steps; step += 1) {
      const x = fromX + (toX - fromX) * (step / steps);
      path.lineTo(x, this.horizontalBoundaryY(boundary, x));
    }
  }

  addEdge(path, x1, y1, x2, y2, nx, ny, edge, depth) {
    if (!edge) { path.lineTo(x2, y2); return; }
    const dx = x2 - x1, dy = y2 - y1, bump = depth * edge;
    const point = (t, normal = 0) => [x1 + dx * t + nx * normal, y1 + dy * t + ny * normal];
    path.lineTo(...point(.34));
    path.bezierCurveTo(...point(.38), ...point(.37, bump), ...point(.46, bump));
    path.bezierCurveTo(...point(.54, bump), ...point(.62, bump), ...point(.66));
    path.lineTo(x2, y2);
  }

  scatterPieces(pieces = this.pieces) {
    const margin = 24;
    const gap = 24;
    const zones = [
      { x: margin, y: margin, width: this.board.x - gap - margin, height: this.worldHeight - margin * 2 },
      { x: this.board.x + this.board.width + gap, y: margin, width: this.worldWidth - (this.board.x + this.board.width + gap) - margin, height: this.worldHeight - margin * 2 },
      { x: this.board.x, y: margin, width: this.board.width, height: this.board.y - gap - margin },
      { x: this.board.x, y: this.board.y + this.board.height + gap, width: this.board.width, height: this.worldHeight - (this.board.y + this.board.height + gap) - margin },
    ].filter((zone) => zone.width > 50 && zone.height > 50);
    const centers = [];
    shuffle(pieces.slice()).forEach((piece, index) => {
      let candidate = null;
      for (let attempt = 0; attempt < 70; attempt += 1) {
        const zone = zones[(index + Math.floor(Math.random() * zones.length)) % zones.length];
        const maxX = Math.max(zone.x, zone.x + zone.width - piece.width);
        const maxY = Math.max(zone.y, zone.y + zone.height - this.pieceHeight);
        const x = zone.x + Math.random() * (maxX - zone.x);
        const y = zone.y + Math.random() * (maxY - zone.y);
        const center = { x: x + piece.width / 2, y: y + this.pieceHeight / 2 };
        candidate = { x, y, center };
        if (centers.slice(-80).every((prior) => Math.hypot(center.x - prior.x, center.y - prior.y) > Math.min(piece.width, this.pieceHeight) * .48)) break;
      }
      const position = this.clampPiecePosition(piece, candidate.x, candidate.y, margin);
      piece.x = position.x;
      piece.y = position.y;
      centers.push(candidate.center);
    });
    if (pieces.length === this.pieces.length) {
      this.drawOrder = shuffle(this.pieces.map((piece) => piece.id));
    }
  }

  serializeActiveSave() {
    const elapsedSeconds = this.elapsedBase + Math.floor((Date.now() - this.startedAt) / 1000);
    return {
      v: 1, mode: 'jigsaw', puzzleId: this.puzzle.id, difficulty: this.difficulty,
      seed: this.seed, elapsedSeconds, moves: this.moves, placed: this.placed,
      assisted: this.assisted,
      toolsUsed: { ...this.toolsUsed },
      coinsSpentOnTools: this.coinsSpentOnTools,
      dailyChallenge: this.dailyChallenge ? { ...this.dailyChallenge } : undefined,
      world: [this.worldWidth, this.worldHeight],
      camera: [this.camera.x, this.camera.y, this.camera.zoom],
      drawOrder: [...this.drawOrder],
      pieces: this.pieces.map((piece) => [Math.round(piece.x * 100) / 100, Math.round(piece.y * 100) / 100, piece.groupId, piece.placed ? 1 : 0]),
      updatedAt: Date.now(),
    };
  }

  restoreActiveSave(save) {
    this.groups.clear();
    save.pieces.forEach((record, id) => {
      const piece = this.pieces[id];
      [piece.x, piece.y, piece.groupId] = record;
      piece.placed = !!record[3];
      if (!this.groups.has(piece.groupId)) this.groups.set(piece.groupId, new Set());
      this.groups.get(piece.groupId).add(id);
    });
    this.drawOrder = save.drawOrder.length === this.pieceCount ? [...save.drawOrder] : this.pieces.map((piece) => piece.id);
    this.camera = { x: save.camera[0], y: save.camera[1], zoom: save.camera[2] };
    this.moves = Number(save.moves || 0);
    this.placed = this.pieces.filter((piece) => piece.placed).length;
    this.assisted = !!save.assisted;
    Object.keys(this.toolsUsed).forEach((key) => { this.toolsUsed[key] = Math.max(0, Number(save.toolsUsed?.[key] || 0)); });
    this.coinsSpentOnTools = Math.max(0, Number(save.coinsSpentOnTools || 0));
    this.elapsedBase = Number(save.elapsedSeconds || 0);
    this.seconds = this.elapsedBase;
    $('#jigsawTimerText').textContent = formatTime(this.seconds);
    $('#jigsawPlacedText').textContent = `${this.placed.toLocaleString()} / ${this.pieceCount.toLocaleString()}`;
    $('#jigsawMoveText').textContent = String(this.moves);
  }

  rebuildSpatialIndex() {
    if (!this.spatialCellSize) return;
    this.spatialIndex.clear();
    this.pieces.forEach((piece) => {
      if (piece.placed) return;
      const bounds = this.pieceWorldBounds(piece);
      for (let x = Math.floor(bounds.minX / this.spatialCellSize); x <= Math.floor(bounds.maxX / this.spatialCellSize); x += 1) {
        for (let y = Math.floor(bounds.minY / this.spatialCellSize); y <= Math.floor(bounds.maxY / this.spatialCellSize); y += 1) {
          const key = `${x}:${y}`;
          if (!this.spatialIndex.has(key)) this.spatialIndex.set(key, new Set());
          this.spatialIndex.get(key).add(piece.id);
        }
      }
    });
  }

  hitTestOrder(point) {
    if (!this.spatialCellSize) return this.drawOrder;
    const ids = this.spatialIndex.get(`${Math.floor(point.x / this.spatialCellSize)}:${Math.floor(point.y / this.spatialCellSize)}`) || new Set();
    return this.drawOrder.filter((id) => ids.has(id));
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('keydown', this.onKeyDown);
    this.canvas.addEventListener('keyup', this.onKeyUp);
    this.resizeObserver.observe(this.canvas);
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const cssAspect = this.worldWidth / this.worldHeight;
    let width = rect.width, height = width / cssAspect;
    if (height > rect.height) { height = rect.height; width = height * cssAspect; }
    this.canvas.style.width = `${Math.floor(width)}px`;
    this.canvas.style.height = `${Math.floor(height)}px`;
    this.canvas.width = Math.max(1, Math.floor(width * ratio));
    this.canvas.height = Math.max(1, Math.floor(height * ratio));
    this.scaleX = width / this.worldWidth;
    this.scaleY = height / this.worldHeight;
    this.pixelRatio = ratio;
  }

  canvasScreenPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / this.scaleX, y: (event.clientY - rect.top) / this.scaleY };
  }

  worldToScreen(point) {
    return {
      x: (point.x - this.camera.x) * this.camera.zoom + this.worldWidth / 2,
      y: (point.y - this.camera.y) * this.camera.zoom + this.worldHeight / 2,
    };
  }

  screenToWorld(point) {
    return {
      x: this.camera.x + (point.x - this.worldWidth / 2) / this.camera.zoom,
      y: this.camera.y + (point.y - this.worldHeight / 2) / this.camera.zoom,
    };
  }

  canvasPoint(event) {
    return this.screenToWorld(this.canvasScreenPoint(event));
  }

  constrainCamera() {
    const overscroll = 160;
    const halfWidth = this.worldWidth / (2 * this.camera.zoom);
    const halfHeight = this.worldHeight / (2 * this.camera.zoom);
    const minX = -overscroll + halfWidth, maxX = this.worldWidth + overscroll - halfWidth;
    const minY = -overscroll + halfHeight, maxY = this.worldHeight + overscroll - halfHeight;
    this.camera.x = minX > maxX ? this.worldWidth / 2 : Math.max(minX, Math.min(maxX, this.camera.x));
    this.camera.y = minY > maxY ? this.worldHeight / 2 : Math.max(minY, Math.min(maxY, this.camera.y));
  }

  setZoomAtScreenPoint(zoom, screenPoint) {
    const anchor = this.screenToWorld(screenPoint);
    this.camera.zoom = Math.max(JigsawEngine.MIN_ZOOM, Math.min(JigsawEngine.MAX_ZOOM, zoom));
    this.camera.x = anchor.x - (screenPoint.x - this.worldWidth / 2) / this.camera.zoom;
    this.camera.y = anchor.y - (screenPoint.y - this.worldHeight / 2) / this.camera.zoom;
    this.constrainCamera();
    this.requestRender();
    scheduleActiveJigsawSave(this);
  }

  zoomBy(factor) {
    this.setZoomAtScreenPoint(this.camera.zoom * factor, { x: this.worldWidth / 2, y: this.worldHeight / 2 });
  }

  wheel(event) {
    event.preventDefault();
    const screenPoint = this.canvasScreenPoint(event);
    this.setZoomAtScreenPoint(this.camera.zoom * Math.exp(-event.deltaY * .0015), screenPoint);
  }

  fitBoard() {
    const padding = 80;
    this.camera.zoom = Math.max(JigsawEngine.MIN_ZOOM, Math.min(JigsawEngine.MAX_ZOOM,
      Math.min((this.worldWidth - padding * 2) / this.board.width, (this.worldHeight - padding * 2) / this.board.height)));
    this.camera.x = this.board.x + this.board.width / 2;
    this.camera.y = this.board.y + this.board.height / 2;
    this.constrainCamera();
    this.requestRender();
    scheduleActiveJigsawSave(this);
  }

  fitAll() {
    const padding = 60;
    this.camera = {
      x: this.worldWidth / 2,
      y: this.worldHeight / 2,
      zoom: Math.max(JigsawEngine.MIN_ZOOM, Math.min(JigsawEngine.MAX_ZOOM,
        Math.min((this.worldWidth - padding * 2) / this.worldWidth, (this.worldHeight - padding * 2) / this.worldHeight))),
    };
    this.constrainCamera();
    this.requestRender();
    scheduleActiveJigsawSave(this);
  }

  defaultWorkingCamera() {
    if (this.difficulty === 'easy' || this.difficulty === 'normal') {
      return { x: this.worldWidth / 2, y: this.worldHeight / 2, zoom: 1 };
    }
    const averagePieceWidth = this.pieces.reduce((total, piece) => total + piece.width, 0) / this.pieces.length;
    const smallerPieceDimension = Math.min(averagePieceWidth, this.pieceHeight);
    const cssPixelsPerWorldUnit = Math.min(this.scaleX || 1, this.scaleY || 1);
    const targetPiecePixels = 24;
    const zoom = targetPiecePixels / Math.max(1, smallerPieceDimension * cssPixelsPerWorldUnit);
    return {
      x: this.board.x + this.board.width / 2,
      y: this.board.y + this.board.height / 2,
      zoom: Math.max(JigsawEngine.MIN_ZOOM, Math.min(JigsawEngine.MAX_ZOOM, zoom)),
    };
  }

  applyDefaultWorkingView(persist = true) {
    this.camera = this.defaultWorkingCamera();
    this.constrainCamera();
    this.requestRender();
    if (persist) scheduleActiveJigsawSave(this);
  }

  resetView() {
    this.applyDefaultWorkingView();
  }

  toolUnavailableReason(toolId) {
    if (this.completed) return 'completed';
    if (this.previewing) return 'previewing';
    if (this.hintSelectionActive) return 'hintActive';
    if (toolId === 'hint' && !this.pieces.some((piece) => !piece.placed)) return 'noLoosePieces';
    if (toolId === 'backgroundReveal' && this.backgroundRevealUntil > performance.now()) return 'backgroundActive';
    if (toolId === 'edgeFinder' && !this.pieces.some((piece) => piece.isExterior && !piece.placed)) return 'noEdgePieces';
    if (toolId === 'autoPlace' && !this.singletonLoosePieces().length) return 'noSingletons';
    return null;
  }

  singletonLoosePieces() {
    return this.pieces.filter((piece) => !piece.placed && this.groups.get(piece.groupId)?.size === 1);
  }

  beginHintSelection() {
    if (this.toolUnavailableReason('hint')) return false;
    this.hintSelectionActive = true;
    jigsawScreen.classList.add('hint-selecting');
    $('#jigsawToolStatus').hidden = false;
    this.canvas.focus({ preventScroll: true });
    return true;
  }

  cancelHintSelection(notify = true) {
    if (!this.hintSelectionActive) return false;
    this.hintSelectionActive = false;
    jigsawScreen.classList.remove('hint-selecting');
    $('#jigsawToolStatus').hidden = true;
    if (notify) showToast('Hint cancelled · no coins spent');
    return true;
  }

  setTimedEffect(property, value, duration) {
    this[property] = value;
    this.requestRender();
    const timer = setTimeout(() => {
      this.effectTimers.delete(timer);
      if (this[property] === value) this[property] = property.endsWith('Until') ? 0 : null;
      this.requestRender();
    }, duration + 40);
    this.effectTimers.add(timer);
  }

  activateHintForPiece(piece) {
    if (!this.hintSelectionActive || !piece || piece.placed) return false;
    if (!completeJigsawToolPurchase(this, 'hint')) return false;
    this.cancelHintSelection(false);
    const effect = { pieceId: piece.id, until: performance.now() + 4800 };
    this.setTimedEffect('hintTarget', effect, 4800);
    showToast('Hint activated');
    return true;
  }

  activateTool(toolId) {
    if (this.toolUnavailableReason(toolId)) return false;
    if (toolId === 'backgroundReveal') {
      const until = performance.now() + 10000;
      this.setTimedEffect('backgroundRevealUntil', until, 10000);
      showToast('Background revealed for 10 seconds');
      return true;
    }
    if (toolId === 'edgeFinder') {
      const until = performance.now() + 15000;
      this.setTimedEffect('edgeFinderUntil', until, 15000);
      showToast('Loose edge pieces highlighted for 15 seconds');
      return true;
    }
    if (toolId === 'autoPlace') {
      const candidates = this.singletonLoosePieces();
      if (!candidates.length) return false;
      const piece = candidates[Math.floor(Math.random() * candidates.length)];
      piece.x = piece.targetX;
      piece.y = piece.targetY;
      if (!this.tryPlaceGroup(piece.groupId)) return false;
      const effect = { pieceId: piece.id, until: performance.now() + 900 };
      this.setTimedEffect('autoPlacePulse', effect, 900);
      this.bringGroupToFront(piece.groupId);
      this.rebuildSpatialIndex();
      this.requestRender();
      showToast('One piece auto-placed');
      return true;
    }
    return false;
  }

  hitTestLoosePiece(point) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    const hitOrder = this.hitTestOrder(point);
    for (let index = hitOrder.length - 1; index >= 0; index -= 1) {
      const piece = this.pieces[hitOrder[index]];
      if (piece.placed) continue;
      const bounds = this.pieceWorldBounds(piece);
      if (point.x < bounds.minX || point.x > bounds.maxX || point.y < bounds.minY || point.y > bounds.maxY) continue;
      const dx = piece.x - piece.targetX, dy = piece.y - piece.targetY;
      if (this.ctx.isPointInPath(piece.path, point.x - dx, point.y - dy)) return piece;
    }
    return null;
  }

  pointerDown(event) {
    if (this.completed || this.previewing) return;
    this.canvas.focus({ preventScroll: true });
    const screenPoint = this.canvasScreenPoint(event);
    const point = this.screenToWorld(screenPoint);
    if (this.hintSelectionActive) {
      event.preventDefault();
      const piece = this.hitTestLoosePiece(point);
      if (piece) this.activateHintForPiece(piece);
      else showToast('Select an unlocked loose piece · no coins spent');
      return;
    }
    this.activePointers.set(event.pointerId, screenPoint);
    this.canvas.setPointerCapture(event.pointerId);
    if (this.activePointers.size >= 2) { this.beginPinch(); return; }
    const forcePan = event.button === 1 || this.spacePressed;
    if (!forcePan) {
      const piece = this.hitTestLoosePiece(point);
      if (piece) {
        const groupId = piece.groupId;
        const startPositions = new Map(this.groupMembers(groupId).map((member) => [member.id, { x: member.x, y: member.y }]));
        this.drag = { pointerId: event.pointerId, piece, groupId, startPositions, offsetX: point.x - piece.x, offsetY: point.y - piece.y, startScreen: screenPoint, moved: false };
        this.bringGroupToFront(groupId);
        this.canvas.style.cursor = 'grabbing';
        this.requestRender();
        return;
      }
    }
    this.pan = { pointerId: event.pointerId, startScreen: screenPoint, startCamera: { x: this.camera.x, y: this.camera.y } };
    this.canvas.style.cursor = 'grabbing';
  }

  pointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) return;
    const screenPoint = this.canvasScreenPoint(event);
    this.activePointers.set(event.pointerId, screenPoint);
    if (this.pinch) { this.updatePinch(); return; }
    if (this.drag?.pointerId === event.pointerId) {
      this.updateDraggedPiece(event);
      if (Math.hypot(screenPoint.x - this.drag.startScreen.x, screenPoint.y - this.drag.startScreen.y) > 6) this.drag.moved = true;
      this.requestRender();
      return;
    }
    if (this.pan?.pointerId === event.pointerId) {
      this.camera.x = this.pan.startCamera.x - (screenPoint.x - this.pan.startScreen.x) / this.camera.zoom;
      this.camera.y = this.pan.startCamera.y - (screenPoint.y - this.pan.startScreen.y) / this.camera.zoom;
      this.constrainCamera();
      this.requestRender();
    }
  }

  beginPinch() {
    if (this.drag) {
      this.groupMembers(this.drag.groupId).forEach((piece) => {
        const start = this.drag.startPositions.get(piece.id);
        piece.x = start.x; piece.y = start.y;
      });
      this.drag = null;
    }
    this.pan = null;
    const points = [...this.activePointers.values()].slice(0, 2);
    const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    this.pinch = {
      startDistance: Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)),
      startZoom: this.camera.zoom,
      anchorWorld: this.screenToWorld(midpoint),
    };
    this.canvas.style.cursor = 'grabbing';
    this.requestRender();
  }

  updatePinch() {
    const points = [...this.activePointers.values()].slice(0, 2);
    if (points.length < 2) return;
    const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
    this.camera.zoom = Math.max(JigsawEngine.MIN_ZOOM, Math.min(JigsawEngine.MAX_ZOOM, this.pinch.startZoom * distance / this.pinch.startDistance));
    this.camera.x = this.pinch.anchorWorld.x - (midpoint.x - this.worldWidth / 2) / this.camera.zoom;
    this.camera.y = this.pinch.anchorWorld.y - (midpoint.y - this.worldHeight / 2) / this.camera.zoom;
    this.constrainCamera();
    this.requestRender();
  }

  updateDraggedPiece(event) {
    const point = this.canvasPoint(event);
    const anchorStart = this.drag.startPositions.get(this.drag.piece.id);
    const rawDx = point.x - this.drag.offsetX - anchorStart.x;
    const rawDy = point.y - this.drag.offsetY - anchorStart.y;
    const translation = this.clampGroupTranslation(this.drag.groupId, rawDx, rawDy, this.drag.startPositions);
    this.groupMembers(this.drag.groupId).forEach((piece) => {
      const start = this.drag.startPositions.get(piece.id);
      piece.x = start.x + translation.dx;
      piece.y = start.y + translation.dy;
    });
    return point;
  }

  snapDistance(piece) {
    return Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY);
  }

  tryPlaceGroup(groupId) {
    const members = this.groupMembers(groupId);
    if (!members.length || members.some((piece) => piece.placed)) return false;
    const anchor = members[0];
    const tolerance = Math.min(...members.map((piece) => piece.snapTolerance));
    if (this.snapDistance(anchor) > tolerance) return false;
    const groupDx = anchor.x - anchor.targetX;
    const groupDy = anchor.y - anchor.targetY;
    const rigid = members.every((piece) =>
      Math.abs((piece.x - piece.targetX) - groupDx) < .01 &&
      Math.abs((piece.y - piece.targetY) - groupDy) < .01);
    if (!rigid) return false;
    let newlyPlaced = 0;
    members.forEach((piece) => {
      piece.x = piece.targetX;
      piece.y = piece.targetY;
      if (!piece.placed) { piece.placed = true; newlyPlaced += 1; }
    });
    this.placed += newlyPlaced;
    recordLifetimeJigsawPiecesPlaced(newlyPlaced);
    $('#jigsawPlacedText').textContent = `${this.placed.toLocaleString()} / ${this.pieceCount.toLocaleString()}`;
    return true;
  }

  tryConnectGroup(movingGroupId) {
    const movingMembers = this.groupMembers(movingGroupId);
    if (!movingMembers.length || movingMembers.some((piece) => piece.placed)) return null;
    let best = null;
    movingMembers.forEach((movingPiece) => {
      this.neighbors[movingPiece.id].forEach((neighborId) => {
        const stationaryPiece = this.pieces[neighborId];
        const stationaryGroupId = stationaryPiece.groupId;
        if (stationaryGroupId === movingGroupId || stationaryPiece.placed) return;
        const expectedDx = stationaryPiece.targetX - movingPiece.targetX;
        const expectedDy = stationaryPiece.targetY - movingPiece.targetY;
        const dx = stationaryPiece.x - movingPiece.x - expectedDx;
        const dy = stationaryPiece.y - movingPiece.y - expectedDy;
        const tolerance = Math.min(movingPiece.snapTolerance, stationaryPiece.snapTolerance);
        const error = Math.hypot(dx, dy);
        if (error > tolerance) return;
        const clamped = this.clampGroupTranslation(movingGroupId, dx, dy);
        if (Math.abs(clamped.dx - dx) > .01 || Math.abs(clamped.dy - dy) > .01) return;
        const normalizedError = error / tolerance;
        if (!best || normalizedError < best.normalizedError) best = { stationaryGroupId, dx, dy, normalizedError };
      });
    });
    if (!best) return null;
    this.translateGroup(movingGroupId, best.dx, best.dy);
    return this.mergeGroups(movingGroupId, best.stationaryGroupId);
  }

  mergeGroups(movingGroupId, stationaryGroupId) {
    if (movingGroupId === stationaryGroupId) return stationaryGroupId;
    const moving = this.groups.get(movingGroupId);
    const stationary = this.groups.get(stationaryGroupId);
    if (!moving || !stationary) return null;
    moving.forEach((id) => { stationary.add(id); this.pieces[id].groupId = stationaryGroupId; });
    this.groups.delete(movingGroupId);
    const pulseUntil = performance.now() + 260;
    stationary.forEach((id) => { this.pieces[id].connectedPulseUntil = pulseUntil; });
    this.bringGroupToFront(stationaryGroupId);
    this.canvas.dispatchEvent(new CustomEvent('jigsaw:connected', { detail: { groupId: stationaryGroupId, size: stationary.size } }));
    setTimeout(() => this.requestRender(), 270);
    return stationaryGroupId;
  }

  pointerUp(event) {
    if (!this.activePointers.has(event.pointerId)) return;
    const cancelled = event.type === 'pointercancel';
    if (this.pinch) {
      this.activePointers.delete(event.pointerId);
      if (this.activePointers.size >= 2) {
        this.beginPinch();
      } else {
        this.pinch = null;
        const remaining = [...this.activePointers.entries()][0];
        this.pan = remaining ? { pointerId: remaining[0], startScreen: remaining[1], startCamera: { x: this.camera.x, y: this.camera.y } } : null;
      }
      if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
      this.canvas.style.cursor = this.pan ? 'grabbing' : 'grab';
      scheduleActiveJigsawSave(this);
      return;
    }
    if (this.pan?.pointerId === event.pointerId) {
      this.pan = null;
      this.activePointers.delete(event.pointerId);
      if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
      this.canvas.style.cursor = 'grab';
      scheduleActiveJigsawSave(this);
      return;
    }
    if (this.drag?.pointerId !== event.pointerId) {
      this.activePointers.delete(event.pointerId);
      return;
    }
    if (!cancelled) {
      const releasePoint = this.updateDraggedPiece(event);
      const releaseScreen = this.worldToScreen(releasePoint);
      if (Math.hypot(releaseScreen.x - this.drag.startScreen.x, releaseScreen.y - this.drag.startScreen.y) > 6) this.drag.moved = true;
    }
    const { groupId, moved } = this.drag;
    if (moved) {
      this.moves += 1;
      $('#jigsawMoveText').textContent = String(this.moves);
      if (!cancelled && !this.tryPlaceGroup(groupId)) {
        const mergedGroupId = this.tryConnectGroup(groupId);
        if (mergedGroupId !== null) this.tryPlaceGroup(mergedGroupId);
      }
    }
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.activePointers.delete(event.pointerId);
    this.drag = null;
    this.rebuildSpatialIndex();
    this.canvas.style.cursor = 'grab';
    this.requestRender();
    if (moved) scheduleActiveJigsawSave(this);
    if (this.placed === this.pieceCount) finishJigsaw(this);
  }

  gatherLoosePieces() {
    if (this.completed || this.previewing) return;
    const looseGroupIds = [...this.groups.keys()].filter((groupId) => this.groupMembers(groupId).every((piece) => !piece.placed));
    if (!looseGroupIds.length) return;
    const margin = 24, gap = 24;
    const zones = [
      { x: margin, y: margin, width: this.board.x - gap - margin, height: this.worldHeight - margin * 2 },
      { x: this.board.x + this.board.width + gap, y: margin, width: this.worldWidth - (this.board.x + this.board.width + gap) - margin, height: this.worldHeight - margin * 2 },
      { x: this.board.x, y: margin, width: this.board.width, height: this.board.y - gap - margin },
      { x: this.board.x, y: this.board.y + this.board.height + gap, width: this.board.width, height: this.worldHeight - (this.board.y + this.board.height + gap) - margin },
    ].filter((zone) => zone.width > 50 && zone.height > 50);
    const centers = [];
    shuffle(looseGroupIds).forEach((groupId, index) => {
      const bounds = this.groupBounds(groupId);
      const width = bounds.maxX - bounds.minX, height = bounds.maxY - bounds.minY;
      const fittingZones = zones.filter((zone) => width <= zone.width && height <= zone.height);
      const candidates = fittingZones.length ? fittingZones : [{ x: margin, y: margin, width: this.worldWidth - margin * 2, height: this.worldHeight - margin * 2 }];
      let candidate;
      for (let attempt = 0; attempt < 70; attempt += 1) {
        const zone = candidates[(index + Math.floor(Math.random() * candidates.length)) % candidates.length];
        const x = zone.x + Math.random() * Math.max(0, zone.width - width);
        const y = zone.y + Math.random() * Math.max(0, zone.height - height);
        const center = { x: x + width / 2, y: y + height / 2 };
        candidate = { x, y, center };
        if (centers.slice(-80).every((prior) => Math.hypot(center.x - prior.x, center.y - prior.y) > Math.min(width, height) * .4)) break;
      }
      const translation = this.clampGroupTranslation(groupId, candidate.x - bounds.minX, candidate.y - bounds.minY, null, margin);
      this.translateGroup(groupId, translation.dx, translation.dy);
      centers.push(candidate.center);
    });
    const looseIds = new Set(looseGroupIds.flatMap((groupId) => [...this.groups.get(groupId)]));
    const looseOrder = shuffle(looseGroupIds).flatMap((groupId) => this.drawOrder.filter((id) => this.groups.get(groupId).has(id)));
    this.drawOrder = [...this.drawOrder.filter((id) => !looseIds.has(id)), ...looseOrder];
    this.requestRender();
    this.rebuildSpatialIndex();
    scheduleActiveJigsawSave(this);
    showToast('Loose pieces gathered');
  }

  requestRender() {
    if (this.framePending) return;
    this.framePending = true;
    requestAnimationFrame(() => { this.framePending = false; this.render(); });
  }

  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.pixelRatio * this.scaleX, 0, 0, this.pixelRatio * this.scaleY, 0, 0);
    ctx.clearRect(0, 0, this.worldWidth, this.worldHeight);
    ctx.fillStyle = '#08080a'; ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
    ctx.save();
    ctx.translate(this.worldWidth / 2, this.worldHeight / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);
    const surface = ctx.createRadialGradient(this.worldWidth / 2, this.worldHeight / 2, 80, this.worldWidth / 2, this.worldHeight / 2, Math.max(this.worldWidth, this.worldHeight) * .55);
    surface.addColorStop(0, '#17171c'); surface.addColorStop(1, '#0e0e11');
    ctx.fillStyle = surface; ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#202027'; ctx.fillRect(this.board.x - 9, this.board.y - 9, this.board.width + 18, this.board.height + 18);
    ctx.restore();
    ctx.fillStyle = '#17171c'; ctx.fillRect(this.board.x, this.board.y, this.board.width, this.board.height);
    ctx.strokeStyle = '#62626e'; ctx.lineWidth = 3 / this.camera.zoom; ctx.setLineDash([10 / this.camera.zoom, 9 / this.camera.zoom]); ctx.strokeRect(this.board.x, this.board.y, this.board.width, this.board.height); ctx.setLineDash([]);
    ctx.fillStyle = '#777782'; ctx.font = `800 ${13 / this.camera.zoom}px system-ui`; ctx.textAlign = 'center';
    ctx.fillText('ASSEMBLY AREA', this.board.x + this.board.width / 2, this.board.y - 20);
    if (this.previewing || this.completed) {
      ctx.drawImage(this.image, this.board.x, this.board.y, this.board.width, this.board.height);
      ctx.strokeStyle = '#f7f7f5'; ctx.lineWidth = 2 / this.camera.zoom; ctx.strokeRect(this.board.x, this.board.y, this.board.width, this.board.height);
      ctx.restore();
      return;
    }
    if (this.backgroundRevealUntil > performance.now()) {
      ctx.save();
      ctx.globalAlpha = .28;
      ctx.drawImage(this.image, this.board.x, this.board.y, this.board.width, this.board.height);
      ctx.restore();
    }
    const visible = this.visibleWorldBounds(36 / this.camera.zoom);
    this.lastRenderedPieceCount = 0;
    this.drawOrder.forEach((id) => {
      const piece = this.pieces[id];
      const bounds = this.pieceWorldBounds(piece);
      if (bounds.maxX < visible.minX || bounds.minX > visible.maxX || bounds.maxY < visible.minY || bounds.minY > visible.maxY) return;
      this.drawPiece(piece);
      this.lastRenderedPieceCount += 1;
    });
    if (this.hintTarget?.until > performance.now()) this.drawTargetPulse(this.pieces[this.hintTarget.pieceId], this.hintTarget.until, '#ffd84a');
    if (this.autoPlacePulse?.until > performance.now()) this.drawTargetPulse(this.pieces[this.autoPlacePulse.pieceId], this.autoPlacePulse.until, '#b9ff36');
    ctx.restore();
    if (this.hintTarget?.until > performance.now() || this.autoPlacePulse?.until > performance.now()) this.requestRender();
    if (this.metrics.firstRenderMs === null && this.firstRenderStartedAt) this.metrics.firstRenderMs = performance.now() - this.firstRenderStartedAt;
  }

  drawTargetPulse(piece, until, color) {
    if (!piece) return;
    const remaining = Math.max(0, until - performance.now());
    const pulse = .55 + Math.sin(remaining / 120) * .25;
    this.ctx.save();
    this.ctx.globalAlpha = pulse;
    this.ctx.fillStyle = `${color}33`;
    this.ctx.strokeStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 18 / this.camera.zoom;
    this.ctx.lineWidth = 7 / this.camera.zoom;
    this.ctx.fill(piece.path);
    this.ctx.stroke(piece.path);
    this.ctx.restore();
  }

  drawPiece(piece) {
    const ctx = this.ctx, dx = piece.x - piece.targetX, dy = piece.y - piece.targetY;
    ctx.save(); ctx.translate(dx, dy);
    ctx.save(); ctx.clip(piece.path);
    const simplified = this.pieceCount >= 500 && this.camera.zoom < .45;
    if (!simplified) { ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = (piece.placed ? 2 : 9) / this.camera.zoom; ctx.shadowOffsetY = (piece.placed ? 0 : 4) / this.camera.zoom; }
    ctx.drawImage(this.image, this.board.x, this.board.y, this.board.width, this.board.height);
    ctx.restore();
    const connecting = (piece.connectedPulseUntil || 0) > performance.now();
    const edgeHighlighted = !piece.placed && piece.isExterior && this.edgeFinderUntil > performance.now();
    if (edgeHighlighted) { ctx.shadowColor = '#55dfff'; ctx.shadowBlur = 18 / this.camera.zoom; }
    ctx.strokeStyle = piece.placed ? 'rgba(185,255,54,.65)' : connecting ? '#b9ff36' : edgeHighlighted ? '#55dfff' : 'rgba(255,255,255,.72)';
    ctx.lineWidth = (connecting || edgeHighlighted ? 4 : piece.placed ? 1.5 : 2.2) / this.camera.zoom; ctx.stroke(piece.path); ctx.restore();
  }

  preview() {
    if (this.completed || this.previewing || this.hintSelectionActive) return;
    this.previewing = true; jigsawScreen.classList.add('previewing'); this.requestRender();
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => { this.previewing = false; jigsawScreen.classList.remove('previewing'); this.requestRender(); }, 1800);
  }

  renderCompleted() { this.requestRender(); }
  stopTimer() {
    clearInterval(this.timer);
    this.seconds = Math.max(1, this.elapsedBase + Math.floor((Date.now() - this.startedAt) / 1000));
    $('#jigsawTimerText').textContent = formatTime(this.seconds);
  }
  destroy() {
    clearInterval(this.timer); clearInterval(this.checkpointTimer); clearTimeout(this.previewTimer); this.resizeObserver.disconnect();
    this.effectTimers.forEach((timer) => clearTimeout(timer)); this.effectTimers.clear();
    this.cancelHintSelection(false); closeJigsawToolsPanel();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('keyup', this.onKeyUp);
    this.activePointers.clear(); this.drag = null; this.pan = null; this.pinch = null;
  }
}

async function completeProviderSignIn(user, providerName, localBeforeSignIn) {
  state.profile = {
    provider: providerName,
    name:
      user.displayName ||
      `${capitalize(providerName)} Player`,
    uid: user.uid,
    photoURL: user.photoURL || null,
  };

  // Save locally only until we've checked for an existing cloud save.
  saveLocalState();

  let cloudStatus = 'unavailable';

  try {
    await syncPlayerProfileToCloud(user, providerName);

    cloudStatus = await loadOrCreatePlayerSave(
      user,
      providerName,
      localBeforeSignIn
    );
  } catch (cloudError) {
    console.error('Firestore sync failed:', cloudError);
  }

  await hydrateActiveJigsawSave();
  enterApp();
  return cloudStatus;
}

function showCloudSignInToast(providerName, cloudStatus) {
  if (cloudStatus === 'loaded') {
    showToast(
      `Signed in with ${capitalize(providerName)} · Cloud save loaded`
    );
  } else if (cloudStatus === 'created') {
    showToast(
      `Signed in with ${capitalize(providerName)} · Progress saved to cloud`
    );
  } else {
    showToast(
      `Signed in with ${capitalize(providerName)} · Cloud save unavailable`
    );
  }
}

async function signInWithProvider(providerName) {
  const config = window.GG_FIREBASE_CONFIG;

  if (!config) {
    return showModal(
      'OAuth Setup Needed',
      `${capitalize(providerName)} sign-in needs your Firebase configuration before it can go live.`,
      [{ label: 'Continue as Guest', primary: true }],
      providerName === 'google' ? 'G' : 'f'
    );
  }

  if (location.protocol === 'file:') {
    return showModal(
      'Host the Game First',
      'Google/Facebook authentication needs the game hosted on an approved HTTPS domain.',
      [{ label: 'Got it', primary: true }],
      '🔐'
    );
  }

  // Preserve progress already stored on this device.
  const localBeforeSignIn = structuredClone(state);

  let auth;
  let authMod;

  try {
    ({ auth, authMod } = await getFirebaseContext());

    const provider =
      providerName === 'google'
        ? new authMod.GoogleAuthProvider()
        : new authMod.FacebookAuthProvider();

    const result = await authMod.signInWithPopup(auth, provider);

    const cloudStatus = await completeProviderSignIn(
      result.user,
      providerName,
      localBeforeSignIn
    );

    showCloudSignInToast(providerName, cloudStatus);
  } catch (err) {
    console.error(err);

    if (
      err?.code === 'auth/account-exists-with-different-credential' &&
      auth &&
      authMod
    ) {
      const pendingCredential =
        providerName === 'facebook'
          ? authMod.FacebookAuthProvider.credentialFromError(err)
          : authMod.GoogleAuthProvider.credentialFromError(err);

      const existingProviderName =
        providerName === 'facebook' ? 'google' : 'facebook';

      const conflictEmail = err?.customData?.email || null;

      if (pendingCredential) {
        return showModal(
          'Link Your Accounts',
          `This email already has a ${capitalize(existingProviderName)} Puzzle Panic account. Sign in with ${capitalize(existingProviderName)} once to link both login methods and keep the same cloud save.`,
          [
            { label: 'Cancel' },
            {
              label: `Link with ${capitalize(existingProviderName)}`,
              primary: true,
              action: () => {
                const existingProvider =
                  existingProviderName === 'google'
                    ? new authMod.GoogleAuthProvider()
                    : new authMod.FacebookAuthProvider();

                authMod
                  .signInWithPopup(auth, existingProvider)
                  .then(async (existingResult) => {
                    // Prevent accidentally linking to the wrong Google/Facebook account.
                    if (
                      conflictEmail &&
                      existingResult.user.email &&
                      existingResult.user.email.toLowerCase() !==
                        conflictEmail.toLowerCase()
                    ) {
                      await authMod.signOut(auth);

                      throw new Error(
                        `Please sign in with the ${capitalize(existingProviderName)} account that uses the same email address as your existing Puzzle Panic account.`
                      );
                    }

                    const linkedResult = await authMod.linkWithCredential(
                      existingResult.user,
                      pendingCredential
                    );

                    const cloudStatus = await completeProviderSignIn(
                      linkedResult.user,
                      providerName,
                      localBeforeSignIn
                    );

                    showToast(
                      `Google + Facebook linked · ${
                        cloudStatus === 'loaded'
                          ? 'Cloud save loaded'
                          : 'Account connected'
                      }`
                    );
                  })
                  .catch((linkError) => {
                    console.error('Account linking failed:', linkError);

                    showModal(
                      'Account Linking Failed',
                      linkError?.message ||
                        'The accounts could not be linked. Please try again.',
                      [{ label: 'Try Again', primary: true }],
                      '!'
                    );
                  });
              },
            },
          ],
          '🔗'
        );
      }
    }

    showModal(
      'Sign-in Failed',
      err?.message || 'The authentication popup did not complete.',
      [{ label: 'Try Again', primary: true }],
      '!'
    );
  }
}

function showModal(title, body, actions = [], icon = '✓') {
  const backdrop = $('#modalBackdrop');
  $('#modalTitle').textContent = title;
  $('#modalBody').textContent = body;
  $('#modalIcon').textContent = icon;
  const host = $('#modalActions');
  host.innerHTML = '';
  const finalActions = actions.length ? actions : [{ label: 'Close', primary: true }];
  finalActions.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = `btn ${item.primary ? 'primary' : 'subtle'}`;
    btn.textContent = item.label;
    btn.addEventListener('click', () => {
      backdrop.hidden = true;
      item.action?.();
    });
    host.appendChild(btn);
  });
  backdrop.hidden = false;
}

function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
function capitalize(v) { return v ? v[0].toUpperCase() + v.slice(1) : ''; }
function escapeHtml(v) { return String(v).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }

$('#guestBtn').addEventListener('click', () => {
  if (!state.profile?.name) state.profile = structuredClone(defaultState.profile);
  saveState();
  activeJigsawSave = readLocalActiveJigsaw();
  enterApp();
});
$('#googleBtn').addEventListener('click', () => signInWithProvider('google'));
$('#facebookBtn').addEventListener('click', () => signInWithProvider('facebook'));
$$('[data-nav]').forEach((btn) => btn.addEventListener('click', () => {
  if (btn.dataset.nav === 'puzzles') puzzleFlow = { step: 'mode', puzzleId: null };
  navigate(btn.dataset.nav);
}));
$('#exitGameBtn').addEventListener('click', () => {
  clearInterval(timerHandle);
  const puzzleId = game?.puzzle?.id || puzzleFlow.puzzleId;
  game = null;
  showScreen(mainScreen);
  puzzleFlow = { step: 'difficulty', puzzleId };
  currentView = 'puzzles';
  renderView();
});
$('#previewBtn').addEventListener('click', previewPuzzle);
$('#reshuffleBtn').addEventListener('click', reshuffle);
$('#jigsawPrepBackBtn').addEventListener('click', () => {
  jigsawGame = null;
  showScreen(mainScreen);
  currentView = 'puzzles';
  puzzleFlow.step = 'difficulty';
  renderView();
});
$('#startJigsawBtn').addEventListener('click', () => startJigsaw());
$('#jigsawPreviewBtn').addEventListener('click', () => jigsawGame?.preview?.());
$('#gatherJigsawBtn').addEventListener('click', () => jigsawGame?.gatherLoosePieces?.());
$('#jigsawToolsBtn').addEventListener('click', () => setJigsawToolsPanel($('#jigsawToolsPanel').hidden));
$('#cancelJigsawToolBtn').addEventListener('click', () => jigsawGame?.cancelHintSelection?.());
$('#jigsawZoomOutBtn').addEventListener('click', () => jigsawGame?.zoomBy?.(1 / 1.25));
$('#jigsawZoomInBtn').addEventListener('click', () => jigsawGame?.zoomBy?.(1.25));
$('#jigsawFitBtn').addEventListener('click', () => jigsawGame?.fitBoard?.());
$('#jigsawFitAllBtn').addEventListener('click', () => jigsawGame?.fitAll?.());
$('#jigsawResetViewBtn').addEventListener('click', () => jigsawGame?.resetView?.());
$('#exitJigsawBtn').addEventListener('click', () => {
  if (!jigsawGame || jigsawGame.completed) return returnFromJigsaw();
  showModal('Leave This Puzzle?', 'Save your progress for later, keep playing, or abandon this puzzle.', [
    { label: 'Keep Playing' },
    { label: 'Abandon Puzzle', action: () => showModal('Abandon Puzzle?', 'This permanently deletes the unfinished Jigsaw save.', [
      { label: 'Cancel' },
      { label: 'Delete Save', primary: true, action: async () => { await clearActiveJigsawSave(); returnFromJigsaw(); } },
    ], '!') },
    { label: 'Save & Exit', primary: true, action: async () => {
      await scheduleActiveJigsawSave(jigsawGame, true);
      await flushPlayerProgressSave();
      returnFromJigsaw();
    } },
  ], '↩');
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#modalBackdrop').hidden) {
    e.preventDefault();
    $('#modalBackdrop').hidden = true;
    return;
  }
  if (gameScreen.classList.contains('active') && e.key === 'Escape') $('#exitGameBtn').click();
  if (jigsawScreen.classList.contains('active') && e.key === 'Escape') {
    if (jigsawGame?.hintSelectionActive) { e.preventDefault(); jigsawGame.cancelHintSelection(); }
    else if (!$('#jigsawToolsPanel').hidden) { e.preventDefault(); closeJigsawToolsPanel(); $('#jigsawToolsBtn').focus(); }
    else $('#exitJigsawBtn').click();
  }
});
window.addEventListener('resize', () => { if (game && gameScreen.classList.contains('active')) renderBoard(); });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

updateWallet();
