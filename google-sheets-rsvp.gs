/**
 * Google Apps Script for Traditional Indian Wedding Invitation RSVP
 *
 * HOW TO SETUP (Takes ~60 seconds):
 * 1. Create a new Google Sheet (https://sheets.new).
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Paste this entire file into Code.gs and click Save.
 * 4. Click "Deploy" -> "New deployment" -> Select type: "Web app".
 * 5. Set "Execute as": "Me" and "Who has access": "Anyone".
 * 6. Click "Deploy", copy the Web App URL, and paste it into `googleSheetWebAppUrl` in `app.js`.
 */

const SPREADSHEET_ID = '1TrQlGHmzZ7k2Iw6d_zRxy4rb64MmalTqTYvsoFzZB-Q';
const SHEET_NAME = 'RSVPs';

function getOrCreateSheet() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'NormalizedKey',
      'Name',
      'GuestCount',
      'FoodPreference',
      'ArrivalPlan',
      'ArrivalNote',
      'UpdatedAt',
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  return sheet;
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * GET endpoint: Looks up an existing RSVP by guest name so the website
 * can pre-fill the form when a returning guest opens the invite or types their name.
 */
function doGet(e) {
  const sheet = getOrCreateSheet();
  const rawName = (e && e.parameter && e.parameter.name) || '';
  const key = normalizeName(rawName);

  if (!key) {
    return ContentService.createTextOutput(
      JSON.stringify({ found: false })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (normalizeName(rows[i][0]) === key || normalizeName(rows[i][1]) === key) {
      return ContentService.createTextOutput(
        JSON.stringify({
          found: true,
          record: {
            name: rows[i][1],
            guestCount: String(rows[i][2] || ''),
            foodPreference: rows[i][3] || '',
            arrivalPlan: rows[i][4] || '',
            arrivalNote: rows[i][5] || '',
            updatedAt: rows[i][6] || '',
          },
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ found: false })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST endpoint: Inserts a new RSVP or updates the existing row if the guest
 * has already RSVPed before. All fields are optional.
 */
function doPost(e) {
  const sheet = getOrCreateSheet();
  const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

  const name = String(payload.name || '').trim();
  const key = normalizeName(name) || 'anonymous-' + new Date().getTime();
  const guestCount = String(payload.guestCount || '').trim();
  const foodPreference = String(payload.foodPreference || '');
  const arrivalPlan = String(payload.arrivalPlan || '');
  const arrivalNote = String(payload.arrivalNote || '').trim();
  const updatedAt = payload.updatedAt || new Date().toISOString();

  const rows = sheet.getDataRange().getValues();
  let updatedExisting = false;

  if (normalizeName(name)) {
    for (let i = 1; i < rows.length; i++) {
      if (normalizeName(rows[i][0]) === key || normalizeName(rows[i][1]) === key) {
        sheet
          .getRange(i + 1, 1, 1, 7)
          .setValues([
            [key, name, guestCount, foodPreference, arrivalPlan, arrivalNote, updatedAt],
          ]);
        updatedExisting = true;
        break;
      }
    }
  }

  if (!updatedExisting) {
    sheet.appendRow([
      key,
      name,
      guestCount,
      foodPreference,
      arrivalPlan,
      arrivalNote,
      updatedAt,
    ]);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, updated: updatedExisting })
  ).setMimeType(ContentService.MimeType.JSON);
}
