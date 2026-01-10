# DESPS Public Alert (sal_public_alerts)

Custom lb-phone app for broadcasting official emergency alerts to all players.

## Installation

1. Copy `sal_public_alerts` into your resources folder.
2. Import `sql/install.sql` into your database.
3. Ensure dependencies are running:
   - `es_extended`
   - `lb-phone` (2.5.1)
   - `oxmysql`
   - Optional: `xsound`
4. Ensure `lb-phone` starts before this resource:

```
ensure lb-phone
ensure sal_public_alerts
```

## Configuration

Edit `shared/config.lua`:

- **Config.Senders**: list of job/grade combos that can send alerts.
- **Config.AcePermission**: optional ace permission for senders.
- **Config.RateLimit**: sender and global cooldown limits.
- **Config.Alert**: length limits and allowed severities.
- **Config.HistoryLimit**: number of alerts loaded on app open.
- **Config.Sound**: xSound usage and volume.
- **Config.Logging**: enable logs and debug output.
- **Config.App.Icon**: app icon asset used by the phone and notifications.

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

## Troubleshooting

- **No sound**: install `xsound` or verify the NUI sound file path (`ui/sounds/alert.ogg`).
- **No app**: ensure `lb-phone` is started before `sal_public_alerts`.
- **Permissions**: confirm the job/grade or ace permission matches your setup.
