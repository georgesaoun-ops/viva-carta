# Viva Carta — Digital Invitation System

## How it works

One loader, many designs, many clients — all live simultaneously.
viva-carta.com/?georges-and-yara&c=GUESTTOKEN
→ root `index.html` reads the slug (`georges-and-yara`)
→ fetches `clients/georges-and-yara/config.json` to find which design this client uses
→ loads that design's template from `designs/<design-name>/index.html`
→ that design's `app.js` fetches the same config and injects all the content

---

## File structure
/
├── index.html                              ← universal loader (reads slug, finds design, loads it) — never edit per client or design
│
├── designs/
│   ├── personalized-pictures-gold/
│   │   ├── index.html                      ← this design's HTML/CSS template
│   │   └── app.js                          ← this design's engine (reads client config, injects data)
│   └── <next-design-name>/
│       ├── index.html
│       └── app.js
│
├── clients/
│   ├── georges-and-yara/
│   │   ├── config.json                     ← this client's content + which design they use
│   │   └── assets/                         ← their photos, music, venue image
│   ├── john-and-sara/
│   │   ├── config.json
│   │   └── assets/
│   └── ...

---

## Adding a new client (existing design)

1. **Create the config file**
   Copy an existing `config.json` from another folder in `clients/`, create a new folder `clients/firstname-and-firstname/`, and fill in their details.
2. **Upload their assets** (photos, music, venue image)
   Put them inside that client's own `clients/firstname-and-firstname/assets/` folder.
   Reference them by relative path in the JSON (e.g. `"landingImage": "../../clients/firstname-and-firstname/assets/sara-john-cover.jpeg"`).
3. **Set their design**
   In `config.json`, set `"design"` to the name of the design folder they'll use (e.g. `"personalized-pictures-gold"`).
4. **Generate their guest links**
   Each guest link is encoded like the original system:
base64( "GuestName|NumSeats|SECRET" )
   The SECRET must match the `"secret"` field in their JSON.
   Example: `btoa("Jihad Aoun|6|GY2026SECRET")` → append as `?firstname-and-firstname&c=BASE64HERE`
5. **Push to GitHub** → done. No changes needed to `index.html` or any design files.

---

## Adding a new design

1. Create `designs/<new-design-name>/`
2. Build `index.html` + `app.js` for the new look
3. In `index.html`, the script tag must use an absolute path:
```html
   <script src="/designs/<new-design-name>/app.js"></script>
```
4. In `app.js`, the config fetch must use an absolute path:
```js
   const res = await fetch(`/clients/${slug}/config.json`);
```
5. Any client using this design sets `"design": "<new-design-name>"` in their own `config.json`

---

## Config fields reference

| Field | Description |
|-------|-------------|
| `design` | Name of the design folder this client uses (e.g. `"personalized-pictures-gold"`) |
| `secret` | Token secret for this couple's guest links |
| `scriptUrl` | Google Apps Script URL for RSVP submissions |
| `couple` | Display name e.g. "Georges & Yara" |
| `colors.gold/brown/bg/goldLight` | Theme colors — change to rebrand per client |
| `photos` | Array of photo paths for background carousel (relative to the design's HTML) |
| `music` | MP3 path |
| `landingImage` | Cover photo path for landing page |
| `venueImage` | Venue photo path |
| `multilingual` | `true` to show EN/AR switcher, `false` to hide it |
| `giftAccounts` | Array of bank account objects |
| `weddingDate` | ISO date string with timezone for countdown |

---

## URL format
viva-carta.com/?georges-and-yara
viva-carta.com/?georges-and-yara&c=GUESTTOKEN
The slug before `&c=` must exactly match the client's folder name under `clients/`. No design name ever appears in the URL — it's looked up automatically from that client's `config.json`.
