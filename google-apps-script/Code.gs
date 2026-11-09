/**
 * AfyaPlate CEO Dashboard — secure Google Apps Script data endpoint.
 *
 * Deploy as a Web App:
 *   Execute as: User accessing the web app
 *   Who has access: Anyone with a Google account
 * Then open the deployment URL once while signed in as weldonkibiwot228@gmail.com
 * and authorize access. The dashboard checks the signed-in Google email on every request.
 */
const ALLOWED_EMAIL = "weldonkibiwot228@gmail.com";
const SPREADSHEET_ID = "1NltrQs0Wl2LGk8kIa_RFOl5WCegearuNhL9da5juWtw";

function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) || "";
  let payload;
  try {
    const email = (Session.getActiveUser().getEmail() || "").toLowerCase();
    if (email !== ALLOWED_EMAIL.toLowerCase()) {
      throw new Error("Access denied. Sign in with the AfyaPlate owner Google account.");
    }
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    let responseSheet = null;
    let values = [];
    for (const sheet of sheets) {
      const candidate = sheet.getDataRange().getDisplayValues();
      if (candidate.length > 1 && candidate[0].some(h => /feedback|rating|suggestion|email|timestamp|time|message|comment/i.test(h))) {
        responseSheet = sheet;
        values = candidate;
        break;
      }
    }
    if (!responseSheet) {
      responseSheet = sheets[0];
      values = responseSheet ? responseSheet.getDataRange().getDisplayValues() : [];
    }
    const headers = values.length ? values[0] : [];
    const rows = values.length > 1 ? values.slice(1).filter(row => row.some(cell => String(cell).trim() !== "")) : [];
    payload = {
      ok: true,
      owner: email,
      sheetName: responseSheet ? responseSheet.getName() : "",
      headers: headers,
      rows: rows.slice(-200).reverse(),
      total: rows.length,
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    payload = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
