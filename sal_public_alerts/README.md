# DESPS Public Alert (sal_public_alerts)

Custom lb-phone app for broadcasting official emergency alerts to all players.

## Installation

1. Copy `sal_public_alerts` into your resources folder.
2. Import `sql/install.sql` into your database.
3. Ensure dependencies are running:
   - `es_extended`
   - `lb-phone`
   - `oxmysql`
   - Optional: `lb-nativeaudio` or `xsound`
4. Add to your `server.cfg`:

```
ensure sal_public_alerts
```

## Configuration

Edit `shared/config.lua`:

- **Config.Senders**: list of job/grade combos that can send alerts.
- **Config.AcePermission**: optional ace permission for senders.
- **Config.RateLimit**: sender and global cooldown limits.
- **Config.Alert**: length limits, default severity, categories.
- **Config.OfflineReplayNotification**: replay notifications for alerts missed while offline.
- **Config.Sound**:
  - `system`: `native`, `xsound`, or `nui`.
  - `name`: sound name (for lb-nativeaudio) or file name for NUI.
  - `url`: optional URL for xSound or NUI.
  - `volume`, `durationMs`, `repeatSound` settings.

## Sender Permissions

V1 default: `gov` grade >= 9 can send alerts. Adjust `Config.Senders` or add an ACE permission:

```
add_ace group.admin sal.publicalerts.send allow
```

## Phone Integration

The app is registered as a default lb-phone custom app:

- Identifier: `sal_desps_public_alert`
- Label: `DESPS Public Alert`
- Icon: `fa-triangle-exclamation`

## Commands

- `/alerttest` (sender-only) — sends a local test alarm.
- `/alertsend [title] [message...]` (sender-only) — quick send.

## Troubleshooting

- **No sound**: make sure `lb-nativeaudio` or `xsound` is installed and configured, or switch to `nui` and supply `ui/sounds/desps_critical_alarm.ogg`.
- **No app**: ensure `lb-phone` is running and the resource started after it.
- **Permissions**: confirm the job/grade or ace permission matches your setup.
