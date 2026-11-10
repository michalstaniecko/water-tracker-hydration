---
status: accepted
---

# Record the Daily Goal on each Day

The Daily Goal used to be a single global setting with no history, so Goal Met was always judged against the *current* goal. Changing the goal re-scored every past Day: raising it wiped out Streaks, and lowering it could inflate a Streak enough to unlock Achievements instantly. We now record the Daily Goal on each Day, and Goal Met is judged against the goal recorded for that Day, so history stays fixed.

## Consequences

- Today's recorded goal follows the setting: changing the Daily Goal applies to today and later Days only. Past Days keep their goal.
- Days recorded before this change have no goal. On migration they are backfilled once with the Daily Goal in force at that moment. This is a best guess, not a real record, but it freezes them so later goal changes no longer re-score them.
- Achievements already unlocked stay unlocked, even if their conditions would not hold under the recorded goals.
- Backups and imports must carry the per-Day goal. Older backup files without it fall back to the same backfill rule.
