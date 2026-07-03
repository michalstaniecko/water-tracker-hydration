# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in browser

npm test           # Run all tests
npm test -- validation.test.ts              # Run specific test file
npm test -- --testPathPattern=integration   # Run integration tests only
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

npm run lint       # ESLint check
```

## Architecture Overview

### State Management (Zustand + AsyncStorage)
Stores live in `stores/` (water, setup, gamification, statistics, onboarding, backup, notifications, consent).

Pattern: each store exposes `fetchOrInitData()` called from `app/_layout.tsx` on app start. Data is validated/sanitized on load and persisted immediately on update. Inspect `stores/water.ts` for the canonical pattern.

### Navigation (Expo Router)
File-based routing in `app/`:
- `app/_layout.tsx` — root layout, store initialization, ErrorBoundary
- `app/(tabs)/` — bottom tabs: home (`index`), `history`, `statistics`, `achievements`, `setup`
- `app/(tabs)/setup/` — nested stack: `index`, `general`, `backup`, `quick-actions`, `reminders`

### Styling
TailwindCSS via NativeWind. Custom palette in `tailwind.config.js` (pink, blue, green, yellow, purple, orange, mint, lilac, peach, gray).

### Internationalization
i18next in `i18n/`. Languages: `cs, de, en, es, fr, hr, id, it, ja, pl, pt, uk`. For namespaces and keys see `i18n/<lang>/*.json`. Language is auto-detected and overridable in settings.

### Key Directories
- `utils/` — pure helpers. `validation.ts` and `numbers.ts` are kept at 100% test coverage.
- `services/` — side-effectful integrations: Firebase Analytics/Crashlytics, notifications, widgets, consent (GDPR/AdMob).
- `hooks/` — shared React hooks (water, lifecycle, haptics, notification listeners).
- `components/` — feature components at root; UI primitives in `components/ui/`; sub-folders for `ads/`, `onboarding/`, `skeletons/`.
- `widgets/{ios,android}` + `modules/hydration-widget` — native home-screen widgets and the bridging Expo module. See `utils/sharedData.ts` for the data bridge.

### Notable Integrations
- Firebase: `@react-native-firebase/{app,analytics,crashlytics}` — config in `google-services.json` / `GoogleService-Info.plist`.
- AdMob: `react-native-google-mobile-ads` with consent flow in `services/consentService.ts` and UI in `components/ads/`.
- Bottom sheets via `@gorhom/bottom-sheet`; charts via `react-native-gifted-charts`; PDF export via `expo-print` (see `utils/pdfExport.ts`).

## Testing

Jest with `jest-expo` preset. Layout:
- Unit tests co-located in `__tests__/` next to source (`utils/__tests__`, `services/__tests__`, `hooks/__tests__`).
- Integration tests in `__tests__/integration/`; store tests in `__tests__/stores/`.

Clear Jest cache if tests behave unexpectedly: `npm test -- --clearCache`.

## CI/CD

GitHub Actions: `.github/workflows/ci.yml` — lint → test (with coverage) → integration. Triggers on push/PR to `main`/`develop` (note: real branches are `master`/`development` — workflow triggers may need updating).

## Code Review

For code review use the `code-reviewer` agent via the Task tool (`subagent_type: "code-reviewer"`).
