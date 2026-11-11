# Health Platform Integration (Apple Health / Google Health Connect)

The app does not read from or write to Apple Health (HealthKit), Google Fit or Health Connect.

## Why this is out of scope

Integrating with platform health stores changes how the app is reviewed and positioned. HealthKit apps face stricter App Store review (health data usage descriptions, privacy policy requirements, scrutiny of health claims), and there is a real risk of the app being treated as a health/medical product. The project deliberately stays a simple, local-first habit tracker for drinking water, not a health app, and does not want to take on that regulatory and review burden.

There is also a technical cost: native builds and entitlements on both platforms, permission flows, and the Android side moving from Google Fit to Health Connect.

## Prior requests

- #53: "Integracja z Apple Health / Google Fit"
