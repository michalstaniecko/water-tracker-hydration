# Progress-Based Reminders

Reminders are not tailored to the user's Daily Intake progress (no "urgent" escalation when behind, no congratulation push when Goal Met, no separate morning-Streak / evening-catch-up Reminders).

## Why this is out of scope

Reminders already adapt to behaviour: `calculateSmartNotificationTimes` in `services/notificationService.ts` anchors the schedule to the last Drink within Activity Hours, so a user who is drinking regularly gets fewer prompts. That covers the core problem ("fixed every-X-hours reminders ignore context").

The rest of the proposal adds message variants and escalation rules on top of a scheduler that has to pre-schedule local notifications ahead of time. Escalation based on intake would require rescheduling on every Drink and on every Day rollover, across iOS and Android background limits, for a modest gain. Congratulation messages belong in the in-app experience (Achievements), not in system push notifications.

## Prior requests

- #46: "Inteligentne przypomnienia bazowane na postępie"
