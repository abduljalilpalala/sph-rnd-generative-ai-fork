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

    // Filter summary comments
    const claudeComments = comments.filter((c) =>
      c.body?.includes("## 📄 Claude QA Summary")
    );

    if (!claudeComments.length) {
      console.log("none");
      return;
    }

    // Take latest
    const latest = claudeComments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const body = latest.body || "";
    const marker = "## 📄 Detailed test case result";

    console.log(`🔍 Searching for marker: "${marker}"`);
    const startIndex = body.indexOf(marker);
    console.log(`📌 Marker index result: ${startIndex}`);

    if (startIndex === -1) {
      console.log("⚠️ Could not find '## 📄 Detailed test case result' section.");
      return;
    }

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

      // ✅ Updated regex to handle both [TC-001] and TC-001
      const summaryMatch = block.match(
        /<summary>\s*<strong>\[?([^\]<]+)\]?\s*<\/strong>\s*\(([^)]+)\):\s*(.*?)<\/summary>/is
      );

      const TEST_CASE_ID = summaryMatch ? summaryMatch[1].trim() : "";
      const VERDICT = summaryMatch ? summaryMatch[2].trim() : "";
      const EXPECTED_RESULT = summaryMatch ? summaryMatch[3].trim() : "";

      // Extract all lines inside <details> after the summary
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
