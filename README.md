# Gutter Grin: Puzzle Panic

A dependency-free, mobile-friendly browser puzzle prototype built from the five supplied Gutter Grin artworks.

## Included now

- Five separate launch puzzles in one free Starter Pack.
- Tap/click-to-swap puzzle gameplay that works on desktop and touch screens.
- Easy 3x3, Normal 4x4, Hard 5x5, and Insane 6x6 difficulty levels.
- Timer, move counter, preview button, reshuffle, completion tracking, and coin rewards.
- Guest play with progress saved in browser `localStorage`.
- Coin-based pack shop and cosmetics.
- Google and Facebook authentication code path prepared through Firebase Auth.
- PWA manifest and service worker for installable/offline play after deployment over HTTPS.

## Run locally

The game itself can be opened directly by double-clicking `index.html`; guest mode works immediately.

For the full PWA/service-worker behavior, run a local web server from this folder, for example:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Activate Google/Facebook sign-in

1. Create a Firebase project and Web App.
2. In Firebase Authentication, enable Google and Facebook providers.
3. For Facebook, create a Meta app and add the credentials Firebase requests.
4. Add your hosted domain to Firebase Authentication's authorized domains.
5. Open `config.js` and replace `null` with your Firebase web configuration object.
6. Deploy the folder to an HTTPS host such as Firebase Hosting, Cloudflare Pages, Netlify, Vercel, or GitHub Pages.

Signed-in gameplay progress is synchronized to the authenticated user's protected Firestore tree. Guest progress remains local to the browser.

## Adding a new puzzle pack

1. Place optimized artwork in `assets/`.
2. Add each puzzle to the `PUZZLES` array in `app.js` with a `pack` ID.
3. Add or update the pack in the `PACKS` array.
4. Set `available: true` when the pack is ready for purchase.
5. Add the new assets to `sw.js` if they should be available offline.

## Secure economy

Authenticated coins, permanent pack ownership, and cosmetic ownership are authoritative in `economy/{uid}`. Mutations run through the Firebase Admin-backed Vercel Functions under `/api/economy`; the atomic idempotency ledger is stored at `economyLedger/{uid}/entries/{operationId}`. The browser's normal `users/{uid}/saves/main` document may contain compatibility mirrors, but those mirrors are not authority after economy hydration. Guest economy behavior remains local and unchanged.

Configure these server-only Vercel environment variables (never put their values in client code):

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

For local authenticated API testing, configure those variables outside Git and run `vercel dev`. Opening the static files directly cannot provide `/api` routes; signed-in economy actions intentionally fail closed while guest play remains local.

Legacy migration is available only when `economy/{uid}` does not exist and Firebase Auth reports that the account was created before `2026-08-13T00:00:00.000Z`. Valid known legacy economy fields are imported once. Accounts at or after the cutoff—and accounts with unavailable or malformed creation metadata—receive the normal 250-coin starting economy plus Starter Pack, `classic-table`, and `classic-effect`. Existing authoritative economy documents are never re-imported or reset.

The intended client boundary is versioned in `firestore.rules`: authenticated users may read/write only their own `users/{uid}/...` tree, while `economy` and `economyLedger` have no client access. Firebase Admin bypasses these client rules. This repository file is not automatically deployed. To publish it manually: open Firebase Console → Firestore Database → Rules, replace the editor contents with the complete contents of `firestore.rules`, click **Publish**, and confirm the active rules match the file.

Known anti-cheat limitations: browser puzzle completion and Weekly objective eligibility remain client-attested; there is no rate limiter; and a modified client can fabricate gameplay events. The server still controls authoritative balances, prices, tool costs, reward calculations, and permanent entitlements. This is a secure economy boundary, not full gameplay anti-cheat.
