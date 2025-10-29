import {
  GITHUB_EVENT_PATH,
  GOOGLE_SERVICE_ACCOUNT_JSON,
} from "./_config.mjs";
import { getSpreadsheetDataFromPR } from "./_pullRequest.mjs";
import { getQATestCases } from "./_googleSheets.mjs";
import { exitWith, parseComment } from './_helpers.mjs';

(async function main() {
  const { ids, excludeIds, spreadsheetUrl } = await parseComment(GITHUB_EVENT_PATH);
  let sheetUrl = spreadsheetUrl;
  let finalIds = ids;
  let finalExceptIds = excludeIds;

  if (!sheetUrl || (!finalIds.length && !finalExceptIds.length)) {
    const prData = await getSpreadsheetDataFromPR();
    sheetUrl ||= prData.spreadsheetUrl;
    if (!finalIds.length) finalIds = prData.ids;
    if (!finalExceptIds.length) finalExceptIds = prData.excludeIds;
  }

  const testCases = await getQATestCases(sheetUrl, finalIds, finalExceptIds, GOOGLE_SERVICE_ACCOUNT_JSON);

  if (!testCases.length) {
    exitWith('❌ No test cases detected. Kindly make sure your selected range covers only from the "Test Case ID" column up to the "Expected Result" column.');
  }

  console.log(testCases);
})();
