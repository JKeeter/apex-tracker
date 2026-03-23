# Apex Health Tracker — Setup & Usage Guide

## Overview

Apex is a Progressive Web App (PWA) that runs on your iPhone as a home screen app. It tracks your 12-week exercise protocol, daily supplement regimen, and health metrics — with automatic sync to Google Sheets.

**Four tabs:**
1. **Workout** — Today's exercises with tap-to-complete checkboxes
2. **Supps** — Full supplement regimen (morning, evening, on hold, future tiers)
3. **Log** — Daily metrics: weight, energy, HR, sleep, alcohol, notes
4. **Progress** — Weight loss tracking and history

---

## Architecture

The app shell (hosted on GitHub Pages) contains **no personal health information**. All PHI — supplements, prescriptions, metrics, workout plans — lives in `localStorage` on your device only.

Config is split into two independent domains:
- **Supplements** — prescriptions, supplement protocol, personal metrics (weight, start date), webhook URL
- **Workouts** — exercise phases and routines

Each is imported separately via QR code or pasted URL. The config data is compressed and encoded in the URL fragment (`#s=...` or `#w=...`), which **never leaves your device** — URL fragments are not sent to any server.

---

## Part 1: Initial Setup on iPhone

### Step 1: Add to Home Screen

1. Open https://jkeeter.github.io/apex-tracker/ in **Safari** on your iPhone
2. Tap **Share** (square with arrow) > **Add to Home Screen** > Name it "Apex" > **Add**
3. The app icon appears on your home screen — it will show an empty state until you import config

### Step 2: Generate QR Codes (on your Mac)

```bash
# Install dependency (one time)
pip3 install "qrcode[pil]"

# Generate QR for supplements + metrics
python3 generate_qr.py supplements

# Generate QR for workouts
python3 generate_qr.py workouts
```

Each command generates a QR code image and prints the full URL to your terminal.

### Step 3: Import Config into the App

**Important:** You must import config from **within the standalone app** (opened from Home Screen), not from Safari. Safari and standalone apps have separate storage on iOS.

1. Open the **Apex app from your Home Screen**
2. Go to the **Log** tab
3. Scroll down to **Import Config**
4. On your Mac, scan the supplements QR code with your iPhone camera — this opens a URL in Safari
5. **Copy the URL** from Safari's address bar
6. Go back to the Apex app > paste the URL into the Import Config field > tap **Import Config**
7. Confirm the import in the modal that appears
8. Repeat steps 4-7 for the workouts QR code

**Alternative:** Instead of scanning, you can copy the URL printed in your terminal and send it to yourself via iMessage, then copy-paste it in the app.

### Step 4: Enter Google Sheets Token

1. In the **Log** tab, scroll to **Google Sheets Sync**
2. The webhook URL imports automatically with supplements config (if you set it in `config_supplements.json`)
3. Enter your **Secret Token** manually — this is never included in the config file for security

### Verify

After import, the Import Config section shows status indicators:
- **Supplements** / **Workouts** / **Metrics** — each shows a green checkmark when loaded

---

## Part 2: Updating Config

When supplements or workouts change:

1. Edit the config JSON file on your Mac
2. Run `python3 generate_qr.py supplements` (or `workouts`) — only regenerate what changed
3. Scan QR > copy URL > paste in app's Import Config field
4. The app shows a diff of what changed (added/removed/modified items)
5. Tap **Update** — your check-off history is preserved

---

## Part 3: Creating Config Files

These files live on your Mac and are **not committed to git** (listed in `.gitignore`).

### config_supplements.json

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
        { "name": "Medication Name", "dose": "10mg", "detail": "With evening meal", "time": "Evening" }
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

**Valid supplement section keys:** `rx`, `morning`, `evening`, `asNeeded`, `onHold`, `tier2`, `tier2T`, `future`

Each section requires: `name`, `icon` (rx/pill/moon/hold/later), `emoji` (HTML entity), and `items` array.

Each item requires: `name`, `dose`, `detail`, `time`.

### config_workouts.json

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

**Phases:** `phase1`, `phase2`, `phase3` — auto-selected by week number from start date.

**Workout types per phase:** `standard`, `light`, `hard` (phase 2+), `mtb` (phase 3, week 8+).

Each section requires: `name`, `icon` (warmup/bag/kb/core/cool), `duration`, `exercises` array.

---

## Part 4: Google Sheets Sync Setup

### Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank spreadsheet**
3. Name it: **Apex Health Tracker**

### Step 2: Add the Apps Script

1. In the Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy the contents of `google_apps_script.js` and paste into the editor
4. Change the secret token at the top:
   ```javascript
   var SECRET_TOKEN = 'CHANGE_ME_TO_SOMETHING_UNIQUE';
   ```
5. Click **Save**

### Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Select type: **Web app**
3. Set **Execute as:** Me, **Who has access:** Anyone
4. Click **Deploy** and **copy the URL**
5. Paste this URL into the `webhookUrl` field in `config_supplements.json`

