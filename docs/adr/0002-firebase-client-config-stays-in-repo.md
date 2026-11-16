---
status: accepted
---

# Firebase client config stays in the public repo

`google-services.json` and `GoogleService-Info.plist` are committed to a public repository, and a security audit (#101) suggested moving them to EAS/CI secrets, restricting their API keys and hardening signing. We checked and decided to do none of it. These files hold only the Firebase *client* configuration: project ID and number, app IDs, bundle/package name, storage bucket, AdMob app IDs and an `AIza…` API key. That key identifies the project and is not a secret. The same values ship inside every APK and IPA, so anyone can extract them from the app. They contain no private keys and no OAuth clients.

The keys that matter are not in the repo and never were. The upload keystore is held by EAS, and the app signing key by Google Play App Signing.

## Considered and rejected

- **Moving the Firebase files to EAS/CI secrets.** Nothing secret is being hidden, and it would make local builds and `expo prebuild` more complicated.
- **Restricting the API keys in Google Cloud Console.** The app uses only Analytics and Crashlytics, with no Firestore, Realtime Database or Storage. The worst misuse of the key is junk Analytics events, which is not worth the risk of breaking the app with a wrong SHA-1 or API allowlist.
- **"Release builds are debug-signed".** The `release → signingConfigs.debug` block lives in the generated `android/` project, which is gitignored (Continuous Native Generation). EAS Build replaces it with the EAS-managed keystore.
- **"A keystore leaked in git history".** `android/app/debug.keystore` was committed once (`c9700e0`) and later removed. It is the stock React Native debug key (`CN=Android Debug`, SHA1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, password `android`), which is identical in every RN project and protects nothing.

## Consequences

- Do not reopen this unless one of the following changes. Then revisit this ADR.
  - The app starts using a Firebase product guarded by Security Rules (Firestore, Realtime Database, Storage, Auth). From then on, the rules, not the config, are what needs reviewing.
  - The app starts calling paid Google APIs with this key. In that case, restrict the key.
- Real secrets must never be committed: keystores, `.p8`/`.p12`/`.pem`/`.key` files, and service-account JSON such as the Google Play key used by `eas submit`. `.gitignore` already covers them.
