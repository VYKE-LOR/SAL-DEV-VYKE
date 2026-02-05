# sal_fdgates

Server-authoritative Fire Department Gate Resource für ESX Legacy mit JSON-Persistenz, optionalen `ox_target` Panels und Ingame-Editor.

## Abhängigkeiten
- `es_extended`
- `xsound`
- optional `ox_target`

## Features
- Einzelne Tore öffnen/schließen
- Alle Tore auf einmal öffnen/schließen
- Vollsync für alle Spieler inkl. Spät-Joiner
- xSound positional Beep bei Statuswechsel
- Ingame-Editor mit Raycast-Pick + 3D-Highlight + Panel-Platzierung
- JSON Speichern/Laden via `SaveResourceFile` und `LoadResourceFile`

## Commands
### Betrieb
- `/fdgate <id> open`
- `/fdgate <id> close`
- `/fdgate all open`
- `/fdgate all close`

### Editor
- `/fdgeditor` (Editor an/aus)
- `/fdgatedeldoor <id>`
- `/fdgatepanel door <doorId>`
- `/fdgatepanel all`
- `/fdgatedelpanel <panelId>`

## Editor-Steuerung
1. Editor per `/fdgeditor` aktivieren.
2. Mit Kamera auf gewünschte Tür/Objekt zielen.
3. `E` drücken, um aktuelle Entity als neue Door zu speichern.
4. Panel setzen:
   - `/fdgatepanel door <doorId>` oder `/fdgatepanel all`
   - Auf Zielposition schauen und `E` drücken.
5. Löschen über Delete-Commands.

Wenn `Config.Editor.Enabled = false`, sind alle Editor-Funktionen serverseitig blockiert.

## xSound Hinweis
`Config.Sound.Url` muss auf eine verfügbare Soundquelle zeigen (z. B. direkte URL oder von xSound auflösbare Quelle). Das Resource nutzt pro Schaltvorgang einen eindeutigen Sound-Key, setzt Reichweite und zerstört den Sound nach `DestroyMs`, damit keine Instanzen hängen bleiben.

## Konfiguration
In `config.lua`:
- `FireJob`, `MinGrade`
- `AdminGroups`
- `DefaultDoorRate`, `DefaultOpenRatio`
- `Sound` (`Url`, `Identifier`, `Volume`, `Distance`, `DestroyMs`)
- `Editor` (`Enabled`, `AllowEveryone`, `AllowJob`)
