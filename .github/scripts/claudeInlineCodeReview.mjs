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

function extractAddedLines(patch) {
  const lines = [];
  let oldLine = 0;
  let newLine = 0;

  if (!patch) return lines;

  const patchLines = patch.split("\n");
  for (const line of patchLines) {
    const hunkMatch = /^@@ -(\d+),\d+ \+(\d+),\d+ @@/.exec(line);
    if (hunkMatch) {
      oldLine = parseInt(hunkMatch[1], 10);
      newLine = parseInt(hunkMatch[2], 10) - 1; // start line for this hunk
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("++")) {
      lines.push(newLine + 1);
      newLine++;
    } else if (!line.startsWith("-")) {
      newLine++;
    }
  }
  return lines;
}


// 🔹 Ask Claude
async function compareWithClaude() {
  const filesSummary = changedFiles.map(f => {
    const added = extractAddedLines(f.patch);
    return `📄 ${f.filename} [${f.status}]
  Added lines: ${added.join(", ")}
  Patch preview: ${f.patch?.substring(0, 500) || "(no patch)"}\n`;
  }).join("\n---\n");

  const userPrompt = `
    I have the following changed files in PR #${prNumber}:
    ${filesSummary}

    Please generate a code review comment for each added line. 
    Respond ONLY in a JSON array with objects like:
    [
      {"path": "file.tsx", "line": 10, "body": "Your review comment here"}
    ]

    Each comment's "line" must match the added lines listed above.
    Do not include any extra text outside the JSON.
  `;

  console.log("🧠 Asking Claude...");
  const response = await client.messages.create({
    model: "claude-3",
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
    comments = JSON.parse(text); // parse the actual Claude response
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
