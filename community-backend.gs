/**
 * AfyaPlate Community backend
 * Deploy this Apps Script as a Web App: Execute as Me; Who has access: Anyone.
 * Set Script Properties:
 *   SHEET_ID = your Google spreadsheet ID
 *   ADMIN_KEY = a long private random key known only to the CEO
 *
 * Run initializeCommunitySheet() once from the Apps Script editor.
 */
function initializeCommunitySheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (!id) throw new Error('Set SHEET_ID in Project Settings > Script properties first.');
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName('CommunityPosts') || ss.insertSheet('CommunityPosts');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','createdAt','name','topic','message','status','reviewedAt']);
    sheet.setFrozenRows(1);
  }
  return 'CommunityPosts is ready.';
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = String(p.callback || '');
  var result;
  try {
    var action = String(p.action || 'feed');
    if (action === 'submit') result = submitCommunityPost_(p);
    else if (action === 'feed') result = { ok:true, posts:listCommunityPosts_('approved') };
    else if (action === 'pending') {
      requireAdmin_(p.adminKey);
      result = { ok:true, posts:listCommunityPosts_('pending') };
    } else if (action === 'moderate') {
      requireAdmin_(p.adminKey);
      result = moderateCommunityPost_(p);
    } else result = { ok:false, error:'Unknown action.' };
  } catch (err) {
    result = { ok:false, error:String(err && err.message ? err.message : err) };
  }
  var json = JSON.stringify(result);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function communitySheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Community service is not configured: SHEET_ID is missing.');
  var sheet = SpreadsheetApp.openById(id).getSheetByName('CommunityPosts');
  if (!sheet) throw new Error('Run initializeCommunitySheet() once in Apps Script.');
  return sheet;
}

function submitCommunityPost_(p) {
  var name = String(p.name || '').trim().slice(0,40);
  var topic = String(p.topic || '').trim();
  var message = String(p.message || '').trim().slice(0,700);
  var allowed = ['Kenyan meal ideas','Budget tips','Cooking questions','Meal-planning wins','Food and nutrition'];
  if (name.length < 2) throw new Error('Please enter a name or nickname (at least 2 characters).');
  if (allowed.indexOf(topic) === -1) throw new Error('Choose a valid community topic.');
  if (message.length < 8) throw new Error('Please write at least 8 characters.');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = communitySheet_();
    var id = Utilities.getUuid();
    sheet.appendRow([id, new Date().toISOString(), name, topic, message, 'pending', '']);
    return { ok:true, message:'Submitted for review.' };
  } finally { lock.releaseLock(); }
}

function listCommunityPosts_(status) {
  var sheet = communitySheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var posts = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (String(r[5]) === status) posts.push({
      id:String(r[0]), createdAt:String(r[1]), name:String(r[2]),
      topic:String(r[3]), message:String(r[4])
    });
  }
  posts.reverse();
  return posts.slice(0,100);
}

function requireAdmin_(key) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected || String(key || '') !== expected) throw new Error('CEO key is missing or incorrect.');
}

function moderateCommunityPost_(p) {
  var id = String(p.id || '');
  var status = String(p.status || '');
  if (!id || ['approve','reject'].indexOf(status) === -1) throw new Error('Invalid moderation request.');
  var sheet = communitySheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === id && String(values[i][5]) === 'pending') {
      sheet.getRange(i + 1, 6).setValue(status === 'approve' ? 'approved' : 'rejected');
      sheet.getRange(i + 1, 7).setValue(new Date().toISOString());
      return { ok:true, status:status };
    }
  }
  throw new Error('Pending post not found. Refresh the pending list.');
}