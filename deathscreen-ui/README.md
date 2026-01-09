# San Andreas Legacy - Loadingscreen

Performanter FiveM Loadingscreen basierend auf dem Figma-Design.

## Installation

1. Ordner `deathscreen-ui` in deinen `resources`-Ordner legen (du kannst ihn z. B. in `sal_loadingscreen` umbenennen).
2. In der `server.cfg` sicherstellen, dass die Resource gestartet wird:
   ```cfg
   ensure deathscreen-ui
   ```
3. Optional (empfohlen) den Busy-Spinner deaktivieren:
   ```cfg
   setr sv_showBusySpinnerOnLoadingScreen false
   ```

## Assets ersetzen

- Video (inkl. Audio): `html/assets/video/background.mp4`

## Hinweise

- Cursor ist während des Loadingscreens aktiv (`loadscreen_cursor 'yes'`).
- Das Beenden des Loadingscreens wird manuell im `client.lua` gesteuert.
