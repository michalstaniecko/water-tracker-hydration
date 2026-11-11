# Different Daily Goals per Weekday

The app has a single Daily Goal setting. It does not support a separate goal for each day of the week (e.g. higher on training days).

## Why this is out of scope

The real problem behind this request (a user's needs vary, and changing the goal used to re-score all history) is solved by recording the Daily Goal on each Day (ADR-0001, #124). After that, a user can raise or lower the Daily Goal whenever they like and it only affects today and later Days; past Days keep their recorded goal.

A weekly schedule on top of that would add a 7-field settings screen, translations for every supported language, UI to explain why today's goal differs, and widget/statistics cases to test, for a niche use case. Most users set one goal and keep it.

If this is ever reconsidered, the change is small after ADR-0001: when a new Day is recorded, take the goal for that weekday instead of the single setting.

## Prior requests

- #52: "Zaawansowane cele dzienne per dzień tygodnia"
