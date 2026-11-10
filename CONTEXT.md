# Water Tracker Hydration

A personal hydration tracker: the user logs how much water they drink each day and is motivated by goals, streaks and achievements.

## Language

### Time

**Day**:
A calendar day in the user's local time, from midnight to midnight. The unit in which intake and goals are counted; water logged at 00:30 belongs to the new Day.
_Avoid_: date (when the domain unit is meant)

**Activity Hours**:
The part of the Day (start time to end time) when the user is expected to be awake and drinking. Drives Reminders and Day Progress; it does not change where a Day begins or ends.
_Avoid_: day (for the settings window), waking hours

**Day Progress**:
How much of today's Activity Hours has elapsed, as a percentage. Measures time, not intake.
_Avoid_: goal progress

### Intake

**Daily Intake**:
The total amount of water (in ml) the user logged for a single Day.
_Avoid_: water, amount, consumption

**Drink**:
A single addition of water to a Day's Daily Intake, of any amount. Only the sum of Drinks is kept, as the Daily Intake.
_Avoid_: glass (as a synonym for any drink), entry, log

**Glass**:
The user's default serving size in ml, set in settings. The amount added by the widget, by the Glass Quick Action, and the starting value when picking a custom amount.
_Avoid_: glass capacity, default serving

**Quick Action**:
A named, user-configurable shortcut that adds a fixed amount of water as a Drink. The Glass Quick Action always uses the current Glass size.
_Avoid_: preset, shortcut button

**Daily Goal**:
The amount of water (in ml) the user aims to drink in a Day. Set in settings and recorded on each Day; changing it affects today and later Days only.
_Avoid_: minimum water, minimumWater, target

**Goal Met**:
A Day whose Daily Intake is at least the Daily Goal recorded for that Day. Once a Day is over, its Goal Met status never changes.
_Avoid_: goal achieved, goal reached

### Motivation

**Streak**:
The number of consecutive Goal Met Days ending today or yesterday. Today not yet being Goal Met does not break the Streak.
_Avoid_: chain, run

**Achievement**:
A badge the user unlocks by meeting a condition (first Drink, a Streak length, total intake, etc.). Once unlocked, it stays unlocked permanently.
_Avoid_: badge, trophy, reward

**Retired Achievement**:
An Achievement withdrawn from the catalog: it can no longer be unlocked, but stays visible to users who already unlocked it.
_Avoid_: removed achievement, deprecated achievement

**Activity Feed**:
The in-app history of notable events in the user's hydration journey, such as Achievement unlocks. Lives only inside the app and is never sent to the device.
_Avoid_: notifications, inbox, notification list

**Reminder**:
A system push notification sent during Activity Hours to prompt the user to drink.
_Avoid_: notification (unqualified), alert
