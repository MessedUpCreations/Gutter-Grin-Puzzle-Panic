const PUZZLES = [
  { id: 'smooch-mode', title: 'Smooch Mode', image: 'assets/smooch-mode.webp', width: 1400, height: 1188, pack: 'starter' },
  { id: 'cat-mode', title: 'Cat Mode', image: 'assets/cat-mode.webp', width: 1254, height: 1254, pack: 'starter' },
  { id: 'yas-queens', title: 'Yas Queens', image: 'assets/yas-queens.webp', width: 1166, height: 1400, pack: 'starter' },
  { id: 'damn-that-raccoon', title: 'Damn That Raccoon!', image: 'assets/damn-that-raccoon.webp', width: 1166, height: 1400, pack: 'starter' },
  { id: 'gutter-grin', title: 'Gutter Grin', image: 'assets/gutter-grin.webp', width: 1166, height: 1400, pack: 'starter' },
];

const PACKS = [
  { id: 'starter', title: 'Gutter Grin Starter Pack', count: 5, price: 0, owned: true, available: true, image: 'assets/gutter-grin.webp', description: 'The five launch puzzles included with the game.' },
  { id: 'trash-panda', title: 'Trash Panda Trouble', count: 6, price: 500, owned: false, available: false, description: 'Future raccoon chaos pack. Pack slot and shop logic are ready.' },
  { id: 'after-hours', title: 'After Hours', count: 8, price: 750, owned: false, available: false, description: 'A future adults-only humor puzzle pack.' },
  { id: 'hot-mess', title: 'Hot Mess Express', count: 10, price: 1000, owned: false, available: false, description: 'A larger future pack for the truly committed mess.' },
];

const DIFFICULTIES = {
  easy:   { label: 'Easy', cols: 3, rows: 3, reward: 10 },
  normal: { label: 'Normal', cols: 4, rows: 4, reward: 20 },
  hard:   { label: 'Hard', cols: 5, rows: 5, reward: 35 },
  insane: { label: 'Insane', cols: 6, rows: 6, reward: 60 },
};

const STORAGE_KEY = 'gutterGrinPuzzlePanic.v1';
const defaultState = {
  profile: { provider: 'guest', name: 'Guest Player', uid: null },
  coins: 250,
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
const viewHost = $('#viewHost');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(defaultState), ...saved, profile: { ...defaultState.profile, ...(saved?.profile || {}) } };
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
  [authScreen, mainScreen, gameScreen].forEach((el) => el.classList.remove('active'));
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

function completionCountForPuzzle(id) {
  return Object.keys(state.completed || {}).filter((key) => key.startsWith(`${id}:`)).length;
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
          <button class="btn subtle" data-go="puzzles">Choose a Puzzle</button>
        </div>
      </div>
    </section>

    <div class="section-head">
      <div><h3>Starter Pack</h3><p>${completedUnique} of ${PUZZLES.length} puzzles completed</p></div>
      <button class="text-btn" data-go="puzzles">See all</button>
    </div>
    <div class="puzzle-grid">${PUZZLES.slice(0,5).map(puzzleCard).join('')}</div>
  `;
  bindViewEvents();
  $('#quickPlayBtn').addEventListener('click', () => {
    const incomplete = PUZZLES.find((p) => !state.completed[`${p.id}:${state.difficulty}`]);
    startGame(incomplete || PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  });
}

function puzzleCard(puzzle) {
  const solved = completionCountForPuzzle(puzzle.id) > 0;
  return `
    <button class="puzzle-card" data-puzzle="${puzzle.id}">
      <img class="puzzle-thumb" src="${puzzle.image}" alt="${escapeHtml(puzzle.title)} puzzle artwork" loading="lazy" />
      <div class="puzzle-info">
        <strong>${escapeHtml(puzzle.title)}</strong>
        <div class="puzzle-meta">
          <span>${DIFFICULTIES[state.difficulty].label} · ${DIFFICULTIES[state.difficulty].cols}×${DIFFICULTIES[state.difficulty].rows}</span>
          <span class="${solved ? 'complete-dot' : ''}">${solved ? '✓ Solved' : 'Play'}</span>
        </div>
      </div>
    </button>`;
}

function renderPuzzles() {
  viewHost.innerHTML = `
    <div class="section-head" style="margin-top:4px">
      <div><h3>Your Puzzles</h3><p>Every attached launch artwork is a separate puzzle.</p></div>
    </div>
    <div class="difficulty-bar">
      <label for="difficultySelect">Difficulty</label>
      <select id="difficultySelect" class="select">
        ${Object.entries(DIFFICULTIES).map(([key,d]) => `<option value="${key}" ${key === state.difficulty ? 'selected' : ''}>${d.label} · ${d.cols}×${d.rows} · +${d.reward} coins</option>`).join('')}
      </select>
    </div>
    <div class="puzzle-grid">${PUZZLES.map(puzzleCard).join('')}</div>
  `;
  bindViewEvents();
  $('#difficultySelect').addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    saveState();
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
  $('#logoutBtn')?.addEventListener('click', () => {
    state.profile = structuredClone(defaultState.profile);
    saveState();
    renderProfile();
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
    if (puzzle) startGame(puzzle);
  }));
}

function startGame(puzzle) {
  clearInterval(timerHandle);
  clearTimeout(previewHandle);
  const diff = DIFFICULTIES[state.difficulty];
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

  const key = `${game.puzzle.id}:${state.difficulty}`;
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
      { label: 'Back to Puzzles', action: () => { showScreen(mainScreen); navigate('puzzles'); } },
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

  try {
    const { auth, authMod } = await getFirebaseContext();

    const provider =
      providerName === 'google'
        ? new authMod.GoogleAuthProvider()
        : new authMod.FacebookAuthProvider();

    const result = await authMod.signInWithPopup(auth, provider);

    state.profile = {
      provider: providerName,
      name:
        result.user.displayName ||
        result.user.email ||
        `${capitalize(providerName)} Player`,
      uid: result.user.uid,
    };

    saveState();

    let cloudSaved = true;

    try {
      await syncPlayerProfileToCloud(result.user, providerName);
    } catch (cloudError) {
      cloudSaved = false;
      console.error('Firestore profile sync failed:', cloudError);
    }

    enterApp();

    showToast(
      cloudSaved
        ? `Signed in with ${capitalize(providerName)} · Cloud connected`
        : `Signed in with ${capitalize(providerName)} · Cloud save unavailable`
    );
  } catch (err) {
    console.error(err);

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
$$('[data-nav]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
$('#exitGameBtn').addEventListener('click', () => {
  clearInterval(timerHandle);
  game = null;
  showScreen(mainScreen);
  navigate('puzzles');
});
$('#previewBtn').addEventListener('click', previewPuzzle);
$('#reshuffleBtn').addEventListener('click', reshuffle);

window.addEventListener('keydown', (e) => {
  if (gameScreen.classList.contains('active') && e.key === 'Escape') $('#exitGameBtn').click();
});
window.addEventListener('resize', () => { if (game && gameScreen.classList.contains('active')) renderBoard(); });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

updateWallet();
