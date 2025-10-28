# Claude Code Review (v2.2) Workflow

## Summary
This workflow performs a **comprehensive AI-assisted pull request code review** using Claude.  
It analyzes the PR's changes, posts a structured review with detailed feedback, and **automatically submits GitHub review decisions** (Approve/Request Changes) with corresponding labels.

---

## How to Use

You can trigger this workflow in **two ways:**

1. **Via PR Comment**
   - Add a comment in any pull request containing the keyword:
````
     @claude-review
````
   - Claude will react 👀 to acknowledge your comment and begin reviewing the code in that PR.

2. **Via Label**
   - Add the label `claude-review` to a pull request.  
   - The workflow will automatically run and perform the review.

---

## What It Does

When triggered, the workflow:
1. Adds an 👀 reaction to acknowledge the review request.  
2. Checks out the pull request's head branch.  
3. Identifies the PR number automatically.  
4. Runs **Claude Code Review** with full repository context.
5. Posts a detailed review comment with structured findings.
6. **Automatically submits a GitHub review** based on Claude's verdict:
   - **✅ Approved** → Submits an "Approve" review
   - **🛠️ Needs Revision** → Submits a "Request Changes" review
7. **Manages PR labels dynamically:**
   - Adds `Claude Code Approved` when approved (removes `Claude Requests Changes`)
   - Adds `Claude Requests Changes` when requesting changes (removes `Claude Code Approved`)
8. **Dismisses conflicting reviews** to keep the PR state clean
9. Adds a 🚀 reaction when complete (or 😕 if failed)

---

## Review Output Format

Claude posts a detailed review comment structured as:
````md
## 🧩 Overview
- Brief summary of what this PR does

## 💪 Strengths
- Highlights of good design or code patterns

## ⚠️ Issues
- Bugs, security risks, or inconsistencies
- Excludes stylistic issues covered by linters

## 💡 Recommendations
- Actionable improvement ideas or example code snippets

## 🧾 Verdict
- ✅ Approved / 🛠️ Needs Revision
- Includes confidence, maintainability, and test coverage notes
````

---

## GitHub Review Integration (New in v2.2)

After posting the detailed review comment, the workflow automatically:

### When Claude Approves (✅)
- **Submits an "Approve" review** with a link to the detailed feedback
- **Adds label:** `Claude Code Approved`
- **Removes label:** `Claude Requests Changes` (if present)
- **Dismisses any previous "Request Changes" review** from Claude

### When Claude Requests Changes (🛠️)
- **Submits a "Request Changes" review** with a link to the detailed feedback
- **Adds label:** `Claude Requests Changes`
- **Removes label:** `Claude Code Approved` (if present)
- **Dismisses any previous "Approve" review** from Claude

This ensures the PR's review state accurately reflects Claude's latest assessment and integrates seamlessly with GitHub's merge requirements.

---

## Guidelines

- **CLAUDE.md adherence** is mandatory for all reviews
- Maintains **consistent section titles & order** across all PRs
- Respects **linter configurations** (ESLint, PHP-CS-Fixer, etc.)
- Uses **concise and professional tone** throughout
- Only includes **new or changed findings** in subsequent review runs

---

## Permissions Required

The workflow requires the following GitHub permissions:
- `contents: read` - To access repository files
- `pull-requests: write` - To post comments and submit reviews
- `issues: write` - To manage labels and reactions
- `id-token: write` - For authentication
- `actions: read` - For workflow context

---

## What's New in v2.2

✨ **Automated Review Decisions:**
- Claude now automatically submits GitHub "Approve" or "Request Changes" reviews based on its verdict

🏷️ **Dynamic Label Management:**
- Automatically adds/removes `Claude Code Approved` and `Claude Requests Changes` labels

🔄 **Review State Management:**
- Dismisses conflicting previous reviews to keep PR status clean and accurate

📋 **Improved Review Comments:**
- Review comments include direct links to Claude's detailed analysis for easy navigation