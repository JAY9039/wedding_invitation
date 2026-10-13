# Gwalior wedding invitation

A standalone, mobile-friendly invitation inspired by the requested Dreams Invite reference. The existing portfolio is unaffected.

## Preview locally

From this directory run `npm run dev`, then open http://127.0.0.1:4173.
No installation or build is required. Deploy the contents of `dist` to any static host.

## Details still needed

Edit `dist/invite-config.js` to enter the bride's and groom's English/Hindi names, confirmed year, and wedding start time (`HH:MM`, India time). Names currently use explicit bride/groom placeholders. The year is omitted and wedding time reads “Time to be announced”; calendar download and countdown activate only when a year is supplied.

## Included

- Invitation-opening animation; original palace illustration; indigo, ivory and gold styling.
- English/Hindi switch, two celebration cards, both full venue addresses and Google Maps links.
- Local RSVP message preparation and preview, followed by a WhatsApp link to +91 9039887856. Nothing is sent automatically or stored by the site.
- Optional original ambient chimes, enabled only by a guest's click.
- Calendar file for both celebrations when the year is set. Shaadi remains an all-day calendar event until its start time is supplied; no event duration is invented.
- Keyboard focus handling and reduced-motion support.

The custom illustration is decorative, not a depiction of either venue. `dist/assets/palace-prompt.md` records the exact generation brief and built-in image-generation mode. Web fonts load from Google Fonts, with system fallbacks.

## Verification

Both JavaScript modules pass `node --check`. Desktop and phone-width browser QA covered the invitation, language switching, RSVP preview and recipient, map links, image loading, and horizontal overflow. No actual RSVP was sent.

Sites registration and static output configuration are in `.openai/hosting.json`. The initial hosted version is owner-private; guests need public sharing enabled before it can serve as the distributed wedding invite.
