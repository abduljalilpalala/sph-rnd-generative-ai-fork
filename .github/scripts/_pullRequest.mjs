import { octokit, repoInfo } from './_config.mjs';
import { exitWith } from "./_helpers.mjs";

export async function getChangedFiles (prNumber) {
  if (!prNumber) {
    await exitWith("❌ PR number is missing.");
  }

  console.log(`🔎 Fetching changed files for PR #${prNumber}`);

  const files = [];
  const perPage = 100;
  let page = 1;

  try {
    while (true) {
      const { data } = await octokit.pulls.listFiles({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        pull_number: prNumber,
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;
      files.push(...data);
      if (data.length < perPage) break;
      page++;
    }

    console.log(`✅ Retrieved ${files.length} changed files`);
  } catch (error) {
    await exitWith(`❌ Error in fetching the changed files: ${error.message}`);
  }
  return files.map(f => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch,
  }));
}

export async function getSpreadsheetDataFromPR () {
  try {
    const pr = await octokit.pulls.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      pull_number: repoInfo.prNumber,
    });

    const body = pr.data.body || "";

    const ids = (body.match(/(?<!exclude)ids:\s*([\d,\s]+)/i)?.[1] || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    const excludeIds = (body.match(/excludeIds:\s*([\d,\s]+)/i)?.[1] || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    const spreadsheetUrl =
      body.match(/testcase:\s*(https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\s]+)/i)?.[1] ||
      null;

    return { ids, excludeIds, spreadsheetUrl };
  } catch (error) {
    await exitWith(`❌ Error in getSpreadsheetDataFromPR: ${error.message}`);
  }
}
