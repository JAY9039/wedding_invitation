# Digital Wedding Invitation App

This repository contains the code and assets for a dual-language (English and Hindi) digital wedding invitation. The application runs independently as a local web project, featuring customizable event details, a countdown, and an interactive celebration reply that guests can share through WhatsApp.

## Technical Setup & Running the App

This folder contains the complete wedding invitation project, including all code and artwork. You can copy this entire folder to another location or computer.

1. Open this folder in VS Code, or double-click `my_wedding_invitation.code-workspace`.
2. Ensure **Node.js** is installed on your system.
3. Open the VS Code terminal and run `npm run dev`.
4. Open `http://127.0.0.1:4173` in your browser.

**Note:** No `npm install` or build step is required. Stop the preview with `Ctrl+C` in the terminal. Use the local server instead of double-clicking `dist/index.html` because the invitation uses JavaScript modules.

## Directory Structure & Where to Edit

- `dist/index.html`: Invitation text, family details, event cards, and venues.
- `dist/styles.css`: Colors, typography, and responsive layout.
- `dist/invite-config.js`: Couple's names, year, wedding time, and WhatsApp contact.
- `dist/app.js`: Language switch, countdown, celebration reply, and music logic.
- `dist/assets/`: Original palace artwork, lotus icon, and social preview image.
- `server.mjs`: The local preview server.
- `README.md`: Further project details.

_Note: Google Fonts and external WhatsApp/Maps links use the internet. System fonts are available as a fallback._
