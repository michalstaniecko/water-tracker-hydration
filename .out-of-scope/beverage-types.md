# Beverage Types and Hydration Factors

The app tracks water only. It does not distinguish drink types (tea, coffee, juice) or weight them by a hydration factor.

## Why this is out of scope

The domain model keeps only the **Daily Intake** per Day; individual Drinks are summed and not stored (see `CONTEXT.md`). Beverage types would require storing every Drink as a typed record, migrating all existing history, and changing backup/import, widgets, statistics and Achievement checks to work with weighted sums.

Hydration factors are also contested and would put the app in the position of giving nutritional guidance. The product is a simple water-intake habit tracker; users who drink other beverages can log the amount they consider equivalent.

## Prior requests

- #50: "Śledzenie różnych typów napojów"
