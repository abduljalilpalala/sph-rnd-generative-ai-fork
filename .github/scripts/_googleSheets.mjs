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
      return [];
    }

    // Map rows to objects. Note: r is an array of cells for the row.
    const mapped = filtered.map(r => {
      const id = String(r[0]).trim();

      // Join middle columns into a single description string.
      // r.slice(1, -1) is an array; join into a string first.
      const rawDescParts = r.slice(1, -1).map(c => (c === undefined || c === null) ? "" : String(c));
      const rawDesc = rawDescParts.join(" | ").trim();

      // Now normalize: replace newlines with semicolons, collapse multiple spaces, trim.
      const description = rawDesc
        .replace(/\r\n|\r|\n+/g, '; ')  // Replace any newline style with semicolon + space
        .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
        .replace(/;\s*;+/g, '; ')       // Collapse accidental repeated semicolons
        .replace(/\s*\|\s*/g, ' | ')    // normalize pipes spacing
        .trim()
        .replace(/^\| /, '')            // remove leading pipe if any
        .replace(/ \|$/, '');           // remove trailing pipe if any

      const expected = (r[r.length - 1] === undefined || r[r.length - 1] === null)
        ? ""
        : String(r[r.length - 1]).trim();

      return { id, description, expected };
    });

    // --- Beautified console output (single-line, no surrounding quotes) ---
    // This only affects the logs. The 'mapped' return value remains a proper array of objects.
    const beautified = mapped.map(tc => {
      // sanitize inner commas to avoid confusing the log (optional):
      const desc = tc.description;
      const expected = tc.expected;
      return { id: ${tc.id}, description: ${desc}, expected: ${expected} };
    });

    return beautified;
  } catch (error) {
    const svc = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
    if (svc?.client_email) console.log(`👤 Service account: ${svc.client_email}`);
    await exitWith(`❌ Error in getQATestCases: ${error.message}`);
  }
}
