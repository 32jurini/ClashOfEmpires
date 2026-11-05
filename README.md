# Clash of Empires — first prototype

This prototype has an account setup screen, an isometric village, selectable buildings, resource buttons, and local weather visuals.

## Open it

Open the project with a local web server, such as the VS Code **Live Server** extension. The JavaScript files use browser modules, so opening `index.html` directly may not work.

## Current limits

- The account works only as a browser demo. Passwords are not saved or sent anywhere.
- Online accounts, friends, clans, shared villages, and owner admin tools are not connected yet.
- The weather uses the chosen city. Rain and snow are visual only.
- Resource buttons and building controls are not saved yet.

The full multiplayer game will need a secure authentication server and database. `online.js` and `database.sql` are placeholders for that future connection. Do not use a real password in this prototype.
