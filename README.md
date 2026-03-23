# Apex Health Tracker — Setup & Usage Guide

## Overview

Apex is a Progressive Web App (PWA) that runs on your iPhone as a home screen app. It tracks your 12-week exercise protocol, daily supplement regimen, and health metrics — with automatic sync to Google Sheets.

**Four tabs:**
1. **Workout** — Today's exercises with tap-to-complete checkboxes
2. **Supps** — Full supplement regimen (morning, evening, on hold, future tiers)
3. **Log** — Daily metrics: weight, energy, HR, sleep, alcohol, notes
4. **Progress** — Weight loss tracking and history

---

## Setup: Loading Your Personal Config

### Architecture Overview

The app shell (committed to git) contains **no personal health information**. All PHI — supplements, prescriptions, metrics, workout plans — lives in `localStorage` on your device only. Config is loaded via QR code: the app URL carries your config in the URL fragment (never sent to any server), you scan it once, and the data stays on your phone.

---

### Creating Your Config Files

These files are **not committed to git** (they're in `.gitignore`).

**`config_supplements.json`**

```json
{
  "metrics": {
    "startWeight": 210,
    "goalWeight": 180,
    "startDate": "2026-03-22"
  },
  "supplements": {
    "morning": {
      "name": "Morning Supplements",
      "icon": "pill",
      "emoji": "&#x2600;",
      "items": [
        { "name": "Vitamin D3", "dose": "5000 IU", "detail": "Take with food", "time": "Morning" }
      ]
    }
  }
}
```

Valid supplement section keys: `rx`, `morning`, `evening`, `asNeeded`, `onHold`, `tier2`, `tier2T`, `future`. Each section requires `name`, `icon`, `emoji`, and an `items` array.

**`config_workouts.json`**

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
    "light": { ... }
  },
  "phase2": { ... },
  "phase3": { ... }
}
```

---

### Generating QR Codes

```bash
# Install dependency (one time)
pip3 install "qrcode[pil]"

# Generate QR for supplements
python3 generate_qr.py supplements

