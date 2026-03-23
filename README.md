# Apex Health Tracker — Setup & Usage Guide

## Overview

Apex is a Progressive Web App (PWA) for iPhone that tracks daily workouts, supplements, and health metrics with Google Sheets sync. It runs full-screen from your Home Screen with no browser chrome.

**Tabs:** Workout | Supps | Log | Progress

---

## How It Works

The app on GitHub Pages contains **zero personal health information**. Your supplements, prescriptions, workout plans, and metrics live only in `localStorage` on your phone. Config is imported via QR code URLs — the data travels in the URL fragment (`#s=...` or `#w=...`), which is **never sent to any server**.

Two independent config domains:
- **Supplements** (`#s=`) — prescriptions, supplement protocol, metrics (weight, dates), webhook URL
- **Workouts** (`#w=`) — exercise phases and routines

---

## Complete Setup (Start to Finish)

### 1. Prerequisites (Mac)

```bash
pip3 install "qrcode[pil]"
```

### 2. Create Your Config Files

Both files go in the project directory alongside `generate_qr.py`. They are gitignored and never committed.

**config_supplements.json** — your supplements, metrics, and Google Sheets webhook URL:

```json
{
  "metrics": {
    "startWeight": 210,
    "goalWeight": 180,
    "startDate": "2026-03-22",
    "webhookUrl": "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
  },
  "supplements": {
    "rx": {
      "name": "Prescriptions (Daily)",
      "icon": "rx",
      "emoji": "&#x1F48A;",
      "items": [
        { "name": "Medication Name", "dose": "10mg", "detail": "Instructions", "time": "Evening" }
      ]
    },
    "morning": {
      "name": "Morning (With First Meal)",
      "icon": "pill",
      "emoji": "&#x2600;",
      "items": [
        { "name": "Vitamin D3", "dose": "5000 IU", "detail": "Take with food", "time": "Morning" }
      ]
    }
  }
}
```

Section keys: `rx`, `morning`, `evening`, `asNeeded`, `onHold`, `tier2`, `tier2T`, `future`
Each section needs: `name`, `icon` (rx/pill/moon/hold/later), `emoji` (HTML entity), `items[]`
Each item needs: `name`, `dose`, `detail`, `time`

**config_workouts.json** — your exercise phases:

```json
{
  "phase1": {
    "standard": {
      "totalTime": 20,
      "sections": [
        {
          "name": "Warm-Up", "icon": "warmup", "duration": "2 min",
          "exercises": [
            { "name": "Dynamic stretching", "detail": "Arm circles, leg swings", "time": "2 min" }
          ]
        }
      ]
    },
    "light": { "totalTime": 10, "sections": [...] }
  },
  "phase2": { ... },
  "phase3": { ... }
}
```

Phases: `phase1`, `phase2`, `phase3` (auto-selected by week from start date)
Types: `standard`, `light`, `hard` (phase 2+), `mtb` (phase 3 week 8+)
Section icons: `warmup`, `bag`, `kb`, `core`, `cool`

### 3. Set Up Google Sheets (Optional)

