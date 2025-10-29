import fs from "fs";
import { updateStatusFeedback } from './_githubComment.mjs';

/**
 * Gracefully exits the workflow with an error message.
 * Automatically updates the PR comment status to ❌ Failed.
 */
export async function exitWith (message) {
  console.error(message);
  process.exit(1);
}

export function safeReadJSON (path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch (err) {
    exitWith(`❌ Failed to read or parse JSON file (${path}): ${err.message}`);
  }
}

export function truncate (text, max = 1000) {
  return text.length > max ? text.substring(0, max) + "\n...(truncated)" : text;
}

export async function parseComment (GITHUB_EVENT_PATH) {
  try {
    if (!GITHUB_EVENT_PATH || !fs.existsSync(GITHUB_EVENT_PATH))
      return { ids: [], excludeIds: [], spreadsheetUrl: null };

    const eventData = safeReadJSON(GITHUB_EVENT_PATH);
    const commentBody = eventData.comment?.body || "";

    const ids = (commentBody.match(/(?<!exclude)ids:\s*([\d,\s]+)/i)?.[1] || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    const excludeIds = (commentBody.match(/excludeIds:\s*([\d,\s]+)/i)?.[1] || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    const spreadsheetUrl =
      commentBody.match(
        /testcase:\s*(https:\/\/docs\.google\.com\/spreadsheets\/d\/[^\s]+)/i
      )?.[1] || null;

    return { ids, excludeIds, spreadsheetUrl };
  } catch (error) {
    await exitWith(`❌ Error in parseComment: ${error.message}`);
  }
}

export async function parseInlineTestcases (GITHUB_EVENT_PATH) {
  try {
    if (!GITHUB_EVENT_PATH || !fs.existsSync(GITHUB_EVENT_PATH))
      return [];

    const eventData = safeReadJSON(GITHUB_EVENT_PATH);
    const commentBody = eventData.comment?.body || "";

    // Match bullets starting with "-", "*", "•", or numbered patterns.
    const matches = commentBody
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line =>
        /^[-*•]\s+.+/.test(line) // bullet format
      )
      .map(line => line.replace(/^[-*•]\s+/, "").trim());

    if (!matches.length) {
      console.log("ℹ️ No bullet-style test cases found in comment.");
      return [];
    }

    console.log(`🧪 Found ${matches.length} inline test cases from comment.`);
    return matches.map((desc, i) => ({
      id: i + 1,
      description: desc,
      expected: desc,
    }));
  } catch (error) {
    await exitWith(`❌ Error in parseInlineTestcases: ${error.message}`);
  }
}
