import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    // 🔹 Fetch all PR comments (issue comments)
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    if (!comments?.length) {
      console.log("⚠️ No comments found on this PR.");
      return;
    }

    // 🔹 Filter comments that contain Claude qa summary
    const claudeComments = comments.filter((c) =>
      c.body?.includes("## 📄 Claude QA Summary")
    );

    if (!claudeComments.length) {
      console.log("⚠️ No Claude qa summary comments found.");
      return;
    }

    // 🔹 Sort comments newest → oldest
    const latest = claudeComments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const body = latest.body || "";
    const marker = "## 📄 Detailed test case result";

    // 🔹 Find start marker
    const startIndex = body.indexOf(marker);
    if (startIndex === -1) {
      console.log("⚠️ Could not find '## 📄 Detailed test case result' section.");
      return;
    }

    // 🔹 Extract everything after the marker
    const contentAfter = body.slice(startIndex + marker.length).trim();

    // 🔹 Match all <details>...</details> blocks
    const detailsMatches = [...contentAfter.matchAll(/<details>[\s\S]*?<\/details>/g)];
    if (!detailsMatches.length) {
      console.log("none");
      return;
    }

    // 🔹 Parse each test case
    const testCases = detailsMatches.map((m) => {
      const block = m[0];

      // Extract Test Case ID, Verdict, and Expected Result
      const summaryMatch = block.match(
        /<summary>\s*<strong>\[([^\]]+)\]<\/strong>\s*\(([^)]+)\):\s*(.*?)<\/summary>/is
      );

      const TEST_CASE_ID = summaryMatch ? summaryMatch[1].trim() : "";
      const VERDICT = summaryMatch ? summaryMatch[2].trim() : "";
      const EXPECTED_RESULT = summaryMatch ? summaryMatch[3].trim() : "";

      // Extract all lines inside the <details> block after the summary
      const contentMatch = block.match(/<\/summary>([\s\S]*?)<\/details>/i);
      let DETAILS = contentMatch ? contentMatch[1].trim() : "";

      // Clean Markdown symbols
      DETAILS = DETAILS
        .replace(/^>+/gm, "") // remove blockquotes
        .replace(/[_*`]/g, "") // remove markdown emphasis
        .replace(/-{3,}/g, "") // remove divider lines
        .replace(/\n{2,}/g, "\n") // normalize multiple newlines
        .trim();

      return {
        TEST_CASE_ID,
        VERDICT,
        EXPECTED_RESULT,
        DETAILS,
      };
    });

    // 🔹 Output JSON to console
    const jsonOutput = JSON.stringify(testCases, null, 2);
    console.log(jsonOutput);

    // 🔹 Optionally write to file (useful for debugging)
    fs.writeFileSync("previous.json", jsonOutput, "utf8");
  } catch (err) {
    exitWith("❌ Error extracting previous test cases:", err);
  }
})();
