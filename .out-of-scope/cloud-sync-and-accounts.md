# Cloud Sync and User Accounts

The app has no user accounts and no server-side storage. Data lives on the device.

## Why this is out of scope

Cloud sync requires authentication (email, Google, Apple sign-in), a hosted database, conflict resolution between devices, offline queuing, account deletion and data-export flows, plus the GDPR obligations of holding users' health-related data on a server. That is a permanent backend and compliance cost for a local-first habit tracker.

The main user problem, losing data when changing phones, is addressed by the local backup/restore feature (`stores/backup.ts`, `utils/backup.ts`, setup → backup).

## Prior requests

- #54: "Synchronizacja w chmurze (Cloud Sync)"
