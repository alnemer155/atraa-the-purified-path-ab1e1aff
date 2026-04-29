# Export Compliance — عِتَرَةً (Atraa)

## Encryption usage
The app uses **only** the encryption that is built into the operating system
and standard web/HTTPS stack. Specifically:

- HTTPS / TLS for all network requests, provided by the OS (iOS Network
  framework / Android system trust store) and by `WKWebView`.
- No proprietary, custom, or non-standard cryptographic implementations.
- No end-to-end encryption of user data, no cryptographic key management.

## Apple ITSAppUsesNonExemptEncryption
Set to `false` in `Info.plist`:

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

## US EAR classification
Per **15 CFR § 740.17(b)(1)**, the app falls under the mass-market exemption
because it uses only standard cryptography for authentication and HTTPS
transport. No annual self-classification report is required.

## French declaration
Not required — the app is not making cryptography available beyond what the
underlying OS already provides.
