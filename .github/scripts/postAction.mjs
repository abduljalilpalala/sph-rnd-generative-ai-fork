import { octokit, repoInfo } from "./_config.mjs";
import { updateStatusFeedback } from "./_githubComment.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    // Fetch the latest PR reviews
    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    if (!reviews?.length) {
      console.log("⚠️ No PR reviews found.");
      await updateStatusFeedback("No reviews found");
      return;
    }

    // Filter reviews by Claude
    const claudeReviews = reviews.filter(r => {
      const author = (r.user?.login || "").toLowerCase();
      return (
        author.includes("claude") ||
        author.includes("anthropic") ||
        author.includes("github-actions") ||
        author.endsWith("[bot]")
      );
    });

    if (!claudeReviews.length) {
      console.log("⚠️ No Claude reviews found in this PR.");
      await updateStatusFeedback("No Claude review found");
      return;
    }

    // Get the latest Claude review
    const latest = claudeReviews.sort(
      (a, b) => new Date(b.submitted_at || b.created_at) - new Date(a.submitted_at || a.created_at)
    )[0];

    const state = latest?.state?.toLowerCase() || "";
    console.log(`🧩 Latest Claude review state: ${state}`);

    // Determine label action
    const reviewingLabel = "Claude QA Reviewing";
    const approvedLabel = "Claude QA Approved";

    const { data: currentLabels } = await octokit.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: prNumber,
    });

    const currentLabelNames = currentLabels.map(l => l.name);

    // Handle "changes requested"
    if (state === "changes_requested") {
      console.log(`🟡 Adding label: ${reviewingLabel}`);
      if (!currentLabelNames.includes(reviewingLabel)) {
        await octokit.rest.issues.addLabels({
          owner,
          repo,
          issue_number: prNumber,
          labels: [reviewingLabel],
        });
      }

      // remove "Approved" if exists
      if (currentLabelNames.includes(approvedLabel)) {
        console.log(`⚙️ Removing label: ${approvedLabel}`);
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: prNumber,
          name: approvedLabel,
        });
      }

      await updateStatusFeedback("Claude requested changes");
    }

    // Handle "approved"
    else if (state === "approved") {
      console.log(`🟢 Adding label: ${approvedLabel}`);
      if (!currentLabelNames.includes(approvedLabel)) {
        await octokit.rest.issues.addLabels({
          owner,
          repo,
          issue_number: prNumber,
          labels: [approvedLabel],
        });
      }

      // remove "Reviewing" if exists
      if (currentLabelNames.includes(reviewingLabel)) {
        console.log(`⚙️ Removing label: ${reviewingLabel}`);
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: prNumber,
          name: reviewingLabel,
        });
      }

      await updateStatusFeedback("Claude approved the PR");
    }

    // Handle other states
    else {
      console.log("ℹ️ Latest Claude review state is neither approved nor changes_requested.");
      await updateStatusFeedback(`State: ${state || "unknown"}`);
    }

    updateStatusFeedback("Done");
  } catch (err) {
    exitWith("❌ Error in postAction:", err);
  }
})();