1. Create a blank spreadsheet at [sheets.google.com](https://sheets.google.com), name it "Apex Health Tracker"
2. **Extensions > Apps Script** — paste contents of `google_apps_script.js`
3. Change `SECRET_TOKEN` at the top to your own passphrase
4. **Save**, then **Deploy > New deployment > Web app**
5. Set **Execute as:** Me, **Who has access:** Anyone
6. Copy the deployed URL and paste it into `config_supplements.json` as the `webhookUrl` value

### 4. Generate QR Codes (Mac)

```bash
python3 generate_qr.py supplements    # creates qr_supplements.png, prints URL
python3 generate_qr.py workouts       # creates qr_workouts.png, prints URL
```

### 5. Add Apex to Your iPhone Home Screen

1. Open **https://jkeeter.github.io/apex-tracker/** in **Safari** on your iPhone
2. Tap **Share** (square with arrow) > **Add to Home Screen** > name it "Apex" > **Add**
3. The app will show an empty state — that's expected

### 6. Import Config (Two QR Codes)

For each QR code (supplements, then workouts):

1. **Scan the QR code** with your iPhone camera — it opens in Safari
2. Safari shows a **"Copy URL to Clipboard"** screen (the app is hidden — this is intentional)
3. Tap **Copy URL to Clipboard**
4. Open **Apex from your Home Screen**
5. Go to the **Log** tab > scroll to **Import Config**
6. Paste the URL > tap **Import Config**
7. Review the import modal > tap **Import**

**Why this two-step process?** iOS gives Safari and Home Screen apps separate storage. QR codes always open in Safari. So you copy the URL in Safari and paste it in the standalone app. It takes 10 seconds per config.

**Alternative (no QR):** Copy the URL printed in your terminal on Mac > iMessage it to yourself > copy on iPhone > paste in app.

### 7. Enter Google Sheets Token

1. In the Apex app, go to **Log** tab > **Google Sheets Sync**
2. The webhook URL should already be filled in (imported with supplements config)
3. Enter your **Secret Token** — the same passphrase from step 3
4. Token is never stored in any file, only in the app on your phone

### 8. Verify Everything Works

- **Workout tab** shows today's exercises with correct durations
- **Supps tab** shows your full supplement protocol
- **Log tab** > Import Config section shows green checkmarks for Supplements, Workouts, and Metrics
- Enter a test weight + energy > **Save Today's Log** > button flashes **"Saved + Synced!"** (green)
- Check your Google Sheet — entry appears in the Daily Log tab

---

## Updating Config

When supplements or workouts change:

1. Edit the config JSON on your Mac
2. Regenerate only the changed QR: `python3 generate_qr.py supplements`
3. Scan QR > **Copy URL** in Safari > paste in Apex app > tap **Import Config**
4. The app shows a diff (added/removed/changed items)
5. Tap **Update** — check-off history is preserved

---

## Daily Usage

**Morning:** Supps tab — tap supplements as you take them. Workout tab — complete exercises.
**Evening:** Supps tab — evening supplements. Log tab — weight, energy, HR, sleep, alcohol, notes > Save.
**Anytime:** Progress tab — weight tracking and history.

---

## File Structure

```
apex-tracker/
├── index.html                  # PWA app shell (no PHI)
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (offline caching)
├── icon-192.png / icon-512.png # App icons
├── generate_qr.py              # QR code generator
├── google_apps_script.js       # Google Sheets backend
├── .gitignore
├── README.md
│
├── config_supplements.json     # YOUR config (gitignored)
├── config_workouts.json        # YOUR config (gitignored)
├── qr_supplements.png          # Generated QR (gitignored)
└── qr_workouts.png             # Generated QR (gitignored)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Empty app after Add to Home Screen | Expected. Import config via Log tab > Import Config. |
| QR opens in Safari, not the app | Expected. Tap "Copy URL", then paste in standalone app. |
| "No supplement/workout config loaded" | Log tab > Import Config > paste URL > Import. |
| Config import fails | Ensure full URL was copied including the `#s=...` or `#w=...` fragment. |
| "Saved locally (no Sheets link)" | Check webhook URL + token in Log tab. Webhook imports with supplements; token is manual. |
| Google Sheet not updating | Verify token matches between app and Apps Script. Check Apps Script > Executions for errors. |
| Lost data after clearing Safari | Don't clear Safari website data. Config lives in the standalone app's storage. Use Sheets sync for backup. |

---

## Security

- App shell on GitHub Pages: **zero PHI**
- All personal data: `localStorage` on your device only
- QR/URL config data: URL fragments — **never sent to any server**
- Webhook URL: in config file (gitignored), imported with supplements
- Secret token: **never in any file** — entered manually, stored only on device
- Google Sheets: private to your Google account, protected by token
