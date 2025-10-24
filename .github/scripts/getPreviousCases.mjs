import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    // 🔹 Fetch all PR comments (issue comments, not review comments)
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

    // 🔹 Filter only comments that contain Claude summary section
    const claudeComments = comments.filter((c) =>
      c.body?.includes("## 📄 Claude Summary")
    );

    if (!claudeComments.length) {
      console.log("⚠️ No Claude summary comments found.");
      return;
    }

    // 🔹 Sort comments newest → oldest
    const latest = claudeComments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const body = latest.body || "";
    const marker = "## 📄 Detailed test case result";

    // 🔹 Find starting point of "Detailed test case result"
    const startIndex = body.indexOf(marker);
    if (startIndex === -1) {
      console.log("⚠️ Could not find '## 📄 Detailed test case result' section.");
      return;
    }

    // 🔹 Extract everything after that line
    const contentAfter = body.slice(startIndex + marker.length).trim();

    // 🔹 Stop before the next "---" or next section divider (if any)
    // Match all <details>...</details> blocks
    const detailsMatches = [...contentAfter.matchAll(/<details>[\s\S]*?<\/details>/g)];

    if (!detailsMatches.length) {
      console.log("none");
      return;
    }

    // 🔹 Combine and clean output
    const markdownOutput = detailsMatches
      .map((m) => m[0].trim())
      .join("\n\n");

    // 🔹 Print to console and write to file
    console.log(markdownOutput);
    fs.writeFileSync("previous.md", markdownOutput, "utf8");

    console.log(`✅ Extracted ${detailsMatches.length} test cases to previous.md`);
  } catch (err) {
    exitWith("❌ Error extracting previous test cases:", err);
  }
})();
