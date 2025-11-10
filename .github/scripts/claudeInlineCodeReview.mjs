import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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


async function compareWithClaude() {
  // Format changed files nicely
  const filesSummary = changedFiles.map(f => {
    return `📄 ${f.filename} [${f.status}]
${f.patch ? f.patch.substring(0, 1000) + (f.patch.length > 1000 ? "\n...(truncated)" : "") : "(no patch)"}\n`;
  }).join("\n---\n");

  const userPrompt = `
I have the following changed files ${filesSummary}

Please put comment "hello world" on that file`;

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
  } catch (err) {
    console.error("❌ Claude API call failed:", err.message);
    process.exit(1);
  }
}

compareWithClaude();
