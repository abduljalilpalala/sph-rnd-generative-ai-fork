# 🧠 Claude Sheet Review Workflow

## 📘 Overview
The **Claude Sheet Review** workflow automates quality assurance reviews for pull requests using Anthropic Claude.  
It reads a list of **test cases** from a Google Spreadsheet, compares them against the **changed files** in the PR, and posts a summarized analysis back to GitHub.

If all test cases pass, the workflow automatically **approves the PR**.  
If any fail, it **posts a comment** with detailed feedback.

---

## ⚙️ How to Use

You can trigger the workflow in two ways:

#### ✅ Option 1 — via PR Comment

Comment on a PR using the format:

```text
@claude-sheet-review
ids: 1,2,4
testcase: https://docs.google.com/spreadsheets/d/1JefU/edit?gid=22727#gid=227&range=C223:J226
```
or
```text
@claude-sheet-review
excludeIds: 1,2,4
testcase: https://docs.google.com/spreadsheets/d/1JefU/edit?gid=22727#gid=227&range=C223:J226
```

#### ✅ Option 2 — via PR Description

If the comment doesn’t contain the parameters, the workflow will attempt to extract them from the PR description instead.

---

## 🧩 Parameter Details

| Parameter | Rule / Behavior | Example |
|------------|-----------------|----------|
| **`ids`** (optional) | - If provided, **takes priority** over `excludeIds`.Only test cases matching these IDs will be included. Must be numbers (no letters or symbols). | `ids: 12, 15, 20` |
| **`excludeIds`** (optional) | - Used only if `ids` is **not** provided. All test cases **exclude** these IDs. Must be numbers. | `excludeIds: 1, 3, 4` |
| **`testcase`** (required) | - The URL must include the `range` query for accurate selection. Example format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit?gid={GID}#gid={GID}&range={RANGE}` | `testcase: https://docs.google.com/spreadsheets/d/...&range=C223:J226` |

---

## ⚖️ Parameter Priority Rules

1. **Comment > PR Description**  
   Parameters written in the PR comment override those found in the PR description.

2. **`ids` > `excludeIds`**  
   When both `ids` and `excludeIds` are defined, `ids` takes priority and `excludeIds` will be ignored.

3. **Default Behavior**  
   If neither `ids` nor `excludeIds` are provided, the workflow will fetch **all test cases** within the specified spreadsheet range.

---

## 🪜 How It Works
1. **Trigger**: A reviewer comments `@claude-sheet-review` on an open PR.  
2. **Parse comment**: The workflow extracts the **spreadsheet URL** and **test case IDs** from the comment or PR description.  
3. **Fetch data**:
   - Gets changed files from the PR.
   - Fetches test cases from the linked Google Sheet.
4. **Run Claude Analysis**:  
   Sends each test case and changed file to Claude for automated reasoning.
5. **Post results**:
   - If all pass → auto-approve the PR.  
   - If any fail → post comment with detailed feedback.  
6. **Status feedback** is also updated directly on the PR comment for visibility.
