# Security Review

## Summary

The current local `dist` has no guest-details form and no fixed WhatsApp
recipient. The local privacy changes pass the checks listed below. The live
Vercel deployment is still serving an older version and must be updated before
the production site reflects those protections.

## Findings

| # | Severity | File | Lines | Finding | Confidence |
|---|----------|------|-------|---------|------------|
| 1 | 🟡 MEDIUM | Live Vercel deployment (`dist/invite-config.js`) | 9 | The deployed configuration still publishes the fixed WhatsApp recipient removed from the current local source. This can expose the recipient to unwanted contact or spam. Deploy the current `dist`; consider the recipient exposed and change it if spam is a concern. | 9/10 |

## Remediation and verification

- Removed the fixed recipient from the local invitation configuration. The
  wishes link now lets each guest choose a recipient.
- Removed the specific stale `wedding-invite.tar.gz` archive from the local
  workspace; it contained superseded hosting and prompt files and old
  configuration. Do not distribute old copies of that archive.
- Local checks passed: `npm run check`, `node --check server.mjs`,
  `git diff --check`, required static asset checks, and browser checks for the
  wishes link, absence of guest-detail fields, language switching, and
  320-pixel viewport overflow.
- No deployment was performed. The live site must be redeployed from the
  current `dist` and rechecked before it can be considered production-ready.

## Privacy notes

The current site does not submit guest names or guest counts. As with any
hosted site, the hosting provider receives ordinary request metadata, and
external services receive requests when guests choose to open them. This review
does not claim zero data is processed by those providers.
