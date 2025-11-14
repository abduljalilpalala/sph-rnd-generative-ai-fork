import fs from "fs";
import { Octokit } from "@octokit/rest";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const {
      GITHUB_TOKEN,
      PR_NUMBER,
      COMMIT_SHA,
      REPO_OWNER,
      REPO_NAME,
    } = process.env;

    if (!GITHUB_TOKEN) await exitWith("❌ Missing GITHUB_TOKEN");
    if (!PR_NUMBER) await exitWith("❌ Missing PR_NUMBER");
    if (!COMMIT_SHA) await exitWith("❌ Missing COMMIT_SHA");

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // -----------------------------
    // LOAD CLAUDE OUTPUT
    // -----------------------------
    if (!fs.existsSync("claude_output.json")) {
      await exitWith("❌ claude_output.json not found");
    }

    let result;
    try {
      result = JSON.parse(fs.readFileSync("claude_output.json", "utf8"));
    } catch (err) {
      await exitWith("❌ Failed to parse JSON output from Claude");
    }

    const summary = result.summary || "";
    const inlineComments = result.inline_comments || [];

    // -----------------------------
    // POST SUMMARY COMMENT
    // -----------------------------
    console.log("📝 Posting summary comment...");
    await octokit.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: PR_NUMBER,
      body: summary,
    });

    // -----------------------------
    // POST INLINE COMMENTS
    // -----------------------------
    if (inlineComments.length === 0) {
      console.log("ℹ️ No inline comments to post.");
      return;
    }

    console.log(`💬 Posting ${inlineComments.length} inline comment(s)...`);

    for (const c of inlineComments) {
      try {
        await octokit.pulls.createReviewComment({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          pull_number: PR_NUMBER,
          commit_id: COMMIT_SHA,
          path: c.path,
          body: c.body,
          line: c.end_line,
          side: "RIGHT",
          start_line: c.start_line,
        });
      } catch (err) {
        console.log(`⚠️ Failed to post inline comment for ${c.path}: ${err.message}`);
      }
    }

    console.log("✅ Atomic QA Review posted.");
  } catch (error) {
    await exitWith(`❌ postAtomicReview.mjs error: ${error.message}`);
  }
})();
