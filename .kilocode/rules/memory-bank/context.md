# Current Context

## 2026-09-02

- **Dependency audit**: removed two direct dependencies that were unused:
  - `is-extglob` — never imported anywhere; still installed transitively via `is-glob` (watchpack/chokidar), so only the direct entry was removed.
  - `sharp` (devDependency) — never imported and redundant because `next` 16 already ships it as an optionalDependency (`^0.34.4`).
  - Updated both `bun.lock` and `package-lock.json` (root entries only; transitive/optional entries retained). Verified `tsc --noEmit` and `next build` pass, and `next start` serves `/login` (HTTP 200) with proxy redirects working. `eslint` still fails on the pre-existing `react-hooks/set-state-in-effect` error in `TransactionContext.tsx` (unrelated to this change).

## 2026-06-20

- **Fixed critical bug**: transaction history data disappearing and amounts showing Rp 0 after reload.
  - Root cause 1 (destructive read): `localGetTransactions()` in `gsheets.ts` always re-wrote normalized data back to localStorage on every read. If normalization produced `amount: 0` from an edge-case format, that `0` was persisted permanently, overwriting the real value.
  - Fix: Changed `localGetTransactions()` to non-destructive read — only re-saves to localStorage if the normalized JSON actually differs from the raw JSON.
  - Root cause 2 (no cross-tab sync): Multiple tabs could overwrite each other's localStorage without any synchronization.
  - Fix: Added `StorageEvent` listener in `TransactionProvider` to detect changes from other tabs/windows.
  - Safety net: Added `sessionStorage` backup mechanism — transactions are periodically backed up to `sessionStorage` (every 30s) and after every mutation. If localStorage is ever cleared, data is automatically restored from the backup on next mount.
  - Also removed Google Sheets integration code from `TransactionContext.tsx` (was already partially removed in working tree) — app now uses localStorage-only storage since `NEXT_PUBLIC_GSHEET_URL` is not set.
- Verified `tsc --noEmit` passes with no errors.

## 2026-05-18

- Changed the local development server default from `http://localhost:3000` to `http://localhost:3001` by updating the `npm run dev` script.
- Added `outputFileTracingRoot` to `next.config.ts` so Next.js uses the project directory as the workspace root instead of the parent user directory when multiple lockfiles exist.
- Fixed dashboard crash showing `Cannot read properties of undefined (reading 'toLocaleString')` by making Rupiah formatting tolerate `undefined`, string amounts, and `NaN` values.
- Added transaction normalization for localStorage and Google Sheets responses so missing/invalid `amount`, `date`, `category`, `description`, and `type` values are coerced to safe defaults before rendering.
- Updated dashboard and report calculations to sum amounts through the safe number helper, preventing bad historical data from turning totals into `NaN`.
- Verified `npm run lint` and `npm run typecheck` pass. `npm run build` compiles successfully but still stops at `spawn EPERM` in the Windows sandbox during Next.js worker execution; external sandbox approval did not complete.
- Started local dev server at `http://localhost:3000`; login API, `/`, and `/report` return HTTP 200 after authenticated test login.

## 2026-05-14 (update 2)

- Updated PWA icons: background pink (#FF69B4), teks "BLP / Scan / Nota" warna hitam (#1a1a1a) menggunakan font Arial Black/Bold. Diperbarui untuk ukuran 192x192 dan 512x512 (SVG + PNG).
- Updated `public/manifest.json`: `name` → "BLP Scan Nota", `short_name` → "BLP Scan", `background_color` dan `theme_color` → "#FF69B4".

## 2026-05-14

- Rebuilt `node_modules` from `package-lock.json` with `npm ci` after the local dependency install was incomplete and missing package files/binaries.
- Removed the local `lucide-react` module override so TypeScript uses the package's official icon exports.
- Refactored `AddTransactionModal` to reset form state by remounting a keyed inner form instead of calling multiple `setState` calls inside an effect.
- Updated `TransactionProvider` initial Google Sheets load to run through an async effect with a cancellation guard.
- Changed the dev script to `next dev --webpack` because Next.js 16 defaults to Turbopack and the PWA plugin contributes webpack configuration.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build` pass. Build/dev require running outside the sandbox on this Windows environment because Next.js worker spawn hits `EPERM` inside the sandbox.
- Started live preview at `http://localhost:3000`; smoke-tested `/`, `/scan`, `/transaksi`, and `/report` with HTTP 200 responses.
- `npm audit` currently reports 7 vulnerabilities: 2 moderate and 5 high.
- Tested scan/OCR behavior with generated receipt images using `tesseract.js`; OCR successfully read item prices and totals including plain numbers and Indonesian rupiah formatting with dot separators. Camera/photo and upload buttons share the same `processImage` OCR path after a file is selected; physical camera picker behavior depends on browser/device because the app uses `<input type="file" capture="environment">`.
- Added a `/login` UI page with email/password fields, password visibility toggle, remembered-session checkbox, CTA, and product benefit cards. Bottom navigation is hidden on `/login`. Verified `npm run lint`, `npm run typecheck`, `npm run build`, and `/login` returns HTTP 200.
- Implemented simple server-side authentication: `/api/auth/login` validates email domain `@blpbeauty.com` and password `Blp123`, sets an `httpOnly` session cookie, and `/api/auth/logout` clears it. Added Next.js 16 `src/proxy.ts` to protect `/`, `/scan`, `/transaksi`, and `/report`, plus a dashboard logout button. Verified bad domain returns 400, bad password returns 401, valid login returns 200, protected dashboard redirects when unauthenticated, and authenticated dashboard returns 200.
- Tested the provided Mommy Laundry receipt text. The original parser read `28,000` as `28` and produced false items from order/date/catatan lines. Updated receipt parsing to understand comma and dot thousand separators, skip metadata/payment-summary lines, and attach price-only service lines to the previous description. The laundry receipt now parses as `Kiloan Cuci One Day` for `28000` with total `28000`. Verified lint, typecheck, and build pass.
- Initialized/pushed the project to `https://github.com/bagasadiprabowo90-prog/Nota-Scanner-V1.git` on branch `main` and deployed production to Vercel project `nota-scanner-v1`. Production alias: `https://nota-scanner-v1.vercel.app`.
