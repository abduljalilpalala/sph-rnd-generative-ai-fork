import fs from "fs";
import { Octokit } from "@octokit/rest";
import Anthropic from "@anthropic-ai/sdk";
import { exitWith } from "./_helpers.mjs";

export const {
  ANTHROPIC_API_KEY,
  GITHUB_TOKEN,
  GOOGLE_SERVICE_ACCOUNT_JSON,
  GITHUB_REPOSITORY,
  GITHUB_EVENT_PATH,
  MAX_INPUT_CHARS = "800000",
  MAX_OUTPUT_CHARS = "16000",
} = process.env;

if (!GITHUB_REPOSITORY) {
  exitWith("❌ Missing GITHUB_REPOSITORY in env.");
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split("/");

let prNumber = null;
let event = null;

if (GITHUB_EVENT_PATH && fs.existsSync(GITHUB_EVENT_PATH)) {
  try {
    event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, "utf8"));
  } catch (err) {
    console.warn("⚠️ Could not parse GITHUB_EVENT_PATH:", err);
  }
}

if (!prNumber && event?.pull_request?.number) {
  prNumber = event.pull_request.number;
}

if (!prNumber && event?.issue?.pull_request) {
  prNumber = event.issue.number;
}

if (!prNumber && process.env.GITHUB_REF?.includes("refs/pull/")) {
  const match = process.env.GITHUB_REF.match(/refs\/pull\/(\d+)\/(head|merge)/);
  if (match) prNumber = match[1];
}

if (!prNumber) {
  exitWith("❌ Could not determine PR number. Check event context.");
}

export const repoInfo = { owner, repo, prNumber };
export const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
export const octokit = new Octokit({ auth: GITHUB_TOKEN });
export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

export const STATIC_TEXTS = {
  LABELS: {
    CLAUDE_QA_APPROVED: "Claude QA Approved",
  },
};
