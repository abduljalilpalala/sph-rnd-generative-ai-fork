import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    // Fetch PR comments
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    });

    // Find latest comment
    const latestComment = comments.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const commentBody = latestComment?.body?.trim() || "";

    const lines = commentBody.split(/\r?\n/).map(l => l.trim());

    // Check if @claude-test-review exists
    const tagIndex = lines.findIndex(line =>
      line.toLowerCase().includes("@claude-test-review")
    );

    if (tagIndex === -1) {
      console.log("none");
      return;
    }

    // Slice lines after the tag
    let afterTagLines = lines.slice(tagIndex + 1);

    // Stop reading once we reach the workflow footer (<hr/>)
    const hrIndex = afterTagLines.findIndex(line => line.toLowerCase().includes("<hr/>"));
    if (hrIndex !== -1) {
      afterTagLines = afterTagLines.slice(0, hrIndex);
    }

    // Filter out empty lines
    afterTagLines = afterTagLines.filter(Boolean);

    // Case 2: only tag, no test case lines
    if (!afterTagLines.length) {
      console.log("none");
      return;
    }

    // Extract bullet-style test cases (-, *, •)
    const matches = afterTagLines
      .filter(line => /^[-*•]\s+.+/.test(line))
      .map(line => line.replace(/^[-*•]\s+/, "").trim());

    // Case 1: has lines but none bulleted
    if (!matches.length && afterTagLines.length > 0) {
      exitWith("❌ The test cases should be bulleted per case.");
      return;
    }

    // Output
    matches.forEach((desc, i) => {
      console.log(`Case-${i + 1}: ${desc}`);
    });

    const formatted = matches
      .map((desc, i) => `- Case-${i + 1}: ${desc}`)
      .join("\n");

    console.log(formatted);
  } catch (err) {
    exitWith("❌ Error extracting inline test cases:", err);
  }
})();
