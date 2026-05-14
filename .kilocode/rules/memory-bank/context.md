# Current Context

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
