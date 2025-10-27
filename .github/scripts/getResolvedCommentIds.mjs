import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";
import { execSync } from "child_process";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log("🔹 Running getPreviousCases...");
    execSync(`node .github/scripts/getPreviousCases.mjs`, { stdio: "inherit" });

    if (!fs.existsSync("previous.json")) {
      exitWith("❌ Could not find previous.json");
      return;
    }

    const cases = JSON.parse(fs.readFileSync("previous.json", "utf8"));
    const passedIds = cases
      .filter((c) => c.VERDICT?.includes("✅ PASS"))
      .map((c) => c.TEST_CASE_ID);

    if (!passedIds.length) {
      console.log("✅ No passed test cases found. Nothing to resolve.");
      return;
    }

    console.log(`✅ Found ${passedIds.length} passed test cases to resolve.`);

    // 🔹 Get all review comments for this PR
    const { data: reviewComments } = await octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    const unresolved = reviewComments.filter((c) => !c.resolved);

    if (!unresolved.length) {
      console.log("✅ No unresolved review comments found.");
      return;
    }

    // 🔹 Match comments containing passed TEST_CASE_IDs
    const matched = unresolved.filter((comment) =>
      passedIds.some((id) => comment.body.includes(id))
    );

    if (!matched.length) {
      console.log("✅ No unresolved comments match passed test cases.");
      return;
    }

    const result = matched.map((c) => ({
      comment_id: c.id,
      file_path: c.path,
      body_preview: c.body.slice(0, 120),
    }));

    fs.writeFileSync("resolved_comment_ids.json", JSON.stringify(result, null, 2));
    console.log("📦 Generated resolved_comment_ids.json:");
    console.log(JSON.stringify(result, null, 2));

    // Also echo to stdout for Claude MCP input
    console.log("::set-output name=comment_ids::" + JSON.stringify(result));
  } catch (err) {
    exitWith("❌ Error in getResolvedCommentIds.mjs:", err);
  }
})();
