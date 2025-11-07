# Water Tracker Hydration

Water Tracker Hydration is a React Native application built with Expo that helps users track their daily water intake and maintain proper hydration. The app runs smoothly on Android, iOS, and web browsers, leveraging modern technologies and tools for efficient development and an excellent user experience.

## Features

- Track daily water intake
- Interactive onboarding for new users
- **Gamification system with achievements and streaks**
- **Achievement badges and milestones**
- **In-app notifications for achievements**
- **Streak tracking to maintain hydration habits**
- Localization support powered by `i18next`
- Smooth animations using `react-native-reanimated`
- Styling with TailwindCSS (`nativewind`)
- Google Mobile Ads integration
- Optimized for both tablets and mobile devices

## Tech Stack

- **React Native**: Framework for building cross-platform mobile apps.
- **Expo**: Platform and set of tools for developing React Native apps.
- **TypeScript**: Strongly typed language for enhanced code quality.
- **TailwindCSS**: Utility-first CSS framework (via `nativewind`).
- **Zustand**: Lightweight state management library.
- **React Navigation**: Navigation library for React Native apps.
- **React Native Reanimated**: Advanced animation library for smooth UI effects.
- **i18next**: Internationalization and localization library.
- **Google Mobile Ads**: Monetization and ad integration.

## Installation

1. Make sure you have [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and [Expo CLI](https://docs.expo.dev/get-started/installation/) installed:

   ```bash
   npm install -g expo-cli
   ```

2. Clone the repository:

   ```bash
   git clone https://github.com/michalstaniecko/water-tracker-hydration.git
   cd water-tracker-hydration
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the app:

   ```bash
   # Start the project with Expo Go
   npm start
   # Or run on a specific platform:
   npm run android
   npm run ios
   npm run web
   ```

## Project Structure

- `app.json` & `package.json` — Project and dependency configuration
- `scripts/` — Additional scripts (e.g., project reset)
- `assets/` — Icons, splash screens, images
- `stores/` — Zustand state management stores
- `components/` — Reusable UI components
- `i18n/` — Internationalization translations
- `docs/` — Documentation (see [GAMIFICATION.md](./docs/GAMIFICATION.md) for gamification features)

## Gamification Features

The app includes a comprehensive gamification system to boost user engagement and retention:

- **11 Achievements**: Unlock badges for various milestones (streaks, total water consumed, perfect weeks)
- **Streak Tracking**: Monitor consecutive days of meeting your hydration goals
- **In-App Notifications**: Get notified when you unlock new achievements
- **Progress Visualization**: See your achievements and streak on the home screen
- **Dedicated Achievements Tab**: Browse all locked and unlocked achievements

For detailed information about the gamification system, see [docs/GAMIFICATION.md](./docs/GAMIFICATION.md).

## Useful Scripts

- `npm start` — Launch the Expo development server
- `npm run android` — Run the app on Android
- `npm run ios` — Run the app on iOS
- `npm run web` — Run the app in the browser
- `npm test` — Run unit tests
- `npm run lint` — Check code style and linting

## License

This project is licensed under the MIT License.  
You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, as long as the original copyright
and permission notice are included in all copies or substantial portions of the software.

See the [LICENSE](./LICENSE) file for more details.

---

Created by [michalstaniecko](https://github.com/michalstaniecko)
