# Apex Vitality — Men's Health, Longevity & Performance Coaching System

## Overview

Apex is an AI-powered men's health optimization and longevity coaching system. At its core, it pairs Claude with a comprehensive system prompt (`longevity_coach_system_prompt.md`) to deliver personalized, evidence-informed coaching across nutrition, supplementation, hormone optimization, peptide therapy, training, and lifestyle — tailored to the individual's labs, history, goals, and risk tolerance.

The coaching relationship is the product. The user has ongoing conversations with Claude-as-Apex to build and iterate on their health protocol, interpret lab work, adjust supplement stacks, design training programs, and troubleshoot issues as they arise.

### Data Collection: Apex Tracker PWA

To close the feedback loop, the project includes a Progressive Web App (PWA) that runs on iPhone. The tracker collects daily data — workout completion, supplement adherence, weight, energy, sleep, and other metrics — and syncs it to Google Sheets. That data can then be imported into the next coaching conversation, giving Apex real context about what's actually happening day-to-day.

**Tabs:** Workout | Supps | Log | Progress

---

## Getting Started: The Initial Coaching Conversation

The first step is a conversation with Claude using the Apex system prompt. During this conversation, Apex will:

1. **Assess your baseline** — age, goals, current health status, symptoms, training history, diet, supplements, medications, sleep, stress, recent lab work, budget, and risk tolerance
2. **Design your protocol** — tiered recommendations (Tier 1: foundations, Tier 2: optimization, Tier 3: advanced), including specific supplements with dosages, workout programming adapted to your constraints, nutrition targets, and monitoring plan
3. **Generate the tracker config files** — as part of building your protocol, Apex creates the `config_supplements.json` and `config_workouts.json` files that drive the PWA tracker. These JSON files encode your personalized supplement stack, workout phases, metrics targets, and Google Sheets webhook URL

This is the core loop: **coaching conversation → protocol → config files → daily tracking → data back into next conversation**.

---

## How the Tracker Works

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

### 2. Create Your Config Files (via Apex coaching conversation)

During your initial coaching conversation, ask Apex to generate these files based on your protocol. Both files go in the project directory alongside `generate_qr.py`. They are gitignored and never committed.

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

### 3. Set Up Google Sheets - (Optional if you aren't going to use the tracker or manually track changes)

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

## Updating Your Protocol

When your regimen changes — new supplements, adjusted doses, different workout phases — just ask Apex in your next coaching conversation to update the config files. The workflow:

1. **Tell Apex what changed** — "I'm adding magnesium threonate at night" or "move me to phase 2 workouts"
2. **Apex updates the JSON config** and regenerates QR codes: `python3 generate_qr.py supplements`
3. **Re-import on your phone** — scan QR > Copy URL in Safari > paste in Apex app > Import Config
4. The app shows a **diff** (added/removed/changed items) so you can review before confirming
5. Tap **Update** — all existing check-off history and daily logs are preserved (checkoffs are keyed by item name, not position, so reordering is safe)

---

## Daily Usage

**Morning:** Supps tab — tap supplements as you take them. Workout tab — complete exercises.
**Evening:** Supps tab — evening supplements. Log tab — weight, energy, HR, sleep, alcohol, notes > Save.
**Anytime:** Progress tab — weight tracking and history.

---

## File Structure

```
health/
├── longevity_coach_system_prompt.md  # Apex Vitality coaching system prompt
├── CLAUDE.md                         # Directs Claude to use the system prompt
├── README.md
│
├── index.html                  # PWA app shell (no PHI)
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (offline caching)
├── icon-192.png / icon-512.png # App icons
├── generate_qr.py              # QR code generator
├── google_apps_script.js       # Google Sheets backend
├── .gitignore
│
├── config_supplements.json     # YOUR config (gitignored, generated by Apex)
├── config_workouts.json        # YOUR config (gitignored, generated by Apex)
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
