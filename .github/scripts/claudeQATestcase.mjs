import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";
import { Octokit } from "@octokit/rest";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const ticketId = process.env.TICKET_ID;
if (!ticketId) {
  console.error("❌ No TICKET_ID found in environment. Aborting.");
  process.exit(1);
}

const repoOwner = process.env.GITHUB_REPOSITORY.split("/")[0];
const repoName = process.env.GITHUB_REPOSITORY.split("/")[1];
const prNumber =
  process.env.PR_NUMBER ||
  (process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\/merge/) || [])[1];

if (!prNumber) {
  console.error("❌ Could not determine PR number. Check workflow context.");
  process.exit(1);
}

// 🔹 Load PR files JSON (generated in workflow)
let changedFiles = [];
try {
  let filesData;
  try {
    filesData = JSON.parse(fs.readFileSync("pr-files.json", "utf-8"));
  } catch (err) {
    console.error("❌ Failed to parse pr-files.json:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(filesData)) {
    console.error("❌ Invalid format: pr-files.json is not an array.");
    console.error("File content:", JSON.stringify(filesData, null, 2));
    process.exit(1);
  }

  changedFiles = filesData.map(f => ({
    filename: f.filename,
    status: f.status,
    patch: f.patch || ""
  }));

  console.log(`✅ Loaded ${changedFiles.length} changed files from pr-files.json`);

  console.log("✅ Loaded changed files from pr-files.json");
} catch (err) {
  console.error("❌ Failed to load pr-files.json:", err.message);
  process.exit(1);
}

async function getQATestCases() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.QA_SPREADSHEET_URL.split("/")[5];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ticketId}!C:G`,
    });

    if (!res.data.values || res.data.values.length === 0) {
      console.error(`❌ No test cases found in sheet '${ticketId}'`);
      process.exit(1);
    }

    return res.data.values;
  } catch (err) {
    console.error(`❌ Failed to read sheet '${ticketId}':`, err.message);
    process.exit(1);
  }
}

async function compareWithClaude() {
  const testCases = await getQATestCases();

  // Format changed files nicely
  const filesSummary = changedFiles.map(f => {
    return `📄 ${f.filename} [${f.status}]
${f.patch ? f.patch.substring(0, 1000) + (f.patch.length > 1000 ? "\n...(truncated)" : "") : "(no patch)"}\n`;
  }).join("\n---\n");

  const userPrompt = `
I have the following changed files in PR #${prNumber}:
${filesSummary}

Here are the QA test cases for ticket ${ticketId}:
${JSON.stringify(testCases, null, 2)}

Please act as a QA reviewer and check if the implementation in the changed files satisfies each test case.

Generate the GitHub comment strictly in this Markdown format:

---

## Summary

Based on the changed files and test cases provided, here's the analysis:

| Category | Test Case | Status | Reason |
|-----------|------------|--------|--------|
| <category> | <test case title> | ⚠️ CANNOT VERIFY / ✅ PASS / ❌ FAIL | <short reason> |
| ... | ... | ... | ... |

Use only these three status icons:  
- ✅ **PASS** — confirmed the change implements the test case.  
- ❌ **FAIL** — test case requirement is not met or broken.  
- ⚠️ **CANNOT VERIFY** — insufficient context or unrelated code changes.

---

## Detailed Analysis

For every test case, create a collapsible section in this exact format:

<details>
<summary>[Category] – Test Case N: "<test case title>"</summary>

**Expectation:**  
<describe what the QA test case is testing>

**Implementation Evidence:**  
<mention the relevant code areas or files that implement or affect this case>

**Verdict:**  
✅ PASS / ❌ FAIL / ⚠️ CANNOT VERIFY — <short reason>

</details>

---

Keep tone formal, concise, and analytical.
Do not include any unrelated commentary or disclaimers.
End the message cleanly without extra closing text.
`;

  try {
    const MAX_INPUT_CHARS = parseInt(process.env.MAX_INPUT_CHARS || "800000", 10);
    const MAX_OUTPUT_CHARS = parseInt(process.env.MAX_OUTPUT_CHARS || "16000", 10);

    // 🔹 Convert char → token (rough 4 chars per token)
    const MAX_INPUT_TOKENS = Math.floor(MAX_INPUT_CHARS / 4);
    const MAX_OUTPUT_TOKENS = Math.floor(MAX_OUTPUT_CHARS / 4);

    if (isNaN(MAX_INPUT_CHARS) || MAX_INPUT_CHARS <= 0) {
      console.error("❌ Invalid MAX_INPUT_CHARS value. Please check repo secret.");
      process.exit(1);
    }
    if (isNaN(MAX_OUTPUT_CHARS) || MAX_OUTPUT_CHARS <= 0) {
      console.error("❌ Invalid MAX_OUTPUT_CHARS value. Please check repo secret.");
      process.exit(1);
    }

    console.log(`💬 Input limit: ${MAX_INPUT_CHARS} chars (~${MAX_INPUT_TOKENS} tokens)`);
    console.log(`💬 Output limit: ${MAX_OUTPUT_CHARS} chars (~${MAX_OUTPUT_TOKENS} tokens)`);

    if (userPrompt.length > MAX_INPUT_CHARS) {
      console.error(`❌ userPrompt too long: ${userPrompt.length} chars (limit: ${MAX_INPUT_CHARS}).`);
      console.error("🛑 Please reduce test case or diff content before retrying.");
      process.exit(1);
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    console.error("❌ Claude API call failed:", err.message);
    process.exit(1);
  }
}

compareWithClaude();
