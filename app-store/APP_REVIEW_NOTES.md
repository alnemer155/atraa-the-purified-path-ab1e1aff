# App Review Notes — عِتَرَةً (Atraa)

Hello reviewer — thank you for reviewing our submission. The following notes
should answer the most common review questions.

## What the app does
Atraa is a free Islamic prayer-times and Quran app primarily targeted at
Arabic-speaking Muslims. It provides:

- Daily prayer times calculated on-device from the user's location.
- A live Qibla compass.
- The full Quran (Madinah Mushaf) with classical tafsirs and renowned reciters.
- A library of authentic duas and adhkar.
- Optional Adhan notifications.

## Account / sign-in
- **No account is required.** Every feature works in anonymous mode.
- For users who *want* to sync preferences, we offer a passwordless 6-digit OTP
  sign-in (via email). There is no password and no social OAuth.
- Test credentials are not needed because guest mode exposes 100% of features.

## Monetization
- The app is **completely free**.
- No in-app purchases, no subscriptions, no advertising, no donation flows.

## Religious content disclosure
- Atraa serves both **Sunni** and **Shia (Twelver Ja'fari)** Muslims.
- On first launch the user picks their school of thought (madhhab); they can
  change it later by answering 3 easy general-knowledge questions (a friction
  step, not a doctrinal test).
- All content is sourced from classical, mainstream scholarship — see
  `SUNNI_CONTENT_SOURCES.md` for the full citation list (Bukhari, Muslim,
  Hisn al-Muslim, etc., for the Sunni section; Mafatih al-Jinan, al-Sahifa
  al-Sajjadiyya, etc., for the Shia section).
- The in-app legal disclaimer makes clear that the app is **not a fatwa
  service** and does not replace qualified scholars.

## Live broadcasts
We embed the **official** YouTube live channels of the Saudi Broadcasting
Authority (SBA) — Al-Masjid al-Haram (Makkah) and Al-Masjid al-Nabawi
(Madinah). These are first-party Saudi government broadcasts of Quran
recitation, Adhan, and Khutba. No music is broadcast.

## Encryption / export compliance
We use only standard HTTPS via the OS's native TLS stack. No proprietary
cryptography. See `EXPORT_COMPLIANCE.md`.

## Background activity
No background location. No background audio. The optional Adhan reminders use
local notifications scheduled in advance via `LocalNotifications`.

## Contact
- Reviewer technical contact: support@atraa.xyz
- Developer: ABJ Dev — abj-dev.xyz
