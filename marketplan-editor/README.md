# Marketplan Editor MVP

Professioneller Grundriss- und Marktplan-Editor (MVP) mit React, TypeScript, Vite, Tailwind, Zustand und React Konva.

## Start

```bash
npm install
npm run dev
```

> Wichtig: **nicht** die `index.html` per Doppelklick öffnen. Das ist eine Vite-App und muss über den Dev-Server laufen.

## Bei weißer Seite (Troubleshooting)

1. Prüfen, ob du die Datei direkt per `file://.../index.html` geöffnet hast.
2. Falls ja: Terminal im Ordner `marketplan-editor` öffnen.
3. `npm install` und danach `npm run dev` ausführen.
4. Die im Terminal angezeigte URL (meist `http://localhost:5173`) im Browser öffnen.

## MVP-Funktionen

- Neues Projekt mit rechteckigem Grundriss in **cm**
- Grid + Snap-to-Grid
- Objektbibliothek (Regale, Kühlmöbel, Kassen ...)
- Drag & Drop aus Bibliothek auf Canvas
- Auswahl, Multi-Select (Shift-Klick), Drag, Resize, Rotate
- Eigenschaftenpanel mit exakten numerischen Werten
- Flächen-/Volumenberechnung in cm²/m² und cm³/m³
- Undo/Redo + Copy/Paste + Delete Shortcuts
- Kollisionshighlight (rote Kontur) und Distanz-Metadaten
- JSON Export/Import
- Lokale Persistenz (localStorage)

## Architektur

- `src/store`: Zustand-Store, Historie, Commands
- `src/components`: Editor-Layout, Toolbar, Canvas, Sidebars
- `src/utils`: Geometrie, Snap, Storage
- `src/types`: Domain-Modell
- `src/data`: Objektbibliothek / Templates

## Nächste Profi-Schritte

1. Wände/Türen/Fenster als eigene Geometrieklassen
2. Mehrere Räume und Etagen mit Layer-Management
3. Automatische Bemaßung und präzise Snaps (Kante/Mitte/Objekt)
4. PDF-/PNG-Export direkt aus Stage
5. DXF-/SVG-Serializer
6. Rollen-/Benutzer- und Cloud-Storage
