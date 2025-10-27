import { octokit, repoInfo } from "./_config.mjs";
import { exitWith } from "./_helpers.mjs";
import fs from "fs";
import { execSync } from "child_process";

(async function main() {
  try {
    const { owner, repo, prNumber } = repoInfo;

    console.log("🔹 Running getPreviousCases...");
    execSync(`node .github/scripts/getPreviousCases.mjs`, { stdio: "inherit" });

    if (!fs.existsSync("previous.json")) {
      exitWith("❌ Could not find previous.json");
      return;
    }

    const cases = JSON.parse(fs.readFileSync("previous.json", "utf8"));
    const passedIds = cases
      .filter((c) => c.VERDICT?.includes("✅ PASS"))
      .map((c) => c.TEST_CASE_ID);

    if (!passedIds.length) {
      console.log("✅ No PASS test cases found. Nothing to resolve.");
      return;
    }

    console.log(`✅ Found ${passedIds.length} passed test cases to resolve.`);

    // 1️⃣ Fetch all review threads (GraphQL is required to get threadId)
    const threadsQuery = `
      query($owner: String!, $repo: String!, $pr: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pr) {
            reviewThreads(first: 100) {
              nodes {
                id
                isResolved
                comments(first: 10) {
                  nodes {
                    id
                    body
                    isMinimized
                    path
                  }
                }
              }
            }
          }
        }
      }
    `;

    const threadData = await octokit.graphql(threadsQuery, {
      owner,
      repo,
      pr: parseInt(prNumber),
    });

    const threads = threadData.repository.pullRequest.reviewThreads.nodes || [];
    const unresolvedThreads = threads.filter((t) => !t.isResolved);

    console.log(`🔹 Found ${unresolvedThreads.length} unresolved threads.`);

    // 2️⃣ Find threads with comment bodies containing TEST_CASE_ID
    const threadsToResolve = unresolvedThreads.filter((thread) =>
      thread.comments.nodes.some((comment) =>
        passedIds.some((id) => comment.body.includes(id))
      )
    );

    if (!threadsToResolve.length) {
      console.log("✅ No unresolved threads matched passed test cases.");
      return;
    }

    console.log(`🟢 Found ${threadsToResolve.length} threads to resolve.`);

    // 3️⃣ Resolve them via GraphQL mutation
    const resolveMutation = `
      mutation($threadId: ID!) {
        resolveReviewThread(input: {threadId: $threadId}) {
          thread { isResolved }
        }
      }
    `;

    for (const thread of threadsToResolve) {
      try {
        await octokit.graphql(resolveMutation, { threadId: thread.id });
        console.log(`✅ Resolved thread: ${thread.id}`);
      } catch (err) {
        console.warn(`⚠️ Failed to resolve thread ${thread.id}:`, err.message);
      }
    }

    console.log("🎉 Done resolving all matching passed test case threads!");
  } catch (err) {
    exitWith("❌ Error in resolvePassedComments.mjs:", err);
  }
})();
