# Claude Code Review (v2) Workflow

## Summary
This workflow performs a **comprehensive AI-assisted pull request code review** using Claude.  
It analyzes the PR’s changes, posts a structured TODO checklist during progress tracking, and finally posts a detailed summary review covering code quality, strengths, issues, and recommendations.

---

## How to Use

You can trigger this workflow in **two ways:**

1. **Via PR Comment**
   - Add a comment in any pull request containing the keyword:
     ```
     @claude-review-v2
     ```
   - Claude will react 👀 to acknowledge your comment and begin reviewing the code in that PR.

2. **Via Label**
   - Add the label `claude-review-v2` to a pull request.  
   - The workflow will automatically run and perform the review.

---

## What It Does

When triggered, the workflow:
1. Adds an 👀 reaction to acknowledge the review request.  
2. Checks out the pull request’s head branch.  
3. Identifies the PR number automatically.  
4. Runs **Claude Code Review** with:
   - Full diff analysis (`gh pr diff` / `gh pr view`)
   - Structured multi-step review using `track_progress: true`
   - Final output formatted under consistent headings

During execution, Claude posts:
- An initial **TODO checklist** outlining tasks (e.g. code quality, bug checks, security review)
- Progress updates as review advances
- A **final summary** comment replacing the TODO list with structured findings and a verdict

---

## Output Format

Claude will always format its final review as:

```md
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