**Why "Anyone"?** The PWA runs client-side without Google auth. The secret token protects against unauthorized access.

### Step 4: Connect

1. Regenerate supplements QR: `python3 generate_qr.py supplements`
2. Import into app (webhook URL comes through automatically)
3. Enter your **Secret Token** in the Log tab (token is never in the config file)

### Step 5: Verify

1. Enter a test weight and energy in the Log tab
2. Tap **Save Today's Log**
3. Button should flash **"Saved + Synced!"** (green)
4. Check your Google Sheet — entry should appear in the Daily Log tab

---

## Part 5: Daily Usage

### Morning
1. Open Apex from Home Screen
2. **Supps** tab — tap each morning supplement as you take it
3. **Workout** tab — see today's exercises, tap to complete. Switch to **Light** if tired.

### Evening
1. **Supps** tab — tap evening supplements
2. **Log** tab — enter weight, energy, HR, sleep, alcohol, notes
3. Tap **Save Today's Log** — saves locally + syncs to Sheets

### Progress
- **Progress** tab shows weight tracking and history of logged days

---

## Part 6: Exercise Protocol

### Phases (Auto-Selected by Date)

| Weeks | Phase | Focus | Duration |
|-------|-------|-------|----------|
| 1-2 | Phase 1 — Foundation | Light movement, rebuild habits | 20 min |
| 3-4 | Phase 2 — Intensity | Progressive overload, harder combos | 20 min |
| 5-12 | Phase 3 — Full Capacity | High intensity + MTB prep (Week 8+) | 20 min |

### Weekly Schedule

| Day | Weeks 1-2 | Weeks 3-4 | Weeks 5-7 | Weeks 8-12 |
|-----|-----------|-----------|-----------|------------|
| Mon | Standard | Standard | Standard | Standard |
| Tue | Light | Light | Standard | MTB |
| Wed | Standard | Standard | Standard | Standard |
| Thu | Light | Light | Standard | MTB |
| Fri | Standard | Standard | Standard | Standard |
| Sat | Rest | Hard | Hard | Hard |
| Sun | Rest | Rest | Rest | Rest |

### Workout Types

- **Standard** — Full protocol (bag work + kettlebell + core)
- **Light** — Reduced intensity/duration for recovery days
- **Hard** — Extended intensity with more rounds
- **MTB** — Leg + core emphasis for mountain bike prep (Week 8+)
- **Rest** — Recovery day

---

## File Structure

```
apex-tracker/                      (public GitHub repo — no PHI)
├── index.html                     # PWA app shell
├── manifest.json                  # PWA manifest
├── sw.js                          # Service worker (offline caching)
├── icon-192.png                   # App icon (192x192)
├── icon-512.png                   # App icon (512x512)
├── generate_qr.py                 # QR code generator script
├── google_apps_script.js          # Google Sheets backend
├── .gitignore                     # Excludes config + QR files
├── README.md                      # This file
│
├── config_supplements.json        # YOUR supplements + metrics (gitignored)
├── config_workouts.json           # YOUR workout plan (gitignored)
├── qr_supplements.png             # Generated QR code (gitignored)
└── qr_workouts.json               # Generated QR code (gitignored)
```

---

## Troubleshooting

### Empty app after adding to Home Screen
This is expected. Safari and standalone apps have separate localStorage on iOS. You must import config **from within the standalone app** using the paste import in the Log tab.

### "No supplement config loaded" / "No workout config loaded"
Go to Log tab > Import Config > paste your config URL and tap Import.

### Config import fails
- Make sure you copied the **entire URL** including the `#s=...` or `#w=...` fragment
- The URL can be very long — double-check nothing was truncated when copying

### "Saved locally (no Sheets link)"
- Check both webhook URL and token are filled in (Log tab > Google Sheets Sync)
- Webhook URL imports with supplements config; token must be entered manually

### Data not appearing in Google Sheet
- Check the token matches exactly between the app and Apps Script
- Check the deployment is set to "Anyone" access
- Open Apps Script > Executions tab for error logs

### Lost data on phone
- Don't clear Safari website data (Settings > Safari > Clear History)
- Config and check-off data live in the standalone app's localStorage
- For backup, use Google Sheets sync

### Updating the Apps Script
1. Open Google Sheet > Extensions > Apps Script
2. Make changes > Save
3. Deploy > Manage deployments > pencil icon > New version > Deploy

---

## Security Notes

- The app shell on GitHub Pages contains **zero PHI** — it's a generic tracker
- All personal data lives in `localStorage` on your device only
- Config data in QR codes uses URL fragments (`#`), which are **never sent to any server**
- The Google Sheets webhook URL is in your config file (gitignored) but the **token is never stored in any file**
- Google Sheets data is private to your Google account, protected by the secret token
- Config files and QR code images are gitignored and never committed