# Generate QR for workouts
python3 generate_qr.py workouts
```

---

### Loading Config on iPhone

1. Scan the QR code with your iPhone camera
2. Safari opens the app URL with your config in the URL fragment (never sent to server)
3. The app shows an import confirmation with a diff of changes
4. Tap **Import** or **Update** — config saves to localStorage
5. Your check-off history is never overwritten
6. Add to Home Screen for standalone app experience

---

### Updating Config

1. Edit your config JSON file
2. Re-run `python3 generate_qr.py supplements` (or `workouts`)
3. Scan the new QR code — the app shows only what changed
4. Only regenerate the QR for the config domain that changed

---

## File Structure

```
/Users/jon/projects/health/workout/
├── index.html                  # The entire PWA (single file, self-contained)
├── google_apps_script.js       # Google Apps Script for Sheets sync
├── google_form_setup.md        # Alternative: Google Form setup (optional)
└── README.md                   # This file
```

**Memory files (session tracking for Claude):**
```
/Users/jon/.claude/projects/-Users-jon-projects-health/memory/
├── MEMORY.md                       # Index of all memory files
├── health_optimization_tracker.md  # Full protocol, labs, session log
├── user_profile.md                 # User profile, health history, goals
├── collaboration_approach.md       # How to work with user, preferences
└── resources_and_tracking.md       # File locations, supplement orders
```

**Other reference files:**
```
/Users/jon/projects/health/
├── longevity_coach_system_prompt.md    # Apex coach system prompt
├── exercise_protocol_reference.html    # Standalone HTML reference (color-coded)
├── 75day_exercise_tracker.csv          # Original CSV tracker (deprecated by PWA)
└── workout/                            # PWA directory (see above)
```

---

## Part 1: Setting Up the PWA on iPhone

### What the iPhone experience looks like

Once added to your home screen, Apex runs as a full-screen app (no browser chrome):
- **Status bar** is transparent and overlays the top of the app — this is normal and intentional (`black-translucent` mode)
- **Notch / Dynamic Island** is handled with top safe-area padding so content is never obscured
- **Home indicator** (bottom gesture bar) is handled with extra bottom padding so the nav tabs always clear it
- The nav bar tabs (Workout / Supps / Log / Progress) are sized and padded specifically for iPhone

> **Requires Safari.** Only Safari supports "Add to Home Screen" and the full-screen PWA meta tags. Chrome on iPhone will open the app in a browser tab, not full-screen.

---
### OPTION C IS THE MOST SECURE, JUST BE SURE TO SYNC YOUR CHANGES BACK TO THE GOOGLE SHEET. 
---

### Option A: Local Server (Same WiFi) - NOT RECOMMENDED, YOU MUST BE ON YOUR LOCAL WIFI TO USE.  

 Requires your Mac to be on and serving.

1. Open Terminal on your Mac
2. Run:
   ```bash
   cd /Users/jon/projects/health/workout
   python3 -m http.server 8080
   ```
3. Find your Mac's local IP:
   ```bash
   ipconfig getifaddr en0
   ```
   (e.g., `192.168.1.186`)
4. On your iPhone, open **Safari** (not Chrome) and go to:
   ```
   http://192.168.1.186:8080
   ```
5. Tap **Share** (square with arrow) → **Add to Home Screen** → Name it "Apex" → **Add**
6. The app icon appears on your home screen. Tap it to launch in full-screen mode.

**Note:** This only works when your Mac is on and serving. If you restart your Mac, re-run the `python3 -m http.server 8080` command.

### Option B: Host It Permanently (Free - DO NOT RECOMMEND UNLESS YOU SECURE THIS WELL, IT CONTAINS PHI HEALTH INFORMATION)

To access the app without your Mac running, host the `index.html` file on a free static hosting service:

**GitHub Pages (free):**
1. Create a GitHub repo (e.g., `apex-health`)
2. Push the `workout/` directory contents to the repo
3. Go to repo Settings → Pages → Source: main branch → Save
4. Your app is live at `https://yourusername.github.io/apex-health/`
5. Open that URL on your iPhone → Add to Home Screen

**Netlify (free):**
1. Go to netlify.com → sign up
2. Drag and drop the `workout/` folder onto the deploy area
3. Get a URL like `https://random-name.netlify.app`
4. Open on iPhone → Add to Home Screen

**Note on privacy:** The HTML file contains your supplement protocol and health details. GitHub Pages repos are public by default. Use a private repo with GitHub Pages (requires Pro), or use Netlify which supports private deploys for free.

### Option C: AirDrop the File (FREE and FAST)

1. AirDrop `index.html` from your Mac to your iPhone
2. Save it to Home Screen or Files
3. Open it with Safari
4. Add to Home Screen (if saved in Files)

**Limitation:** Some localStorage features may not persist when opened from Files. Local server or hosted option is more reliable.

---

## Part 2: Google Sheets Sync Setup

### Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank spreadsheet**
3. Name it: **Apex Health Tracker**

### Step 2: Add the Apps Script

1. In the Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Open `/Users/jon/projects/health/workout/google_apps_script.js` on your Mac
4. Copy the **entire** contents
5. Paste into the Apps Script editor
6. **IMPORTANT:** Change the secret token at the top:
   ```javascript
   var SECRET_TOKEN = 'CHANGE_ME_TO_SOMETHING_UNIQUE';
   ```
   Replace with your own passphrase (e.g., `'my-secret-apex-2026'`).
   **Remember this — you'll enter the same passphrase in the app.**
7. Click **Save** (Ctrl+S or Cmd+S)

### Step 3: Test the Script (Optional but Recommended)

1. In the Apps Script editor, select **testSetup** from the function dropdown (top bar)
2. Click **Run**
3. Google will ask for permissions:
   - "This app isn't verified" → Click **Advanced** → **Go to Apex Tracker (unsafe)**
   - Review permissions → **Allow**
