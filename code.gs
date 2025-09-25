// Code.gs — safe write, supports JSON and form-urlencoded, lock, header-check
const SPREADSHEET_ID = "1Eif_nXOWrMKPjaXA8sSUKrHms3b0qD7xZbVJHSxgQ9s"; // <-- แก้ไขตรงนี้
const RESPONSE_SHEET_NAME = "All_Responses";
const HEADER = [
  "Timestamp",
  "หน่วยงาน",
  "เรื่องที่รับบริการ",
  "ระดับความพึงพอใจของท่าน",
  "ท่านไม่พึงพอใจในเรื่องใด",
  "ข้อเสนอแนะ/ข้อร้องเรียน"
];

function ensureResponseSheet(ss) {
  let sheet = ss.getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RESPONSE_SHEET_NAME);
    sheet.appendRow(HEADER);
    return sheet;
  }
  const existingHeader = sheet.getRange(1, 1, 1, HEADER.length).getValues()[0];
  let needHeader = false;
  for (let i = 0; i < HEADER.length; i++) {
    if (!existingHeader[i] || existingHeader[i].toString().trim() !== HEADER[i]) {
      needHeader = true;
      break;
    }
  }
  if (needHeader) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  }
  return sheet;
}

function sanitize(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.map(v => String(v)).join(", ");
  return String(val);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
  } catch (lockErr) {
    console.error("Lock timeout:", lockErr);
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server busy — please try again"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ensureResponseSheet(ss);

    // accept JSON or form-urlencoded
    let department = "", q0 = "", q1 = "", q2 = "", q3 = "";
    try {
      if (e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1) {
        const body = JSON.parse(e.postData.contents || '{}');
        department = sanitize(body.department);
        q0 = sanitize(body.q0);
        q1 = sanitize(body.q1);
        q2 = sanitize(body.q2);
        q3 = sanitize(body.q3);
      } else {
        department = sanitize(e.parameter && e.parameter.department);
        q0 = sanitize(e.parameter && e.parameter.q0);
        q1 = sanitize(e.parameter && e.parameter.q1);
        q2 = sanitize(e.parameter && e.parameter.q2);
        q3 = sanitize(e.parameter && e.parameter.q3);
      }
    } catch (parseErr) {
      console.warn('parse postData failed, fallback to e.parameter', parseErr);
      department = sanitize(e.parameter && e.parameter.department);
      q0 = sanitize(e.parameter && e.parameter.q0);
      q1 = sanitize(e.parameter && e.parameter.q1);
      q2 = sanitize(e.parameter && e.parameter.q2);
      q3 = sanitize(e.parameter && e.parameter.q3);
    }
    const row = [ new Date(), department, q0, q1, q2, q3 ];
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error("doPost error:", err);
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  } finally {
      try {
          if (lock) lock.releaseLock();
      } catch (e) {
          console.error("Failed to release lock:", e);
      }
  }
}

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Services");
  const values = sheet.getDataRange().getValues();
  const header = values.shift();

  if (e.parameter.services) {
    const dept = e.parameter.services;
    const list = values
      .filter(row => row[0] === dept)   // col A = department
      .map(row => row[1]);             // col B = service
    return ContentService
      .createTextOutput(JSON.stringify({ services: list }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ message: "Invalid request" }))
    .setMimeType(ContentService.MimeType.JSON);
}