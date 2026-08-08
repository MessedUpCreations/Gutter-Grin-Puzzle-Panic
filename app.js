const PUZZLES = [
  { id: 'smooch-mode', title: 'Smooch Mode', image: 'assets/smooch-mode.webp', width: 1400, height: 1188, pack: 'starter' },
  { id: 'cat-mode', title: 'Cat Mode', image: 'assets/cat-mode.webp', width: 1254, height: 1254, pack: 'starter' },
  { id: 'yas-queens', title: 'Yas Queens', image: 'assets/yas-queens.webp', width: 1166, height: 1400, pack: 'starter' },
  { id: 'damn-that-raccoon', title: 'Damn That Raccoon!', image: 'assets/damn-that-raccoon.webp', width: 1166, height: 1400, pack: 'starter' },
  { id: 'gutter-grin', title: 'Gutter Grin', image: 'assets/gutter-grin.webp', width: 1166, height: 1400, pack: 'starter' },
];

const PACKS = [
  { id: 'starter', title: 'Gutter Grin Starter Pack', count: 5, price: 0, owned: true, available: true, image: 'assets/gutter-grin.webp', description: 'The five launch puzzles included with the game.' },
  { id: 'raccoon-adventures', title: 'Raccoon Adventures', count: 5, price: 500, owned: false, available: false, description: 'More trash-panda trouble is on the way.' },
  { id: 'wild-groovy', title: "Wild n' Groovy", count: 5, price: 500, owned: false, available: false, description: 'A future pack of wild, groovy artwork.' },
  { id: 'epic-fantasy', title: 'Epic Fantasy', count: 5, price: 500, owned: false, available: false, description: 'A future collection of fantastic adventures.' },
];

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

const GAME_MODES = {
  swap: { label: 'Swap Puzzle', icon: '⇄', description: 'Swap scrambled tiles until the artwork is back where it belongs.', difficulties: SWAP_DIFFICULTIES },
  jigsaw: { label: 'Classic Jigsaw', icon: '🧩', description: 'Piece together a traditional interlocking jigsaw before the clock beats you.', difficulties: JIGSAW_DIFFICULTIES },
};

const STORAGE_KEY = 'gutterGrinPuzzlePanic.v1';
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
};

let state = loadState();
let currentView = 'home';
let game = null;
let timerHandle = null;
let previewHandle = null;
let firebaseContext = null;
let puzzleFlow = { step: 'mode', puzzleId: null };
let jigsawGame = null;

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
      user.email ||
      `${capitalize(providerName)} Player`,
    uid: user.uid,
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

