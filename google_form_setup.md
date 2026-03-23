# Google Form Setup (Daily Log — 30 seconds/day)

## Create the Form

1. Go to **forms.google.com** → click **Blank** (new form)
2. Title: **Apex Daily Log**
3. Add these questions:

| # | Question | Type | Options/Validation |
|---|----------|------|-------------------|
| 1 | Date | Date | Required |
| 2 | Weight (lbs) | Short answer | Number validation |
| 3 | Energy Level (1-10) | Linear scale | 1 to 10 |
| 4 | Resting Heart Rate | Short answer | Number validation |
| 5 | Sleep (hours) | Short answer | Number validation |
| 6 | Alcohol (# drinks) | Short answer | Number validation, default 0 |
| 7 | Workout Completed? | Multiple choice | Yes / No / Partial / Rest Day |
| 8 | Workout Type | Multiple choice | Standard / Light / Hard / MTB / Rest |
| 9 | Notes | Paragraph | Optional |

4. Click the **gear icon** → Settings → uncheck "Limit to 1 response" (you may log twice in a day)
5. Click **Send** → copy the link
6. On your iPhone: open the link in Safari → Share → **Add to Home Screen** → name it "Apex Log"

## View Your Data

1. In the form editor, click the **Responses** tab
2. Click the green Sheets icon → **Create a new spreadsheet**
3. This auto-populates a Google Sheet with every entry
4. The sheet updates automatically every time you submit

## Add Charts to the Sheet (Optional)

1. Open the linked Google Sheet
2. Select the Weight column → Insert → Chart → Line chart
3. Repeat for Energy, Resting HR
4. These update automatically as you log
