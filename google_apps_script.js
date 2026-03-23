// =============================================================
// APEX HEALTH TRACKER — Google Apps Script
// Paste this entire script into Google Apps Script editor
// =============================================================

// ---- SECURITY ----
// Change this to your own secret passphrase. Must match what you enter in the app.
// Use something unique — this is your API key.
var SECRET_TOKEN = 'CHANGE_ME_TO_SOMETHING_UNIQUE';

// This handles incoming POST requests from the Apex PWA
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Validate secret token — reject unauthorized requests
    if (!data.token || data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Route to the correct handler based on data type
    if (data.type === 'daily_log') {
      return handleDailyLog(ss, data);
    } else if (data.type === 'supplement_log') {
      return handleSupplementLog(ss, data);
    } else if (data.type === 'workout_log') {
      return handleWorkoutLog(ss, data);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown type' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle daily metrics log (weight, energy, HR, sleep, alcohol, notes)
function handleDailyLog(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Daily Log', [
    'Date', 'Weight (lbs)', 'Energy (1-10)', 'Resting HR', 'Sleep (hrs)',
    'Alcohol (drinks)', 'Workout Done', 'Notes', 'Synced At'
  ]);

  // Check if this date already exists, update if so
  var dateCol = sheet.getRange('A:A').getValues();
  var rowIndex = -1;
  for (var i = 1; i < dateCol.length; i++) {
    if (dateCol[i][0] === data.date) {
      rowIndex = i + 1;
      break;
    }
  }

  var row = [
    data.date,
    data.weight || '',
    data.energy || '',
    data.hr || '',
    data.sleep || '',
    data.alcohol || '',
    data.workout || '',
    data.notes || '',
    new Date().toISOString()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  // Update dashboard
  updateDashboard(ss);

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', action: rowIndex > 0 ? 'updated' : 'created' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle supplement completion log
function handleSupplementLog(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Supplements', [
    'Date', 'Supplement', 'Dose', 'Time', 'Taken', 'Synced At'
  ]);

  // Clear today's supplement entries and re-write
  var dateCol = sheet.getRange('A:A').getValues();
  var rowsToDelete = [];
  for (var i = dateCol.length - 1; i >= 1; i--) {
    if (dateCol[i][0] === data.date) {
      rowsToDelete.push(i + 1);
    }
  }
  // Delete in reverse to preserve row indices
  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  // Write all supplement data for today
  var timestamp = new Date().toISOString();
  data.supplements.forEach(function(supp) {
    sheet.appendRow([
      data.date,
      supp.name,
      supp.dose,
      supp.time,
      supp.taken ? 'YES' : 'NO',
      timestamp
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle workout completion log
function handleWorkoutLog(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Workouts', [
    'Date', 'Week', 'Phase', 'Workout Type', 'Exercises Completed', 'Total Exercises',
    'Completion %', 'Synced At'
  ]);

  // Check if this date already exists
  var dateCol = sheet.getRange('A:A').getValues();
  var rowIndex = -1;
  for (var i = 1; i < dateCol.length; i++) {
    if (dateCol[i][0] === data.date) {
      rowIndex = i + 1;
      break;
    }
  }

  var row = [
    data.date,
    data.week || '',
    data.phase || '',
    data.workoutType || '',
    data.completed || 0,
    data.total || 0,
    data.total > 0 ? Math.round((data.completed / data.total) * 100) + '%' : '0%',
    new Date().toISOString()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get or create a sheet tab with headers
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Bold header row
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    // Freeze header
    sheet.setFrozenRows(1);
    // Auto-resize columns
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return sheet;
}

// Update or create a dashboard summary sheet
function updateDashboard(ss) {
  var sheet = getOrCreateSheet(ss, 'Dashboard', [
    'Metric', 'Value', 'Last Updated'
  ]);

  var logSheet = ss.getSheetByName('Daily Log');
  if (!logSheet) return;

  var data = logSheet.getDataRange().getValues();
  if (data.length <= 1) return;

  // Get latest values
  var latest = data[data.length - 1];
  var startWeight = 210;
  var currentWeight = '';
  var latestEnergy = '';
  var totalLogs = data.length - 1;

  // Find latest weight
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] && data[i][1] !== '') {
      currentWeight = data[i][1];
      break;
    }
  }

  // Find latest energy
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][2] && data[i][2] !== '') {
      latestEnergy = data[i][2];
      break;
    }
  }

  var lostWeight = currentWeight ? startWeight - parseFloat(currentWeight) : 0;
  var now = new Date().toISOString();

  // Clear and rewrite dashboard
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }

  var metrics = [
    ['Start Weight', '210 lbs', now],
    ['Current Weight', currentWeight ? currentWeight + ' lbs' : 'Not logged', now],
    ['Weight Lost', lostWeight > 0 ? lostWeight + ' lbs' : '0 lbs', now],
    ['Goal Weight', '180 lbs', now],
    ['Latest Energy', latestEnergy ? latestEnergy + '/10' : 'Not logged', now],
    ['Total Log Entries', totalLogs, now],
    ['Program Start', 'March 22, 2026', ''],
    ['75-Day Target', 'June 5, 2026', '']
  ];

  metrics.forEach(function(row) {
    sheet.appendRow(row);
  });
}

// Test function — run this manually to verify the script works
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, 'Daily Log', [
    'Date', 'Weight (lbs)', 'Energy (1-10)', 'Resting HR', 'Sleep (hrs)',
    'Alcohol (drinks)', 'Workout Done', 'Notes', 'Synced At'
  ]);
  getOrCreateSheet(ss, 'Supplements', [
    'Date', 'Supplement', 'Dose', 'Time', 'Taken', 'Synced At'
  ]);
  getOrCreateSheet(ss, 'Workouts', [
    'Date', 'Week', 'Phase', 'Workout Type', 'Exercises Completed', 'Total Exercises',
    'Completion %', 'Synced At'
  ]);
  getOrCreateSheet(ss, 'Dashboard', [
    'Metric', 'Value', 'Last Updated'
  ]);
  Logger.log('All sheets created successfully!');
}
