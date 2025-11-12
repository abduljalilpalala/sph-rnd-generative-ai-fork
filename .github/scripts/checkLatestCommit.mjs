import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log(`🔍 Checking latest commit time for PR #${prNumber}...`);

    // 1️⃣ Fetch PR info to get current head SHA
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const currentSha = pr.head.sha.substring(0, 7);
    console.log(`Current PR commit: ${currentSha}`);

    // 2️⃣ Fetch commit details to get commit date
    const { data: commitData } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: pr.head.sha,
    });

    const commitDate = new Date(commitData.commit.committer.date);
    const now = new Date();
    const diffMinutes = (now - commitDate) / (1000 * 60);

    console.log(`🕒 Commit pushed at: ${commitDate.toISOString()}`);
    console.log(`⏱️ Time since commit: ${diffMinutes.toFixed(2)} minutes`);

    // 3️⃣ Check if within cooldown window
    const COOLDOWN_MINUTES = 10;
    if (diffMinutes <= COOLDOWN_MINUTES) {
      console.log(`⏹️ Commit is too recent (< ${COOLDOWN_MINUTES} mins). Skipping workflow.`);

      // 4️⃣ Post a comment on PR before exiting
      const message = [
        `⏳ The latest commit (${currentSha}) was pushed **${diffMinutes.toFixed(1)} minutes ago**.`,
        `Please wait at least **${COOLDOWN_MINUTES} minutes** before triggering another review.`,
      ].join("\n");

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: message,
      });

      await exitWith("📝 Posted skip comment due to recent commit.");
      return;
    }

    // 5️⃣ Proceed normally
    console.log("✅ Commit is older than cooldown window. Proceeding...");
  } catch (err) {
    exitWith("❌ Error during commit check:", err);
  }
})();
