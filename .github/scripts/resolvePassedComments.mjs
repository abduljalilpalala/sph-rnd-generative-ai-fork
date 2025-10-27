import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";
import { execSync } from "child_process";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    // 1️⃣ Call getPreviousCases to generate previous.json
    console.log("🔹 Running getPreviousCases...");
    execSync(`node .github/scripts/getPreviousCases.mjs`, { stdio: "inherit" });

    // 2️⃣ Read parsed JSON
    if (!fs.existsSync("previous.json")) {
      exitWith("❌ Could not find previous.json");
      return;
    }

    const cases = JSON.parse(fs.readFileSync("previous.json", "utf8"));
    const passedIds = cases
      .filter((c) => c.VERDICT?.includes("✅ PASS"))
      .map((c) => c.TEST_CASE_ID);

    if (!passedIds.length) {
      console.log("✅ No PASS test cases found. Nothing to resolve.");
      return;
    }

    console.log(`✅ Found ${passedIds.length} passed test cases to resolve.`);

    // 3️⃣ Get all review comments
    const { data: reviewComments } = await octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    const unresolved = reviewComments.filter((c) => !c.resolved);

    if (!unresolved.length) {
      console.log("✅ No unresolved review comments.");
      return;
    }

    // 4️⃣ Find comments matching TEST_CASE_ID
    const matchedComments = unresolved.filter((comment) =>
      passedIds.some((id) => comment.body.includes(id))
    );

    if (!matchedComments.length) {
      console.log("✅ No unresolved comments match passed test cases.");
      return;
    }

    console.log(`🔹 Found ${matchedComments.length} matching unresolved comments.`);

    // 5️⃣ Resolve them
    for (const comment of matchedComments) {
      try {
        console.log(`🟢 Resolving comment ${comment.id} (${comment.path})...`);
        await octokit.request(
          "PUT /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/resolve",
          {
            owner,
            repo,
            pull_number: prNumber,
            comment_id: comment.id,
          }
        );
        console.log(`✅ Resolved ${comment.id}`);
      } catch (err) {
        console.warn(`⚠️ Failed to resolve ${comment.id}:`, err.message);
      }
    }

    console.log("🎉 Done resolving all passed test case comments!");
  } catch (err) {
    exitWith("❌ Error in resolvePassedComments.mjs:", err);
  }
})();