4. Go back to your Google Sheet — you should see 4 new tabs:
   - **Daily Log** — weight, energy, HR, sleep, alcohol, notes
   - **Supplements** — each supplement, dose, taken Y/N
   - **Workouts** — date, week, phase, type, completion %
   - **Dashboard** — summary metrics

### Step 4: Deploy the Script as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the **gear icon** next to "Select type" → choose **Web app**
3. Fill in:
   - **Description:** Apex Tracker
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the URL** it gives you
   - It looks like: `https://script.google.com/macros/s/ABCDEF.../exec`
   - Save this URL — you'll paste it into the app

**Why "Anyone"?** The PWA runs in your browser without Google auth. The secret token protects against unauthorized access. Without the token, requests are rejected.

### Step 5: Connect the App to Google Sheets

1. Open the Apex app on your phone
2. Go to the **Log** tab
3. Scroll down to **Google Sheets Sync**
4. Paste the **Apps Script URL** into the URL field
5. Enter your **Secret Token** (the same passphrase from Step 2)
6. Both values are saved locally on your phone

### Step 6: Verify It Works

1. In the Log tab, enter a test weight (e.g., 210) and energy (e.g., 5)
2. Tap **Save Today's Log**
3. Button should flash **"Saved + Synced!"** (green)
4. Open your Google Sheet — check the **Daily Log** tab
5. Your entry should appear with today's date

If the button shows **"Saved locally (no Sheets link)"** — check that both URL and token are entered.

---

## Part 3: Daily Usage

### Morning Routine
1. Open Apex app
2. Go to **Supps** tab
3. Tap each supplement as you take it (morning section)
4. Progress bar tracks completion

### Workout
1. Go to **Workout** tab
2. See today's exercises (auto-selected based on date, week, and phase)
3. If you're tired, tap **Light** to switch to the easier version
4. Tap each exercise as you complete it
5. Progress bar tracks completion

### Evening
1. Go to **Supps** tab
2. Tap evening supplements as you take them (magnesium, apigenin, NAC)

### End of Day
1. Go to **Log** tab
2. Enter: weight, energy (1-10), resting HR, sleep hours, alcohol count, notes
3. Tap **Save Today's Log**
4. Data saves locally AND syncs to Google Sheets

### Check Progress
1. Go to **Progress** tab
2. See current weight, weight lost, goal progress
3. Scroll through history of all logged days

---

## Part 4: How the Exercise Protocol Works

### Phases (Auto-Selected by Date)

| Weeks | Phase | Focus | Standard Duration |
|-------|-------|-------|-------------------|
| 1-2 | Phase 1 — Foundation | Light movement, rebuild habits, fatigue recovery | 20 min |
| 3-4 | Phase 2 — Intensity | Progressive overload, harder combos, more KB weight | 20 min |
| 5-12 | Phase 3 — Full Capacity | High intensity + MTB prep (Week 8+) | 20 min |

### Weekly Schedule

| Day | Weeks 1-2 | Weeks 3-4 | Weeks 5-7 | Weeks 8-12 |
|-----|-----------|-----------|-----------|------------|
| Mon | Standard | Standard | Standard | Standard |
| Tue | Light | Light | Standard | MTB-Specific |
| Wed | Standard | Standard | Standard | Standard |
| Thu | Light | Light | Standard | MTB-Specific |
| Fri | Standard | Standard | Standard | Standard |
| Sat | Rest | Hard (optional) | Hard | Hard |
| Sun | Rest | Rest | Rest | Rest |

### Workout Types

- **Standard** — Full 20-min protocol (bag work + kettlebell + core)
- **Light** — Reduced intensity/duration (10-15 min) for tired days
- **Hard** — Extended intensity (22 min) with more rounds
- **MTB-Specific** — Leg + core emphasis for mountain bike prep (Week 8+)
- **Rest** — No exercise, recovery day

