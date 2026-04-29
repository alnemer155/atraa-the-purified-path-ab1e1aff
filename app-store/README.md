# App Store Submission Package — عِتَرَةً (Atraa)

This folder contains the legal, policy, and metadata files required for
Apple App Store and Google Play Store review. They are intentionally kept
in the repository so the App Store reviewer can audit them at any time.

Version covered: **v2.7.75 · build 196**.

## Files

| File                                | Purpose                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `APP_STORE_DESCRIPTION.md`          | Localized store listing copy (Arabic & English).                        |
| `APP_STORE_PRIVACY_LABELS.md`       | Apple Privacy Nutrition Label declarations (data collected & purpose).  |
| `APP_REVIEW_NOTES.md`               | Reviewer notes — explains religious content, no payments, no accounts.  |
| `CONTENT_RATING.md`                 | Age rating justification (4+).                                          |
| `THIRD_PARTY_LICENSES.md`           | Open-source attributions (fonts, APIs, data sources).                   |
| `EXPORT_COMPLIANCE.md`              | Encryption disclosure (only standard HTTPS, no custom crypto).          |
| `SUNNI_CONTENT_SOURCES.md`          | Authoritative Sunni content provenance (per audit request).             |

## Quick facts for reviewers

- **No accounts required.** Optional sign-in via 6-digit OTP only — anonymous use is fully supported.
- **No payments.** No in-app purchases, subscriptions, donations, ads, or tracking SDKs.
- **No music.** All audio is Quran recitation, Adhan, or Khutba (live broadcast) only.
- **Religious content.** App serves both Sunni and Shia (Twelver Ja'fari) Muslims;
  sect is selectable on first launch and switchable later.
- **Sources.** All text content is sourced from classical, mainstream Islamic
  scholarship (Bukhari, Muslim, Mafatih al-Jinan, Hisn al-Muslim, etc.).
  See `SUNNI_CONTENT_SOURCES.md`.
- **Permissions.**
  - Location (when-in-use) — Qibla direction & prayer times.
  - Notifications — optional Adhan reminders.
  - No camera, microphone, contacts, photos, or background location.

## Contact

Developer: ABJ Dev — abj-dev.xyz
Support email: support@atraa.xyz
