/**
 * AfyaPlate CEO Dashboard — private server-side feedback viewer.
 *
 * IMPORTANT DEPLOYMENT SETTINGS:
 * 1. Deploy as a Web app.
 * 2. Execute as: User accessing the web app.
 * 3. Who has access: Anyone with a Google account (or the closest
 *    signed-in-Google-account option shown in your deployment dialog).
 * 4. The founder account is checked on the server before the sheet is opened.
 * 5. Authorize the spreadsheet permission while signed in as the founder.
 *
 * This file is kept in GitHub as the source of truth. It does not deploy
 * itself to Google Apps Script; a web-app deployment is still required.
 */

const AFYAPLATE_OWNER_EMAIL = 'weldonkibiwot228@gmail.com';
const AFYAPLATE_FEEDBACK_SHEET_ID = '1QWHJ6a-JWZU2mmPm8ot7tvyaanHbh5AGPs3wOOKRlQY';

function doGet() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();

  if (email !== AFYAPLATE_OWNER_EMAIL) {
    return HtmlService.createHtmlOutput(
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Access denied | AfyaPlate</title></head><body style="font:16px system-ui;padding:32px;color:#19352a">' +
      '<h1>AfyaPlate CEO Dashboard</h1><p>Access denied. Sign in with the founder Google account.</p>' +
      '</body></html>'
    ).setTitle('Access denied | AfyaPlate');
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(AFYAPLATE_FEEDBACK_SHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    const values = sheet.getDataRange().getDisplayValues();
    const headers = values.length ? values[0] : [];
    const rows = values.length > 1 ? values.slice(1).reverse().slice(0, 100) : [];
    const ratingIndex = headers.findIndex(h => /rating|rate|stars|score/i.test(String(h)));
    const dateIndex = headers.findIndex(h => /timestamp|date|time/i.test(String(h)));
    const ratings = ratingIndex < 0 ? [] : rows
      .map(row => Number(String(row[ratingIndex] || '').replace(/[^0-9.]/g, '')))
      .filter(n => Number.isFinite(n) && n > 0 && n <= 5);
    const average = ratings.length
      ? (ratings.reduce((sum, n) => sum + n, 0) / ratings.length).toFixed(1) + '/5'
      : '—';

    const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    const table = headers.length
      ? '<div class="table-wrap"><table><thead><tr>' +
        headers.map(h => '<th>' + esc(h) + '</th>').join('') +
        '</tr></thead><tbody>' +
        rows.map(row => '<tr>' + headers.map((h, i) =>
          '<td>' + esc(row[i] || '') + '</td>'
        ).join('') + '</tr>').join('') +
        '</tbody></table></div>'
      : '<p class="empty">No feedback columns found in the first sheet.</p>';

    const latest = rows.length && dateIndex >= 0 ? esc(rows[0][dateIndex]) : '—';
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AfyaPlate CEO Dashboard</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f7f8f2;color:#19352a;font:15px/1.5 system-ui,Arial,sans-serif}
header{background:#174f35;color:white;padding:24px 18px}main{max-width:1050px;margin:auto;padding:22px 16px 48px}
h1{margin:0 0 5px;font-size:clamp(1.6rem,5vw,2.3rem)}header p{margin:0;color:#d8eadc}
.panel{background:white;border:1px solid #e5eae1;border-radius:16px;padding:18px;margin-bottom:16px}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.stat{background:#f0f5e9;border-radius:12px;padding:15px}.stat span{display:block;color:#687b70;font-size:.82rem}.stat strong{display:block;font-size:1.5rem;color:#145b43;margin-top:5px}
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.86rem}th,td{text-align:left;padding:10px;border-bottom:1px solid #e5eae1;vertical-align:top;min-width:110px;overflow-wrap:anywhere}th{background:#f4f8f0;color:#145b43}
.empty{padding:20px;color:#687b70}
@media(max-width:600px){.stats{grid-template-columns:1fr}.panel{padding:14px}}
</style></head><body>
<header><h1>AfyaPlate CEO Dashboard</h1><p>Founder access verified · ${esc(email)}</p></header>
<main>
<section class="panel"><div class="stats">
<div class="stat"><span>Total feedback submissions</span><strong>${Math.max(0, values.length - 1)}</strong></div>
<div class="stat"><span>Average rating</span><strong>${average}</strong></div>
<div class="stat"><span>Latest response</span><strong>${latest}</strong></div>
</div></section>
<section class="panel"><h2>Recent client feedback</h2><p>Showing up to the latest 100 responses from ${esc(sheet.getName())}.</p>${table}</section>
</main></body></html>`;

    return HtmlService.createHtmlOutput(html)
      .setTitle('AfyaPlate CEO Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    const message = String(error && error.message ? error.message : error)
      .replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    return HtmlService.createHtmlOutput(
      '<h1>AfyaPlate dashboard could not load feedback</h1><p>' + message + '</p>' +
      '<p>Check that the founder account has permission to open the feedback spreadsheet.</p>'
    ).setTitle('AfyaPlate dashboard error');
  }
}
