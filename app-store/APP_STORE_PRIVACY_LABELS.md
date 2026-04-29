# Apple Privacy Nutrition Label — عِتَرَةً (Atraa)

Submission as of v2.7.75 / build 196.

## Data Used to Track You
**None.** The app does not link any data to third-party data for advertising or
analytics, and does not share data with data brokers.

## Data Linked to You
**None.** The app does not link any collected data to a user identity.

## Data Not Linked to You

The following data may be processed locally on the device and is **not**
transmitted to our servers in a way that links it to the user:

| Data Type           | Purpose                          | Linked? | Used for tracking? |
| ------------------- | -------------------------------- | ------- | ------------------ |
| Coarse Location     | Compute prayer times & Qibla     | No      | No                 |
| Approximate Location| Auto-detect city for prayer calc | No      | No                 |
| Diagnostics (crash) | App functionality (optional)     | No      | No                 |

### Notes for the Apple reviewer

- Location is requested **when-in-use** only. It is used solely on-device to
  compute prayer times (via Adhan.js) and the Qibla bearing. Coordinates are
  cached in `localStorage` for 30 minutes and never uploaded to our servers.
- The app supports a fully **anonymous mode** — no account is required to use
  any feature.
- An optional 6-digit OTP sign-in via Supabase exists for users who want their
  preferences to sync across devices. Email is collected only with explicit
  consent. There is **no** social OAuth.
- No third-party advertising SDKs, no tracking SDKs, no analytics SDKs that
  collect personal identifiers.

## Permissions Requested

| iOS Permission Key             | Reason String (purpose)                                   |
| ------------------------------ | --------------------------------------------------------- |
| `NSLocationWhenInUseUsageDescription` | لحساب أوقات الصلاة واتجاه القبلة بدقّة وفق موقعك. |
| `NSUserNotificationsUsageDescription` | لإرسال تذكيرات الأذان عند بداية كل وقت صلاة.      |

No other privacy-sensitive permissions are requested.
