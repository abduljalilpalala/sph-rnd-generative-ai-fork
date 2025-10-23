import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    if (!reviews?.length) {
      console.log("none");
      return;
    }

    const claudeReviews = reviews.filter(r => {
      const author = (r.user?.login || "").toLowerCase();
      return (
        author.includes("claude") ||
        author.includes("anthropic") ||
        author.includes("github-actions") ||
        author.endsWith("[bot]")
      );
    });

    if (!claudeReviews.length) {
      console.log("⚠️ No Claude reviews found in this PR.");
      return;
    }

    const latest = claudeReviews.sort(
      (a, b) =>
        new Date(b.submitted_at || b.created_at) -
        new Date(a.submitted_at || a.created_at)
    )[0];

    // fetch full review body (to avoid truncation)
    const { data: reviewDetails } = await octokit.rest.pulls.getReview({
      owner,
      repo,
      pull_number: prNumber,
      review_id: latest.id,
    });

    const body = reviewDetails.body || latest.body || "";

    if (!body) {
      console.log("⚠️ Latest Claude review has no body content.");
      return;
    }

    const testCases = [];

    // 🧩 Pattern 1: HTML <summary> style (preferred)
    // Example:
    // <summary><strong>[New-1]</strong> (❌ FAIL): "When user loads ..."</summary>
    const summaryPattern =
      /<summary>\s*<strong>\[(.*?)\]<\/strong>\s*\((.*?)\)\s*:\s*[“"](.+?)[”"]\s*<\/summary>/gis;

    const summaryMatches = [...body.matchAll(summaryPattern)];
    for (const [, id, status, expected] of summaryMatches) {
      testCases.push({
        id: id.trim(),
        status: status.trim(),
        expected: expected.trim(),
      });
    }

    // 🧩 Pattern 2: Markdown table fallback
    if (testCases.length === 0) {
      const lines = body.replace(/\r\n/g, "\n").split("\n");
      let tableStart = lines.findIndex(l => /\|\s*(Case\s*ID|ID)\s*\|/i.test(l));

      if (tableStart >= 0) {
        const header = lines[tableStart].split("|").map(h => h.trim());
        const idIndex = header.findIndex(h => /id/i.test(h));
        const expectedIndex = header.findIndex(
          h => /expected/i.test(h) || /test case/i.test(h)
        );
        const statusIndex = header.findIndex(h => /status/i.test(h));

        for (let i = tableStart + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (/^\s*#{1,2}\s+/.test(line) || /^---+$/.test(line) || line === "")
            break;
          if (/^\s*\|\s*-+\s*\|/.test(line)) continue;
          if (!line.startsWith("|")) continue;

          const cols = line.split("|").map(s => s.trim());
          const id = cols[idIndex];
          const expected = cols[expectedIndex];
          const status = statusIndex >= 0 ? cols[statusIndex] : "";

          if (id && expected)
            testCases.push({ id, expected, status });
        }
      }
    }

    // Pattern 3: Legacy **ID:** style fallback
    if (testCases.length === 0) {
      const legacyPattern =
        /[*-]?\s*\*\*?ID:\*\*?\s*(.+?)\n[*-]?\s*\*\*?Expected:\*\*?\s*(.+?)(?=\n|$)/gis;
      const legacyMatches = [...body.matchAll(legacyPattern)];
      for (const [, id, expected] of legacyMatches) {
        testCases.push({
          id: id.trim(),
          expected: expected.trim(),
          status: "",
        });
      }
    }

    if (!testCases.length) {
      console.log("⚠️ No test cases found in Claude review body.");
      return;
    }

    // Output formatted Markdown
    const markdown = testCases
      .map(
        tc =>
          `**ID:** ${tc.id}\n**Status:** ${tc.status || "N/A"}\n**Expected:** ${tc.expected}\n---`
      )
      .join("\n");

    console.log(markdown);
  } catch (err) {
    exitWith("❌ Error fetching previous cases:", err);
  }
})();
