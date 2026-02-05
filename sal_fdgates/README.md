# sal_fdgates

## Abhängigkeiten
- `es_extended`
- `ox_lib`
- `xsound`
- `ox_target`

## Setup
1. Resource starten.
2. Command ausführen: `/fdgates`.
3. Türen/Panels im Menü verwalten.

## Command
- `/fdgates` öffnet das komplette UI-Menü.

## Menüfunktionen
- Einzelne Tore öffnen/schließen/toggle
- Alle Tore öffnen/schließen
- Panel-Liste mit Waypoint
- Editor-Bereich (rechtebasiert)

## Editor
- Editor im Menü an/aus
- Raycast-Highlight aktiv nur im Editor
- `E` auf anvisierte Entity: Tür hinzufügen
- Panel setzen: `door`, `all`, `red`
- Tür/Panel löschen über ID im Menü
- Panel-Preview im Menü an/aus

## Sound
- Tür-Beep bei echtem Statuswechsel
- Roter Knopf: Alle Tore öffnen + Wachen-Alarm (3D)
- xSound-Quellen in `config.lua` konfigurieren

## Persistenz
- Türen, Panels, States in `doors.json` via `LoadResourceFile` / `SaveResourceFile`
