# Open your wedding invitation in VS Code

This folder contains the complete wedding invitation project, including all code, artwork, preview screenshot, and deployment archive. It runs independently of the portfolio project. You can copy this entire folder to another location or computer.

1. Open this folder in VS Code, or double-click `my_wedding_invitation.code-workspace`.
2. Make sure Node.js is installed.
3. Open the VS Code terminal and run `npm run dev`.
4. Open http://127.0.0.1:4173 in your browser.

No `npm install` or build step is required. Stop the preview with Ctrl+C in the terminal. Use the local server instead of double-clicking `dist/index.html`, because the invitation uses JavaScript modules.

## Where to edit

- `dist/index.html`: invitation text, family details, event cards, and venues.
- `dist/styles.css`: colours, typography, and responsive layout.
- `dist/invite-config.js`: couple's names, year, wedding time, and RSVP number.
- `dist/app.js`: language switch, countdown, calendar download, RSVP, and music.
- `dist/assets/`: original palace artwork, lotus icon, and image-generation prompt.
- `server.mjs`: the local preview server.
- `README.md`: further project details.

Google Fonts and external WhatsApp/Maps links use the internet. System fonts are available as a fallback. The original project's Git history and Sites configuration are included; copying this folder does not create or change the hosted site.
