# Jay & Sneha's wedding invitation

A standalone, mobile-friendly invitation inspired by the requested Dreams Invite reference. The existing portfolio is unaffected.

## Preview locally

From this directory run `npm run dev`, then open http://127.0.0.1:4173.
No installation or build is required. The public invitation is [sharmaji-ki-shaadi.vercel.app](https://sharmaji-ki-shaadi.vercel.app/); deploy the contents of `dist` there to update it.

## Personalization

`dist/invite-config.js` contains Jay and Sneha's names in English/Hindi, the confirmed year (2026), and wedding start time (`20:00`, India time). Jay appears first throughout, as requested for the groom's family invitation. Both sets of parents are included in `dist/index.html`. Engagement: 24 November at 11 AM onwards; Shaadi: 25 November at 8 PM onwards.

## Included

- Invitation-opening animation; original palace illustration; indigo, ivory and gold styling.
- Carousel-like scroll reveals across the invitation, calendar, celebration cards, and RSVP; respects reduced-motion preferences.
- English/Hindi switch, a November calendar highlighting both celebrations, and an alternating two-day timeline with event times, venue addresses, and Google Maps directions.
- Local RSVP message preparation and preview, followed by a WhatsApp link to +91 9039887856. Nothing is sent automatically or stored by the site.
- Optional looping background music from `dist/assets/tune.mp3`, enabled only by a guest's click.
- Keyboard focus handling and reduced-motion support.

The custom illustration is decorative, not a depiction of either venue. The optimized 1200 × 630 social preview reuses this artwork and invitation styling. Open Graph and Twitter metadata use the public Vercel URL and serve the preview from the same site. Web fonts load from Google Fonts, with system fallbacks.

## Verification

Both JavaScript modules pass `node --check`. Desktop and phone-width browser QA covered the invitation, language switching, RSVP preview and recipient, map links, image loading, and horizontal overflow. No actual RSVP was sent.
