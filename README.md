# Gutter Grin: Puzzle Panic

A dependency-free, mobile-friendly browser puzzle prototype built from the five supplied Gutter Grin artworks.

## Included now

- Five separate launch puzzles in one free Starter Pack.
- Tap/click-to-swap puzzle gameplay that works on desktop and touch screens.
- Easy 3x3, Normal 4x4, Hard 5x5, and Insane 6x6 difficulty levels.
- Timer, move counter, preview button, reshuffle, completion tracking, and coin rewards.
- Guest play with progress saved in browser `localStorage`.
- Shop UI and data structure ready for future paid/coin puzzle packs.
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

The prototype authenticates the player once credentials are added, but game progress is still stored locally. For production cross-device progress, add Firestore/Supabase/Postgres persistence keyed to the authenticated user ID.

## Adding a new puzzle pack

1. Place optimized artwork in `assets/`.
2. Add each puzzle to the `PUZZLES` array in `app.js` with a `pack` ID.
3. Add or update the pack in the `PACKS` array.
4. Set `available: true` when the pack is ready for purchase.
5. Add the new assets to `sw.js` if they should be available offline.

## Production items still needed

- Real store checkout (Stripe, Apple/Google in-app purchase strategy if wrapped as a native app, etc.).
- Server-side entitlement validation for purchased packs.
- Cloud save/sync and account migration from guest to signed-in player.
- Admin/content pipeline for adding packs without editing source code.
- Analytics, privacy policy/terms, moderation/age-rating decisions, and payment/legal review before commercial launch.
# Secure economy development

Authenticated coin and entitlement operations run through Vercel Functions under `/api/economy` and store authoritative state in `economy/{uid}`. Configure `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel; never expose these values through client-prefixed variables. Escaped newlines in the private key are normalized server-side.

For local API testing, configure those variables outside Git and run the project with `vercel dev`. Opening the static files directly cannot provide authenticated `/api` routes; signed-in economy actions will intentionally fail closed, while guest play remains local.

The bootstrap route imports valid economy fields from `users/{uid}/saves/main` only when `economy/{uid}` does not exist. This legacy client-authoritative bridge should be disabled for new production accounts after migration is complete.

Current limitations: completion claims and Weekly objective eligibility remain client-attested, so this foundation limits arbitrary balances/prices and duplicate operations but is not full anti-cheat. Rate limiting and trusted gameplay-event verification remain future work.