### Equipment Needed
- Kickboxing bag + mats
- Kettlebells (light and moderate weight)
- Floor space for bodyweight exercises

### Knee Safety (ACL + Meniscus Surgery History)
- **No jumping** — all squats are controlled, tempo-based
- **No deep squats** — go to comfortable depth only
- **Tempo goblet squats** replace jump squats (3 sec down, pause, 2 sec up)
- **Half Turkish get-ups or windmills** replace full get-ups (no lunge position)
- **Single-leg deadlifts** use light weight for balance

---

## Part 5: Supplement Protocol Reference

### Daily — Morning (With First Meal)
| Supplement | Dose | Why |
|-----------|------|-----|
| CoQ10 Ubiquinol | 300mg | Statin-induced depletion; mitochondrial energy |
| Vitamin D3 | 10,000 IU (8 wks loading) → 5,000 IU | Severe deficiency (level: 24); take with fat |
| Vitamin K2 (MK-7) | 200mcg | Directs calcium away from arteries; essential with D3 + cardiac history |
| Omega-3 (EPA-dominant) | 2-3g | ApoB reduction, anti-inflammatory, cardiac |
| B12 (Methylcobalamin) | 5,000mcg sublingual | Borderline low (404) + macrocytic anemia |
| Methylfolate (5-MTHF) | 800mcg | B12 co-factor; macrocytic anemia support |
| NAC | 600mg | Liver support (ALT 59), glutathione — dose 1 of 2 |
| Creatine Monohydrate | 5g | Muscle preservation + cognitive benefit |

### Daily — Evening (Before Bed)
| Supplement | Dose | Why |
|-----------|------|-----|
| Magnesium Glycinate | 400mg | Sleep architecture, muscle relaxation |
| Apigenin | 50mg | GABA modulation, non-sedating sleep support |
| NAC | 600mg | Liver support — dose 2 of 2 |

### Daily — Prescriptions
| Medication | Dose | Time |
|-----------|------|------|
| Atorvastatin | 10mg | Evening |
| Zetia (Ezetimibe) | 10mg | Evening |

### As Needed (Non-Serotonergic Sleep Support)
| Supplement | Dose | When |
|-----------|------|------|
| L-Theanine | 200mg | Occasional extra sleep help |
| Glycine | 3g | Alternative sleep support |

### ON HOLD (Safety Review Required)
| Supplement | Status | Reason |
|-----------|--------|--------|
| Baby Aspirin | HOLD | Platelets at 67K — discuss with cardiologist |
| Nattokinase | HOLD | Fibrinolytic + low platelets = bleeding risk |
| Methylene Blue | HOLD until April 4, 2026 | Trintellix (vortioxetine) washout — MAO-A inhibitor + residual SSRI = serotonin syndrome risk |
| Mirtazapine | DISCONTINUED | Was 2x/month only; replaced by mag + apigenin |

### Tier 2 — Add at Week 3-4
| Supplement | Dose | Why |
|-----------|------|-----|
| Alpha-Lipoic Acid | 600mg | Glucose management (fasting glucose 121) |
| Chromium | 200mcg | Glucose sensitivity |
| Ceylon Cinnamon | 1g | Mild glucose support |
| Milk Thistle (Silymarin) | 300mg | Liver protection |

### Tier 2 — Testosterone Support (Add Week 4-6 if T Still Low)
| Supplement | Dose | Why |
|-----------|------|-----|
| Tongkat Ali | 400mg | Direct T stimulation |
| Ashwagandha (KSM-66) | 600mg | Cortisol reduction + T support |
| Boron | 10mg | T support (SHBG already low at 21.4, less critical) |
| Zinc | 30mg | T production; take with food |

### Future — After April 4, 2026
| Supplement | Dose | Why |
|-----------|------|-----|
| Methylene Blue | ~30mg (0.5mg/kg) | Mitochondrial electron carrier; stacks with CoQ10 |

---

## Part 6: Key Dates & Checkpoints

