import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log(`🔍 Checking if recent QA Summary was posted within cooldown window on PR #${prNumber}...`);

    // 1️⃣ Fetch PR info to log SHA
    const { data: pr } = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });
    const currentSha = pr.head.sha.substring(0, 7);
    console.log(`Current PR commit: ${currentSha}`);

    // 2️⃣ Fetch all PR comments
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    if (!comments?.length) {
      console.log("⚠️ No comments found. Proceeding...");
      return;
    }

    // 3️⃣ Find the most recent Claude QA Summary comment
    const claudeComments = comments
      .filter((c) => c.body?.includes("## 📄 Claude QA Summary"))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!claudeComments.length) {
      console.log("⚠️ No Claude QA Summary comments found. Proceeding...");
      return;
    }

    const latest = claudeComments[0];
    const body = latest.body || "";
    const summaryTime = new Date(latest.created_at);
    const now = new Date();
    const diffMinutes = (now - summaryTime) / (1000 * 60);

    console.log(`🕒 Latest QA Summary posted: ${summaryTime.toISOString()}`);
    console.log(`⏱️ Time since last summary: ${diffMinutes.toFixed(2)} minutes`);

    const COOLDOWN_MINUTES = 10;

    // 4️⃣ Skip if last summary too recent
    if (diffMinutes <= COOLDOWN_MINUTES) {
      console.log(`⏹️ Last QA Summary is too recent (< ${COOLDOWN_MINUTES} mins). Skipping workflow.`);

      const message = [
        `⏳ The last QA Review was posted **${diffMinutes.toFixed(1)} minutes ago**.`,
        `Please wait at least **${COOLDOWN_MINUTES} minutes** before triggering another review.`,
        `Last summary: [📄 View Summary](${latest.html_url})`,
      ].join("\n");

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: message,
      });

      await exitWith("📝 Skipped — QA Summary too recent.");
      return;
    }

    // 5️⃣ Optional: keep commit comparison for context only
    const match = body.match(/latest commit:\s*([a-f0-9]{7,40})/i);
    if (match) {
      console.log(`Last reviewed commit recorded in summary: ${match[1].substring(0, 7)}`);
    }

    console.log("✅ Last summary older than cooldown window. Proceeding...");
  } catch (err) {
    exitWith("❌ Error during commit check:", err);
  }
})();
