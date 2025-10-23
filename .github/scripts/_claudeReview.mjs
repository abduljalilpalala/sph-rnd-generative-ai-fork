import fs from "fs";
import { truncate, exitWith } from "./_helpers.mjs";
import { CLAUDE_MODEL } from './_config.mjs';

export async function runClaudeAnalysis ({
  client,
  changedFiles,
  testCases,
  prNumber,
  maxInputChars,
  maxOutputChars,
}) {
  try {
    console.log('🔍 claude’s checking out the code changes and test cases');

    const filesSummary = changedFiles
      .map(f => `📄 ${f.filename} [${f.status}]\n${f.patch ? truncate(f.patch) : "(no patch)"}\n`)
      .join("\n---\n");

    const userPrompt = `
I have the following changed files in PR #${prNumber}:
${filesSummary}

Here are the QA test cases:
${JSON.stringify(testCases, null, 2)}

Please act as a QA reviewer and check if the implementation in the changed files satisfies each test case.

Generate the GitHub comment strictly in this Markdown format:

---

## Summary

Based on the changed files and test cases provided, here's the analysis:

| Case ID Test Case | Status | Reason |
|-----------|------------|--------|--------|
| <Case ID> | <Expected Results> | ⚠️ CANNOT VERIFY / ✅ PASS / ❌ FAIL | <short reason> |
| ... | ... | ... | ... |

Use only these three status icons:  
- ✅ **PASS** — confirmed the change implements the test case.  
- ❌ **FAIL** — test case requirement is not met or broken.  
- ⚠️ **CANNOT VERIFY** — insufficient context or unrelated code changes.

---

## Detailed Analysis

For every test case, create a collapsible section in this exact format:

<details>
<summary>Case [Case ID]: "<Expected Results>"</summary>

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

    const maxOutputTokens = Math.floor(maxOutputChars / 4);

    console.log(`💬 Limits: ${maxInputChars} chars in, ${maxOutputChars} chars out`);
    if (userPrompt.length > maxInputChars)
      await exitWith(`❌ Prompt too long (${userPrompt.length} chars). Reduce input.`);

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxOutputTokens,
      messages: [{ role: "user", content: userPrompt }],
    });

    const result = response.content[0].text.trim();
    fs.writeFileSync("claude-result.md", result);
    return result;
  } catch (error) {
    await exitWith(`❌ Error in runClaudeAnalysis: ${error.message}`);
  }
}
