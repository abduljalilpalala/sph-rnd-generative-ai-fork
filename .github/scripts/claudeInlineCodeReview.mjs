import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";

const client = new Anthropic({ apiKey: process.env.anthropic_api_key });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 🔹 Detect repo + PR info
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const prNumber =
  process.env.PR_NUMBER ||
  (process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\/merge/) || [])[1];

if (!prNumber) {
  console.error("❌ Could not determine PR number. Check workflow context.");
  process.exit(1);
}

// 🔹 Load PR files
let changedFiles = [];
try {
  const filesData = JSON.parse(fs.readFileSync("pr-files.json", "utf-8"));
  if (!Array.isArray(filesData)) throw new Error("Invalid format");
  changedFiles = filesData.map(f => ({
    filename: f.filename,
    status: f.status,
    patch: f.patch || ""
  }));
  console.log(`✅ Loaded ${changedFiles.length} changed files`);
} catch (err) {
  console.error("❌ Failed to read pr-files.json:", err.message);
  process.exit(1);
}

// 🔹 Ask Claude
async function compareWithClaude() {
  const filesSummary = changedFiles
    .map(
      f => `📄 ${f.filename} [${f.status}]\n${f.patch?.substring(0, 500) || "(no patch)"}`
    )
    .join("\n---\n");

  const userPrompt = `
I have the following changed files from PR #${prNumber}:
${filesSummary}

Please respond with a JSON list of comments, each with:
[
  {"path": "filename", "line": number, "body": "hello world"}
]
Use the file and line context from the diff above.
If unsure, return at least one comment on each file with line 1.
`;

  console.log("🧠 Asking Claude...");
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0]?.text || "";
  console.log("🤖 Claude response:\n", text);

  // 🔹 Try to extract JSON array from Claude output
  const match = text.match(/\[([\s\S]*)\]/);
  if (!match) {
    console.error("❌ No JSON found in response.");
    process.exit(1);
  }

  let comments;
  try {
    comments = JSON.parse(match[0]);
  } catch {
    console.error("❌ Failed to parse JSON from Claude.");
    process.exit(1);
  }

  // 🔹 Post comments
  for (const c of comments) {
    try {
      await octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        path: c.path,
        line: c.line,
        body: c.body || "hello world",
        side: "RIGHT",
      });
      console.log(`💬 Commented on ${c.path}:${c.line}`);
    } catch (err) {
      console.error(`⚠️ Failed to comment on ${c.path}:`, err.message);
    }
  }
}

compareWithClaude().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
