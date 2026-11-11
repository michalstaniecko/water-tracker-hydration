# Selectable Color Themes

The app does not offer user-selectable accent/color themes (mint, peach, lilac, ocean, ...).

## Why this is out of scope

Styling is done with NativeWind classes against a fixed palette in `tailwind.config.js`. Runtime-switchable accents would mean moving every colored element to CSS variables, maintaining contrast for each theme, and re-checking widgets and charts per theme. The benefit is purely cosmetic.

This does not cover a light/dark mode, which is an accessibility concern and is tracked separately (#49).

## Prior requests

- #51: "Motywy kolorystyczne"
