import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log("===== 🟦 DEBUG MODE ENABLED — getPreviousCases.mjs =====");
    console.log(`🔎 Fetching previous test cases for PR #${prNumber}...\n`);

    // Fetch comments
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    console.log(`📌 Total comments found: ${comments?.length}`);

    if (!comments?.length) {
      console.log("⚠️ No comments found on this PR.");
      return;
    }

    // Filter summary comments
    const claudeComments = comments.filter((c) =>
      c.body?.includes("## 📄 Claude QA Summary")
    );

    console.log(`📌 QA summary comments detected: ${claudeComments.length}`);

    if (!claudeComments.length) {
      console.log("❗ No Claude QA summary comments found.");
      return;
    }

    // Take latest
    const latest = claudeComments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    console.log("\n====== 🟧 RAW COMMENT BODY (START) ======");
    console.log(latest.body);
    console.log("====== 🟧 RAW COMMENT BODY (END) ======\n");

    const body = latest.body || "";
    const marker = "## 📄 Detailed test case result";

    console.log(`🔍 Searching for marker: "${marker}"`);
    const startIndex = body.indexOf(marker);
    console.log(`📌 Marker index result: ${startIndex}`);

    if (startIndex === -1) {
      console.log("❌ Marker not found in comment body. Cannot continue.");
      return;
    }

    const contentAfter = body.slice(startIndex + marker.length).trim();

    console.log("\n====== 🟨 CONTENT AFTER MARKER (START) ======");
    console.log(contentAfter);
    console.log("====== 🟨 CONTENT AFTER MARKER (END) ======\n");

    // Match <details> blocks
    const detailsMatches = [...contentAfter.matchAll(/<details>[\s\S]*?<\/details>/g)];

    console.log(`📌 Total <details> blocks detected: ${detailsMatches.length}`);

    if (!detailsMatches.length) {
      console.log("❌ No <details> blocks found. Cannot extract test cases.");
      return;
    }

    console.log("\n====== 🟪 RAW DETAILS BLOCKS (START) ======");
    detailsMatches.forEach((m, idx) => {
      console.log(`--- Block ${idx + 1} ---`);
      console.log(m[0]);
    });
    console.log("====== 🟪 RAW DETAILS BLOCKS (END) ======\n");

    console.log("\n===== 🟩 DEBUG MODE END — stopping here (no parsing yet) =====");
    return; // STOP HERE — DO NOT PARSE TEST CASES YET

  } catch (err) {
    console.error("❌ ERROR (RAW):");
    console.error(err);
    console.error(err.stack);
    throw err;
  }
})();
