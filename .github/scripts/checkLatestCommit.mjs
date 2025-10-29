import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log(`🔍 Checking if latest commit already reviewed on PR #${prNumber}...`);

    // 1️⃣ Fetch PR info to get current head SHA
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

    // 4️⃣ Extract the "latest commit" line
    const match = body.match(/latest commit:\s*([a-f0-9]{7,40})/i);
    if (!match) {
      console.log("⚠️ No commit hash found in last summary. Proceeding...");
      return;
    }

    const lastCommit = match[1].substring(0, 7);
    console.log(`Last reviewed commit: ${lastCommit}`);

    // 5️⃣ Compare commits
    if (currentSha === lastCommit) {
      console.log("⏹️ Same commit detected. Skipping workflow.");

      // Post a PR comment before exiting
      const message = [
        `No change since from the last commit (${lastCommit}).`,
        `Please check [📄 Claude QA Summary Link](${latest.html_url}). Skipping workflow.`,
      ].join("\n");

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: message,
      });

      console.log("📝 Posted skip comment to PR.");
      process.exit(0); // graceful stop
    } else {
      console.log("✅ New commit detected. Proceeding...");
    }
  } catch (err) {
    exitWith("❌ Error during commit check:", err);
  }
})();
