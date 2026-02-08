# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in browser

npm test           # Run all tests
npm test -- validation.test.ts    # Run specific test file
npm test -- --testPathPattern=integration   # Run integration tests only
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

npm run lint       # ESLint check
```

## Architecture Overview

### State Management (Zustand Stores)
All state is managed via Zustand stores in `stores/` with AsyncStorage persistence:

- **water.ts** - Core hydration tracking: daily water intake, history by date
- **setup.ts** - User preferences: glass capacity, daily goal, day start/end hours, language
- **gamification.ts** - Achievement system: 11 achievements, streak tracking, in-app notifications
- **statistics.ts** - Analytics: weekly/monthly stats, streak calculations
- **onboarding.ts** - First-time user onboarding flow state
- **backup.ts** - Data backup/restore: automatic daily backups, JSON/CSV export/import

Store pattern: Each store has `fetchOrInitData()` that loads from AsyncStorage on app start. Data is validated/sanitized on load. Updates persist immediately to AsyncStorage.

### Navigation (Expo Router)
File-based routing in `app/`:
- `app/_layout.tsx` - Root layout, initializes all stores on mount
- `app/(tabs)/` - Bottom tab navigation (index/home, history, statistics, achievements, setup)
- `app/(tabs)/setup/` - Nested stack for settings screens (general, backup)

### Styling
- TailwindCSS via NativeWind (`global.css`, `tailwind.config.js`)
- Custom color palette defined in `tailwind.config.js` (pink, blue, green, yellow, purple, orange, mint, lilac, peach)

### Internationalization
- i18next with namespaced translations in `i18n/` (en, pl)
- Namespaces: translation, tabs, setup, onboarding, gamification, languages
- Language detection from device, overridable in settings

### Key Utilities (`utils/`)
- **validation.ts** - Input sanitization functions (100% test coverage)
- **numbers.ts** - Rounding utilities (100% test coverage)
- **backup.ts** - CSV/JSON conversion for data export/import
- **date.ts** - Date formatting with dayjs
- **errorLogging.ts** - Centralized error logging

### Component Patterns
- UI primitives in `components/ui/` (Button, Input, Card, Modal, Picker)
- Feature components at `components/` root (WaterInputSection, HeaderAchievementBadge, AchievementsList)
- ErrorBoundary wrapper used at app root for crash handling
- Bottom sheet modals via @gorhom/bottom-sheet

## Testing

Tests use Jest with jest-expo preset. Structure:
- Unit tests: `utils/__tests__/*.test.ts`
- Integration tests: `__tests__/integration/`

Clear Jest cache if tests behave unexpectedly: `npm test -- --clearCache`

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Lint job - runs on push/PR to main/develop
2. Test job - unit tests with coverage
3. Integration job - runs after lint/test pass

## Code Review

When code review is requested, use the `code-reviewer` agent via the Task tool:

```
Task tool with subagent_type: "code-reviewer"
```

The code-reviewer agent specializes in:
- Code quality analysis
- Security vulnerability detection
- Best practices validation
- Static analysis and design patterns
- Performance optimization suggestions
- Maintainability assessment and technical debt identification
