# vyke_spawnreset

Kleines ESX/FiveM Resource, das **nur beim ersten Spawn nach Server-Restart** den Spieler nach ~3 Sekunden auf die korrekte Bodenhöhe setzt.

- X/Y Position bleibt gleich.
- Nur Z (Höhe) wird auf Ground-Level korrigiert.
- Hilft gegen das "durch die Welt fallen" direkt nach Character-Spawn (z. B. mit `um_multicharacter`).

## Installation

1. Ordner `vyke_spawnreset` in deinen `resources`-Ordner legen.
2. In `server.cfg` sicherstellen, dass ESX und Multi-Character davor starten:

```cfg
ensure es_extended
ensure um_multicharacter
ensure vyke_spawnreset
```

## Konfiguration

In `config.lua`:

- `Config.DelayMs = 3000` → Delay nach Spawn (3 Sekunden)
- `Config.MaxGroundChecks` / `Config.GroundCheckIntervalMs` → wie oft Ground-Z gesucht wird
- `Config.GroundOffset` → kleiner Offset über dem Boden

## Hinweis

Das Script triggert absichtlich nur **einmal pro Client-Session** (nach Restart/Join), damit normale Respawns nicht beeinflusst werden.
