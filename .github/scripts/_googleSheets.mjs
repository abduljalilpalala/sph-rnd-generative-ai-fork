import { google } from "googleapis";
import { exitWith } from "./_helpers.mjs";

export async function getQATestCases (spreadsheetUrl, ids = [], excludeIds = [], GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const spreadsheetId = spreadsheetIdMatch ? spreadsheetIdMatch[1] : null;

    const rangeMatch = spreadsheetUrl.match(/[?#].*?range=([A-Za-z0-9:!]+)/);
    const range = rangeMatch ? decodeURIComponent(rangeMatch[1]) : null;

    const gidMatch = spreadsheetUrl.match(/[?#].*?gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : null;

    if (!spreadsheetId) await exitWith("❌ Could not extract spreadsheet ID from the provided URL.");
    if (!range)
      await exitWith("❌ No range detected in the Google Sheets URL. Please include '?range=' in the link.");

    console.log(`📘 Reading Google Sheet: ${spreadsheetId}`);
    console.log(`📗 Range to read: ${range}`);

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = meta.data.sheets.find(s => String(s.properties.sheetId) === gid);
    const sheetName = sheet?.properties?.title;

    if (!sheetName) await exitWith(`❌ Could not find sheet for gid '${gid}'.`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    const rows = res.data.values || [];
    if (!rows.length) await exitWith(`❌ No data found in range '${sheetName}!${range}'`);

    const dataRows = rows.filter(r => /^\d+$/.test(r[0]));
    let filtered = [];

    const validIds = (ids || []).map(i => String(i).trim()).filter(Boolean);
    const validExceptIds = (excludeIds || []).map(i => String(i).trim()).filter(Boolean);

    if (validIds.length > 0) {
      filtered = dataRows.filter(r => validIds.includes(String(r[0]).trim()));
    } else if (validExceptIds.length > 0) {
      filtered = dataRows.filter(r => !validExceptIds.includes(String(r[0]).trim()));
    } else {
      filtered = dataRows;
    }


    if (!filtered.length) {
      console.log(`⚠️ No matching test cases found. Skipping testcase analysis.`);
      return [];
    }

    console.log(
      ids.length
        ? `✅ Filtered ${filtered.length}/${rows.length} test cases by IDs.`
        : excludeIds.length
          ? `🚫 Excluded ${excludeIds.length} test cases. Using ${filtered.length} remaining.`
          : `ℹ️ Using all ${rows.length} test cases from the range.`
    );

    const mapped = filtered.map(r => ({
      id: r[0],
      description: r.slice(1, -1)
        .join(" | ")
        .replace(/^>+/gm, "") // remove blockquotes
        .replace(/[_*`]/g, "") // remove markdown emphasis
        .replace(/-{3,}/g, "") // remove divider lines
        .replace(/\n{2,}/g, "\n") // normalize multiple newlines
        .trim(),
      expected: r[r.length - 1],
    }));

    return mapped;
  } catch (error) {
    const svc = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log(`👤 Service account: ${svc.client_email}`);
    await exitWith(`❌ Error in getQATestCases: ${error.message}`);
  }
}
