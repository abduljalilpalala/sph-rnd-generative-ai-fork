import fs from "fs";
import { GITHUB_EVENT_PATH } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

/**
 * This script extracts inline test cases from a PR comment body.
 * Triggered when users comment:
 *   @claude-qa-review
 *   - test1
 *   - test2
 * or simply
 *   @claude-qa-review
 *   test1
 *   test2
 */

(async function main() {
  try {
    const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, "utf8"));
    const body = event?.comment?.body || "";

    // Extract everything after "@claude-qa-review"
    const match = body.match(/@claude-qa-review([\s\S]*)/i);
    const content = match ? match[1].trim() : "";

    if (!content) {
      console.log("⚠️ No test cases provided in comment. Proceeding with behavioral review only.");
      fs.writeFileSync("qa.md", "[]");
      return;
    }

    // Split test cases by bullet or newline
    const rawCases = content
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^[-•]\s*/, "")) // remove bullets
      .filter((line) => line.length > 0);

    if (rawCases.length === 0) {
      console.log("⚠️ No valid test cases detected after parsing. Proceeding with behavioral scan.");
      fs.writeFileSync("qa.md", "[]");
      return;
    }

    console.log(`Detected ${rawCases.length} inline test case(s).`);
    console.log("Parsed cases:");
    rawCases.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

    // Map to JSON structure consistent with claudeSheetReview
    const mapped = rawCases.map((test, i) => ({
      TEST_CASE_ID: `INLINE-${i + 1}`,
      EXPECTED_RESULT: test,
      DETAILS: test, // same as expected for inline
    }));

    const jsonOutput = JSON.stringify(mapped, null, 2);
    fs.writeFileSync("qa.md", jsonOutput, "utf8");

  } catch (error) {
    await exitWith(`❌ Error in claudeInlineReview.mjs: ${error.message}`);
  }
})();
