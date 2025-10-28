import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log(`🔍 Checking latest Claude summary comment for PR #${prNumber}...`);

    // 1️⃣ Fetch all comments
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    if (!comments.length) {
      exitWith("❌ No comments found on this PR.");
    }

    // 2️⃣ Find latest comment with "📄 Claude Summary"
    const claudeComments = comments.filter((c) => c.body?.includes("📄 Claude Summary"));
    if (!claudeComments.length) {
      exitWith("❌ No Claude summary comment found.");
    }

    // Sort newest → oldest and get latest
    const latestComment = claudeComments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const body = latestComment.body || "";

    // 3️⃣ Extract the Failed Test Cases count
    const failMatch = body.match(/❌ Failed Test Cases\s*\|\s*(\d+)/);
    const failedCount = failMatch ? parseInt(failMatch[1], 10) : 0;

    console.log(`📊 Failed Test Cases: ${failedCount}`);

    // 4️⃣ Determine review action and label
    const event = failedCount > 0 ? "REQUEST_CHANGES" : "APPROVE";
    const label = failedCount > 0 ? "Claude QA Reviewing" : "Claude QA Approved";

    // 5️⃣ Build Markdown link for summary
    const summaryUrl = latestComment.html_url
      ? latestComment.html_url
      : `https://github.com/${owner}/${repo}/pull/${prNumber}`;
    const summaryLink = `[📄 Claude Summary Link](${summaryUrl})`;

    // 6️⃣ Construct review message with Markdown link
    const reviewBody =
      failedCount > 0
        ? `🚫 Changes required.\n${summaryLink}`
        : `✅ LGTM!\n${summaryLink}`;

    // 7️⃣ Submit PR review
    console.log(`📝 Submitting review: ${event}`);
    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event,
      body: reviewBody,
    });

    // 8️⃣ Add appropriate label
    console.log(`🏷️ Adding label: ${label}`);
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels: [label],
    });

    console.log(`✅ Review process completed successfully.`);
  } catch (err) {
    exitWith("❌ Error in submitClaudeReview.mjs:", err);
  }
})();
