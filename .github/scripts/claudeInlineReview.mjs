import {
  client,
  octokit,
  repoInfo,
  GITHUB_EVENT_PATH,
  MAX_INPUT_CHARS,
  MAX_OUTPUT_CHARS
} from "./_config.mjs";
import { getChangedFiles } from "./_pullRequest.mjs";
import { runClaudeAnalysis } from "./_claudeReview.mjs";
import {
  postGitHubComment,
  submitGitHubApproval,
  updateStatusFeedback,
} from "./_githubComment.mjs";
import { parseInlineTestcases } from "./_helpers.mjs";

(async function main () {
  const testCases = await parseInlineTestcases(GITHUB_EVENT_PATH);

  if (!testCases.length) {
    await updateStatusFeedback("Fail", "❌ No test cases detected in comment.");
    process.exit(1);
  }

  const changedFiles = await getChangedFiles(repoInfo.prNumber);

  const result = await runClaudeAnalysis({
    client,
    changedFiles,
    testCases,
    prNumber: repoInfo.prNumber,
    maxInputChars: parseInt(MAX_INPUT_CHARS, 10),
    maxOutputChars: parseInt(MAX_OUTPUT_CHARS, 10),
  });

  await updateStatusFeedback("Done");

  if (result.includes("❌ FAIL")) {
    await postGitHubComment(octokit, repoInfo, result);
  } else {
    await submitGitHubApproval(octokit, repoInfo, result);
  }

  console.log("✅ Claude Testcase Review completed and commented on GitHub PR.");
})();