| Date | Event |
|------|-------|
| March 22, 2026 | Program start. Begin Tier 1 supplements + Phase 1 exercise. |
| March 22-31 | Alcohol taper: reduce by 1 drink every 2-3 days → 1-2 drinks on social nights only |
| April 4, 2026 | Trintellix fully cleared. Safe to restart methylene blue (~30mg). |
| April 5-19 (Wk 3-4) | Add Tier 2 supplements (ALA, chromium, cinnamon, milk thistle). Energy should be improving. |
| April 19 - May 3 (Wk 4-6) | If T still feels low, add testosterone support (tongkat, ashwagandha, boron, zinc). |
| May 3-17 (Week 6-8) | **RETEST LABS:** Vitamin D, B12, testosterone (total + free + SHBG + estradiol sensitive), fasting glucose, HbA1c, ALT, platelets, ApoB, hsCRP, ferritin, folate, GGT |
| May 17 (Week 8) | ~16 lbs lost expected. MTB-specific training begins. |
| May 17+ | If T < 400 after natural support, discuss TRT with provider. |
| June 5, 2026 | **75-DAY MARK.** Realistic target: 188-192 lbs. |
| ~June 30, 2026 | Extended target: 180 lbs (90-100 days). |

---

## Part 7: Updating the Apps Script After Changes

If you need to update the Google Apps Script (e.g., change the token, add fields):

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Make your changes
4. Click **Save**
5. Click **Deploy → Manage deployments**
6. Click the **pencil icon** on your existing deployment
7. Set **Version** to **New version**
8. Click **Deploy**

**Important:** You must create a new version for changes to take effect. Just saving the script is not enough — you must re-deploy.

---

## Part 8: Troubleshooting

### App won't load on phone
- Make sure your Mac and iPhone are on the same WiFi network
- Make sure the Python server is running (`python3 -m http.server 8080`)
- Check your Mac's IP hasn't changed (`ipconfig getifaddr en0`)
- Use **Safari** — Chrome on iPhone does not support Add to Home Screen or full-screen PWA mode

### App doesn't fill the screen / nav tabs are cut off by home indicator
- Make sure you opened the app from the **home screen icon**, not directly in Safari
- If you already added it and it looks wrong, remove the icon and re-add it from Safari

### "Saved locally (no Sheets link)" on save
- Go to Log tab → scroll down → check both URL and token are filled in
- Make sure the token matches exactly what's in the Apps Script

### Data not appearing in Google Sheet
- Check the Apps Script deployment is set to "Anyone" access
- Check the token in the app matches the `SECRET_TOKEN` in the script exactly
- Open the Apps Script → Executions tab to see error logs

### Lost data on phone
- Data is stored in Safari's localStorage
- Don't clear Safari website data (Settings → Safari → Clear History and Website Data)
- For permanent backup, use the Google Sheets sync

### Server stops when Mac sleeps
- Re-run `cd /Users/jon/projects/health/workout && python3 -m http.server 8080`
- Or host the file permanently (see Option B in Part 1)

---

## Part 9: Sharing Data with Apex (Claude)

When you check in for a session, you can share your progress by:

1. **Pasting Google Sheet data** — Open the Daily Log tab, select recent rows, copy/paste into the chat
2. **Screenshot** — Screenshot the Progress tab in the app and share
3. **Manual update** — Just tell me your numbers: "Weight 205, energy 6/10, completed 5 workouts this week"

Claude's memory files will be updated with your progress each session so the next conversation has full context.

---

## Security Notes

- The Apps Script URL is set to "Anyone" access but protected by a secret token
- Without the correct token, all requests are rejected with "Unauthorized"
- The token is stored locally on your phone (Safari localStorage)
- Your health data in Google Sheets is private to your Google account
- The PWA HTML file contains your supplement protocol — don't host publicly unless you're comfortable with that
- If hosting on GitHub Pages, use a private repo (requires GitHub Pro) or Netlify (free private deploys)
