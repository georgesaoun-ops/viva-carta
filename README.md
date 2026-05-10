# Viva Carta — Digital Invitation System

## How it works

One codebase, infinite clients.

`viva-carta.com?georges-and-yara`
→ loads `invitations/georges-and-yara.json`
→ renders a fully personalized invitation

---

## File structure

```
/
├── index.html                   ← the shared template (never edit per client)
├── app.js                       ← the engine (reads URL, loads config, injects data)
└── invitations/
    ├── georges-and-yara.json    ← client config
    ├── john-and-sara.json       ← client config
    └── ...
```

---

## Adding a new client

1. **Create the config file**
   Copy an existing JSON from `invitations/`, rename it `firstname-and-firstname.json`, and fill in their details.

2. **Upload their assets** (photos, music, venue image)
   Put them at the repo root (same level as index.html).
   Reference them by filename in the JSON (e.g. `"landingImage": "sara-john-cover.jpeg"`).

3. **Generate their guest links**
   Each guest link is encoded like your current system:
   ```
   base64( "GuestName|NumSeats|SECRET" )
   ```
   The SECRET must match the `"secret"` field in their JSON.
   Example: `btoa("Jihad Aoun|6|GY2026SECRET")` → append as `?georges-and-yara&c=BASE64HERE`

4. **Push to GitHub** → done. No other changes needed.

---

## Config fields reference

| Field | Description |
|-------|-------------|
| `secret` | Token secret for this couple's guest links |
| `scriptUrl` | Google Apps Script URL for RSVP submissions |
| `couple` | Display name e.g. "Georges & Yara" |
| `colors.gold/brown/bg/goldLight` | Theme colors — change to rebrand per client |
| `photos` | Array of photo filenames for background carousel |
| `music` | MP3 filename |
| `landingImage` | Cover photo for landing page |
| `multilingual` | `true` to show EN/AR switcher, `false` to hide it |
| `giftAccounts` | Array of bank account objects |
| `weddingDate` | ISO date string with timezone for countdown |

---

## URL format

```
viva-carta.com?georges-and-yara
viva-carta.com?georges-and-yara&c=GUESTTOKEN
```

The slug before `&c=` must exactly match the JSON filename (without `.json`).