function renderHome() {
  const completedUnique = PUZZLES.filter((p) => completionCountForPuzzle(p.id) > 0).length;
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

    <div class="section-head">
      <div><h3>Starter Pack</h3><p>${completedUnique} of ${PUZZLES.length} puzzles completed</p></div>
      <button class="text-btn" data-go="puzzles">See all</button>
    </div>
    <div class="puzzle-grid">${PUZZLES.slice(0,5).map((puzzle) => puzzleCard(puzzle, 'browse')).join('')}</div>
  `;
  bindViewEvents();
  $('#quickPlayBtn').addEventListener('click', () => {
    puzzleFlow = { step: 'mode', puzzleId: null };
    navigate('puzzles');
  });
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
  viewHost.innerHTML = `
    ${flowHeader('STEP 1 OF 4', 'Choose your mode', 'How do you want to put the chaos back together?')}
    <div class="mode-grid">${Object.entries(GAME_MODES).map(([key, mode]) => `
      <button class="mode-card ${key}" data-mode="${key}">
        <span class="mode-icon">${mode.icon}</span><span><strong>${mode.label}</strong><small>${mode.description}</small></span><b>Choose →</b>
      </button>`).join('')}</div>
  `;
  $$('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    state.selectedMode = button.dataset.mode;
    saveState();
    puzzleFlow = { step: 'puzzle', puzzleId: null };
    renderPuzzles();
  }));
}

function renderPuzzleSelection() {
  viewHost.innerHTML = `${flowHeader('STEP 2 OF 4', 'Choose an artwork', `${GAME_MODES[state.selectedMode].label} · Starter Pack`, 'mode')}
    <div class="puzzle-grid">${PUZZLES.map((puzzle) => puzzleCard(puzzle)).join('')}</div>`;
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
      if (state.difficulty === 'easy') return showJigsawPreparation(puzzle);
      showModal('Higher Piece Counts Coming Next', `${difficulties[state.difficulty].pieces.toLocaleString()}-piece Classic Jigsaw support is being enabled in the next engine stage. Easy · 52 pieces is playable now.`, [{ label: 'Back to Difficulties', primary: true }], '🧩');
      return;
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
      <div><h3>Puzzle Shop</h3><p>Future packs can unlock with coins or real-money checkout later.</p></div>
    </div>
    <div class="shop-grid">
      ${PACKS.map((pack) => {
        const owned = pack.owned || state.purchasedPacks.includes(pack.id);
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
  saveState();
  showToast(`${pack.title} unlocked!`);
  renderShop();
}

function renderProfile() {
  const profile = state.profile || defaultState.profile;
  const providerLabel = profile.provider === 'guest' ? 'Guest · saved on this device' : `${capitalize(profile.provider)} account`;
  viewHost.innerHTML = `
    <div class="section-head" style="margin-top:4px"><div><h3>Player Profile</h3><p>Progress, currency and account connection.</p></div></div>
    <section class="profile-card">
      <div class="profile-row">
        <div class="avatar">${escapeHtml((profile.name || 'G').slice(0,1).toUpperCase())}</div>
        <div><h3>${escapeHtml(profile.name || 'Guest Player')}</h3><p>${escapeHtml(providerLabel)}</p></div>
      </div>
      <div class="stat-grid">
        <div class="stat-box"><strong>${state.puzzlesCompleted || 0}</strong><small>COMPLETIONS</small></div>
        <div class="stat-box"><strong>${state.totalMoves || 0}</strong><small>TOTAL MOVES</small></div>
        <div class="stat-box"><strong>${state.coins || 0}</strong><small>COINS</small></div>
      </div>
      <div class="profile-actions">
        ${profile.provider === 'guest' ? `
          <button class="btn provider" id="profileGoogleBtn"><span class="provider-icon">G</span> Connect Google</button>
          <button class="btn provider" id="profileFacebookBtn"><span class="provider-icon">f</span> Connect Facebook</button>` : `
          <button class="btn subtle" id="logoutBtn">Sign Out</button>`}
        <button class="btn ghost" id="resetBtn">Reset Local Progress</button>
      </div>
    </section>
  `;
  $('#profileGoogleBtn')?.addEventListener('click', () => signInWithProvider('google'));
  $('#profileFacebookBtn')?.addEventListener('click', () => signInWithProvider('facebook'));
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

function showJigsawPreparation(puzzle) {
  clearInterval(timerHandle);
  jigsawGame = { puzzle, started: false };
  $('#jigsawPrepTitle').textContent = puzzle.title;
  $('#jigsawPrepImage').src = puzzle.image;
  $('#jigsawPrepImage').alt = `${puzzle.title} completed artwork`;
  $('#prepCoinCount').textContent = Number(state.coins || 0).toLocaleString();
  showScreen(jigsawPrepScreen);
}

async function startJigsaw() {
  const puzzle = jigsawGame?.puzzle;
  if (!puzzle) return;
  const image = new Image();
  image.src = puzzle.image;
  try { await image.decode(); } catch { /* The load event fallback below still validates dimensions. */ }
  if (!image.complete || !image.naturalWidth) {
    return showModal('Artwork Could Not Load', 'Please check your connection and try starting this puzzle again.', [{ label: 'Back', primary: true }], '!');
  }
  jigsawGame = new JigsawEngine($('#jigsawCanvas'), puzzle, image);
  $('#jigsawTitle').textContent = puzzle.title;
  $('#jigsawTimerText').textContent = '00:00';
  $('#jigsawPlacedText').textContent = '0 / 52';
  $('#jigsawMoveText').textContent = '0';
  showScreen(jigsawScreen);
  jigsawGame.start();
}

function jigsawTimeBonus(seconds) {
  if (seconds <= 300) return 5;
  if (seconds > 900) return 0;
  return Math.max(1, Math.min(5, Math.ceil(1 + (4 * (900 - seconds)) / 600)));
}

function finishJigsaw(engine) {
  if (jigsawGame !== engine || engine.completed) return;
  engine.completed = true;
  engine.stopTimer();
  engine.renderCompleted();
  const seconds = engine.seconds;
  const baseReward = JIGSAW_DIFFICULTIES.easy.reward;
  const timeBonus = jigsawTimeBonus(seconds);
  const reward = baseReward + timeBonus;
  const key = completionKey('jigsaw', engine.puzzle.id, 'easy');
  const prior = state.completed[key];
  state.completed[key] = {
    bestSeconds: Number.isFinite(prior?.bestSeconds) ? Math.min(prior.bestSeconds, seconds) : seconds,
    bestMoves: Number.isFinite(prior?.bestMoves) ? Math.min(prior.bestMoves, engine.moves) : engine.moves,
    clears: (prior?.clears || 0) + 1,
  };
  state.coins += reward;
  state.totalMoves = (state.totalMoves || 0) + engine.moves;
  state.totalSeconds = (state.totalSeconds || 0) + seconds;
  state.puzzlesCompleted = (state.puzzlesCompleted || 0) + 1;
  saveState();
  setTimeout(() => showModal(
    'Jigsaw Complete!',
    `${formatTime(seconds)} · ${engine.moves} moves\nBase reward: +${baseReward} · Time bonus: +${timeBonus} · Total earned: +${reward} coins`,
    [
      { label: 'Back to Puzzles', action: returnFromJigsaw },
      { label: 'Play Again', primary: true, action: () => showJigsawPreparation(engine.puzzle) },
    ],
    '✓'
  ), 350);
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
  static ROWS = 8;
  static ROW_COUNTS = [7, 6, 7, 6, 7, 6, 7, 6];
  static PIECE_COUNT = 52;
  static WIDTH = 1400;
  static HEIGHT = 900;

  constructor(canvas, puzzle, image) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.puzzle = puzzle;
    this.image = image;
    this.pieces = [];
    this.drawOrder = [];
    this.drag = null;
    this.moves = 0;
    this.placed = 0;
    this.seconds = 0;
    this.startedAt = 0;
    this.completed = false;
    this.previewing = false;
    this.framePending = false;
    this.resizeObserver = new ResizeObserver(() => { this.resizeCanvas(); this.requestRender(); });
    this.onPointerDown = (event) => this.pointerDown(event);
    this.onPointerMove = (event) => this.pointerMove(event);
    this.onPointerUp = (event) => this.pointerUp(event);
  }

  start() {
    this.configureBoard();
    this.createPieces();
    this.scatterPieces();
    this.bindEvents();
    this.resizeCanvas();
    this.startedAt = Date.now();
    this.timer = setInterval(() => {
      if (this.completed) return;
      this.seconds = Math.floor((Date.now() - this.startedAt) / 1000);
      $('#jigsawTimerText').textContent = formatTime(this.seconds);
    }, 250);
    this.requestRender();
  }

  configureBoard() {
    const aspect = this.puzzle.width / this.puzzle.height;
    let width = 760;
    let height = width / aspect;
    if (height > 620) { height = 620; width = height * aspect; }
    this.board = { x: (JigsawEngine.WIDTH - width) / 2, y: (JigsawEngine.HEIGHT - height) / 2, width, height };
    this.pieceHeight = height / JigsawEngine.ROWS;
    this.snapTolerance = Math.min(width / 7, this.pieceHeight) * 0.42;
  }

  createPieces() {
    // Alternating full-width rows create 7+6+7+6+7+6+7+6 = exactly 52.
    // Each shared horizontal boundary is one continuous cached contour, so
    // differently spaced vertical seams never create gaps or overlaps.
    this.horizontalContours = Array.from({ length: JigsawEngine.ROWS - 1 }, (_, boundary) => ({
      signs: Array.from({ length: 7 }, (__, segment) => ((boundary + segment) % 2 ? -1 : 1) * (Math.random() < .72 ? 1 : -1)),
      depths: Array.from({ length: 7 }, (__, segment) => this.pieceHeight * (0.14 + ((boundary + segment) % 3) * 0.018)),
    }));
    const vertical = JigsawEngine.ROW_COUNTS.map((count) =>
      Array.from({ length: count - 1 }, () => Math.random() < .5 ? -1 : 1));
    let id = 0;
    for (let row = 0; row < JigsawEngine.ROWS; row += 1) {
      const count = JigsawEngine.ROW_COUNTS[row];
      const width = this.board.width / count;
      for (let col = 0; col < count; col += 1) {
        const targetX = this.board.x + col * width;
        const targetY = this.board.y + row * this.pieceHeight;
        const edges = {
          right: col === count - 1 ? 0 : vertical[row][col],
          left: col === 0 ? 0 : -vertical[row][col - 1],
        };
        const tabDepth = Math.min(width, this.pieceHeight) * (0.17 + ((id % 3) * 0.018));
        const piece = { id, row, col, targetX, targetY, width, tabDepth, x: 0, y: 0, edges, placed: false, groupId: id };
        piece.path = this.makePiecePath(piece);
        piece.visualBounds = this.calculateVisualBounds(piece);
        this.pieces.push(piece);
        id += 1;
      }
    }
    if (this.pieces.length !== JigsawEngine.PIECE_COUNT) throw new Error('Easy Jigsaw must contain exactly 52 pieces.');
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
      x: Math.max(margin - bounds.minX, Math.min(JigsawEngine.WIDTH - margin - bounds.maxX, x)),
      y: Math.max(margin - bounds.minY, Math.min(JigsawEngine.HEIGHT - margin - bounds.maxY, y)),
    };
  }

  horizontalBoundaryY(boundary, x) {
    const baseY = this.board.y + (boundary + 1) * this.pieceHeight;
    if (boundary < 0 || boundary >= JigsawEngine.ROWS - 1) return baseY;
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
      { x: margin, y: margin, width: this.board.x - gap - margin, height: JigsawEngine.HEIGHT - margin * 2 },
      { x: this.board.x + this.board.width + gap, y: margin, width: JigsawEngine.WIDTH - (this.board.x + this.board.width + gap) - margin, height: JigsawEngine.HEIGHT - margin * 2 },
      { x: this.board.x, y: margin, width: this.board.width, height: this.board.y - gap - margin },
      { x: this.board.x, y: this.board.y + this.board.height + gap, width: this.board.width, height: JigsawEngine.HEIGHT - (this.board.y + this.board.height + gap) - margin },
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
        if (centers.every((prior) => Math.hypot(center.x - prior.x, center.y - prior.y) > Math.min(piece.width, this.pieceHeight) * .48)) break;
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

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.resizeObserver.observe(this.canvas);
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const cssAspect = JigsawEngine.WIDTH / JigsawEngine.HEIGHT;
    let width = rect.width, height = width / cssAspect;
    if (height > rect.height) { height = rect.height; width = height * cssAspect; }
    this.canvas.style.width = `${Math.floor(width)}px`;
    this.canvas.style.height = `${Math.floor(height)}px`;
    this.canvas.width = Math.max(1, Math.floor(width * ratio));
    this.canvas.height = Math.max(1, Math.floor(height * ratio));
    this.scaleX = width / JigsawEngine.WIDTH;
    this.scaleY = height / JigsawEngine.HEIGHT;
    this.pixelRatio = ratio;
  }

  canvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / this.scaleX, y: (event.clientY - rect.top) / this.scaleY };
  }

  pointerDown(event) {
    if (this.completed || this.previewing) return;
    const point = this.canvasPoint(event);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let index = this.drawOrder.length - 1; index >= 0; index -= 1) {
      const piece = this.pieces[this.drawOrder[index]];
      if (piece.placed) continue;
      const dx = piece.x - piece.targetX, dy = piece.y - piece.targetY;
      if (this.ctx.isPointInPath(piece.path, point.x - dx, point.y - dy)) {
        this.drag = { piece, offsetX: point.x - piece.x, offsetY: point.y - piece.y, startX: point.x, startY: point.y, moved: false };
        this.drawOrder.splice(index, 1); this.drawOrder.push(piece.id);
        this.canvas.setPointerCapture(event.pointerId);
        this.requestRender();
        break;
      }
    }
  }

  pointerMove(event) {
    if (!this.drag) return;
    const point = this.canvasPoint(event);
    const position = this.clampPiecePosition(this.drag.piece, point.x - this.drag.offsetX, point.y - this.drag.offsetY);
    this.drag.piece.x = position.x;
    this.drag.piece.y = position.y;
    if (Math.hypot(point.x - this.drag.startX, point.y - this.drag.startY) > 6) this.drag.moved = true;
    this.requestRender();
  }

  pointerUp(event) {
    if (!this.drag) return;
    const { piece, moved } = this.drag;
    if (moved) {
      this.moves += 1;
      $('#jigsawMoveText').textContent = String(this.moves);
      if (Math.hypot(piece.x - piece.targetX, piece.y - piece.targetY) <= this.snapTolerance) {
        piece.x = piece.targetX; piece.y = piece.targetY; piece.placed = true;
        this.placed += 1;
        $('#jigsawPlacedText').textContent = `${this.placed} / ${JigsawEngine.PIECE_COUNT}`;
      }
    }
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    this.drag = null;
    this.requestRender();
    if (this.placed === JigsawEngine.PIECE_COUNT) finishJigsaw(this);
  }

  gatherLoosePieces() {
    if (this.completed || this.previewing) return;
    const loosePieces = this.pieces.filter((piece) => !piece.placed);
    if (!loosePieces.length) return;
    this.scatterPieces(loosePieces);
    const looseIds = new Set(loosePieces.map((piece) => piece.id));
    this.drawOrder = [
      ...this.drawOrder.filter((id) => !looseIds.has(id)),
      ...shuffle(loosePieces.map((piece) => piece.id)),
    ];
    this.requestRender();
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
    ctx.clearRect(0, 0, JigsawEngine.WIDTH, JigsawEngine.HEIGHT);
    const surface = ctx.createRadialGradient(JigsawEngine.WIDTH / 2, JigsawEngine.HEIGHT / 2, 80, JigsawEngine.WIDTH / 2, JigsawEngine.HEIGHT / 2, 760);
    surface.addColorStop(0, '#17171c'); surface.addColorStop(1, '#0e0e11');
    ctx.fillStyle = surface; ctx.fillRect(0, 0, JigsawEngine.WIDTH, JigsawEngine.HEIGHT);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#202027'; ctx.fillRect(this.board.x - 9, this.board.y - 9, this.board.width + 18, this.board.height + 18);
    ctx.restore();
    ctx.fillStyle = '#17171c'; ctx.fillRect(this.board.x, this.board.y, this.board.width, this.board.height);
    ctx.strokeStyle = '#62626e'; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.strokeRect(this.board.x, this.board.y, this.board.width, this.board.height); ctx.setLineDash([]);
    ctx.fillStyle = '#777782'; ctx.font = '800 13px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('ASSEMBLY AREA', this.board.x + this.board.width / 2, this.board.y - 20);
    if (this.previewing || this.completed) {
      ctx.drawImage(this.image, this.board.x, this.board.y, this.board.width, this.board.height);
      ctx.strokeStyle = '#f7f7f5'; ctx.lineWidth = 2; ctx.strokeRect(this.board.x, this.board.y, this.board.width, this.board.height);
      return;
    }
    this.drawOrder.forEach((id) => this.drawPiece(this.pieces[id]));
  }

  drawPiece(piece) {
    const ctx = this.ctx, dx = piece.x - piece.targetX, dy = piece.y - piece.targetY;
    ctx.save(); ctx.translate(dx, dy);
    ctx.save(); ctx.clip(piece.path);
    ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = piece.placed ? 2 : 9; ctx.shadowOffsetY = piece.placed ? 0 : 4;
    ctx.drawImage(this.image, this.board.x, this.board.y, this.board.width, this.board.height);
    ctx.restore();
    ctx.strokeStyle = piece.placed ? 'rgba(185,255,54,.65)' : 'rgba(255,255,255,.72)';
    ctx.lineWidth = piece.placed ? 1.5 : 2.2; ctx.stroke(piece.path); ctx.restore();
  }

  preview() {
    if (this.completed || this.previewing) return;
    this.previewing = true; jigsawScreen.classList.add('previewing'); this.requestRender();
    clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => { this.previewing = false; jigsawScreen.classList.remove('previewing'); this.requestRender(); }, 1800);
  }

  renderCompleted() { this.requestRender(); }
  stopTimer() {
    clearInterval(this.timer);
    this.seconds = Math.max(1, Math.floor((Date.now() - this.startedAt) / 1000));
    $('#jigsawTimerText').textContent = formatTime(this.seconds);
  }
  destroy() {
    clearInterval(this.timer); clearTimeout(this.previewTimer); this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
  }
}

async function completeProviderSignIn(user, providerName, localBeforeSignIn) {
  state.profile = {
    provider: providerName,
    name:
      user.displayName ||
      user.email ||
      `${capitalize(providerName)} Player`,
    uid: user.uid,
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
$('#startJigsawBtn').addEventListener('click', startJigsaw);
$('#jigsawPreviewBtn').addEventListener('click', () => jigsawGame?.preview?.());
$('#gatherJigsawBtn').addEventListener('click', () => jigsawGame?.gatherLoosePieces?.());
$('#exitJigsawBtn').addEventListener('click', () => {
  if (!jigsawGame || jigsawGame.completed) return returnFromJigsaw();
  showModal('Leave This Puzzle?', 'Your unfinished Jigsaw progress will be lost.', [
    { label: 'Keep Playing' },
    { label: 'Leave Puzzle', primary: true, action: returnFromJigsaw },
  ], '↩');
});

window.addEventListener('keydown', (e) => {
  if (gameScreen.classList.contains('active') && e.key === 'Escape') $('#exitGameBtn').click();
  if (jigsawScreen.classList.contains('active') && e.key === 'Escape') $('#exitJigsawBtn').click();
});
window.addEventListener('resize', () => { if (game && gameScreen.classList.contains('active')) renderBoard(); });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

updateWallet();
