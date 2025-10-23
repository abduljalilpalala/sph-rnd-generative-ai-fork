import fetch from "node-fetch";
import fs from "fs";
import { STATIC_TEXTS } from './_config.mjs';
import { exitWith } from './_helpers.mjs';

export async function submitGitHubApproval (octokit, repoInfo, body) {
  try {
    const { owner, repo, prNumber } = repoInfo;
    const {
      LABELS: { CLAUDE_QA_APPROVED },
    } = STATIC_TEXTS;

    console.log("🟢 Submitting GitHub PR approval...");

    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event: "APPROVE",
      body,
    });

    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels: [CLAUDE_QA_APPROVED],
    });

    console.log("✅ GitHub PR approved successfully.");
  } catch (error) {
    await exitWith(`❌ Error in submitGitHubApproval: ${error.message}`);
  }
}

export async function postGitHubComment (octokit, repoInfo, result) {
  try {
    const { owner, repo, prNumber } = repoInfo;
    const chunks = result.match(/[\s\S]{1,64000}/g) || [];

    for (let i = 0; i < chunks.length; i++) {
      const body =
        chunks.length > 1
          ? `🤖 **Claude QA Review (Part ${i + 1})** \n\n${chunks[i]}`
          : `🤖 **Claude QA Review Result** \n\n${chunks[i]}`;

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body,
      });
    }
  } catch (error) {
    await exitWith(`❌ Error in postGitHubComment: ${error.message}`);
  }
}

/**
 * Updates the GitHub PR comment status section.
 * - Replaces existing status if found.
 * - Appends if missing.
 * 
 * @param {"Running"|"Fail"|"Done"} status - The new status type.
 * @param {string} [extraMessage] - Optional extra note to append.
 */
export async function updateStatusFeedback (status, extraMessage = "") {
  try {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    const runId = process.env.GITHUB_RUN_ID;

    if (!token || !repo || !eventPath) {
      console.log("⚠️ Missing GitHub environment context — skipping status update.");
      return;
    }

    const event = JSON.parse(fs.readFileSync(eventPath, "utf-8"));
    const commentId = event.comment?.id;
    if (!commentId) {
      console.log("⚠️ No comment ID found — skipping status update.");
      return;
    }

    const [owner, repoName] = repo.split("/");
    const actionUrl = `https://github.com/${owner}/${repoName}/actions/runs/${runId}`;

    // Fetch existing comment
    const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      console.log(`⚠️ Failed to fetch existing comment (${res.status})`);
      return;
    }

    const comment = await res.json();
    let body = comment.body || "";

    const emojiMap = {
      Running: "⏳",
      Fail: "❌",
      Done: "✅",
    };
    const emoji = emojiMap[status] || "ℹ️";

    const newSection = `
### Claude Action Status: ${emoji} ${status}\n[View action detail here](${actionUrl})

${extraMessage ?
        `
\n\n

\`\`\`  
${extraMessage}
\`\`\`
`
        : ""}
`;

    // 🔧 Improved regex — reliably replaces till end of file or next header
    if (/### Claude Action Status:/.test(body)) {
      body = body.replace(/### Claude Action Status:[\s\S]*?(?=\n#{3,} |$)/, newSection);
    } else {
      body += `\n\n${newSection}`;
    }

    const patchRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ body }),
    });

    if (!patchRes.ok) {
      console.log(`⚠️ Failed to update comment (${patchRes.status})`);
      return;
    }
  } catch (err) {
    console.error("⚠️ Failed to update GitHub status:", err.message);
  }
}
