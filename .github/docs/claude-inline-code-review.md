# Claude Inline Code Review Workflow

## Summary

This workflow enables **AI-powered inline pull request code reviews** using the `anthropics/claude-code-action` GitHub Action.
It is triggered when someone comments on a PR using the command:

```
@claude-inline-code-review
```

Once triggered, Claude:

- Analyzes PR changes (diff)
- Loads project conventions from `CLAUDE.md`
- Fetches past comments & reviews
- Avoids duplicate unresolved comments
- Posts actionable inline review comments
- Generates a structured final summary review
- Submits the pending review
- Runs a custom finalization script (`submitClaudeCodeReview.mjs`)

This workflow makes Claude behave like a **real senior code reviewer**, providing detailed line-by-line feedback.

---

## How to Use

Inside any pull request, leave a comment containing:

```
@claude-inline-code-review
```

Claude will:

- React with 👀
- Begin reviewing the PR
- Add inline review comments
- Post a summary review comment
- Submit the final GitHub review

---

## Workflow Breakdown

### 1. Trigger Conditions

The workflow is triggered when a new PR comment is created:

```yaml
on:
  issue_comment:
    types: [created]
```

It proceeds only if:

- The comment is on a pull request
- The comment contains `@claude-inline-code-review`

```yaml
if: |
  github.event.issue.pull_request &&
  contains(github.event.comment.body, '@claude-inline-code-review')
```

---

## 2. Adds 👀 Reaction

Claude acknowledges the review request by adding an eyes emoji reaction to the comment.

---

## 3. Checkout PR Branch

The workflow checks out the PR’s head branch:

```yaml
ref: refs/pull/${{ github.event.issue.number }}/head
```

This ensures Claude analyzes the correct changes.

---

## 4. Setup Steps

The workflow also:

- Extracts the PR number
- Sets up Node.js 20
- Removes lockfiles and reinstalls dependencies
- Loads the `CLAUDE.md` file (if present)
- Fetches the PR base branch

`CLAUDE.md` acts as the project’s review rules and architectural conventions.

---

## 5. Running the Claude Code Review

At the core is:

```
anthropics/claude-code-action@v1
```

Claude is given:

- The PR diff
- All past PR comments and reviews
- Context from `CLAUDE.md`
- Strictly defined review rules
- A required output format
- Allowed toolset for interacting with GitHub

The action makes Claude:

✔ Start a pending pull request review
✔ Perform inline analysis
✔ Post inline comments with severity levels
✔ Ensure no duplicate unresolved comments
✔ Submit the completed review

---

## Inline Comment Format

Claude uses this structure:

````md
**Issue:** <short, specific title>  
**Severity:** 🟥 Critical / 🟧 Moderate / 🟨 Minor  
**Suggested Fix:**

```suggestion
// Minimal, relevant code fix only
```

**Explanation:** <Why this improves correctness, clarity, or maintainability>
````

---

## 6. Summary Review Comment

After inline comments, Claude posts a **single summary comment**, including:

### 📄 Summary Table

| **Metric**              | **Severity** | **Count** |
| ----------------------- | -----------: | --------: |
| Approved / Passed       |            - |         n |
| Failed / Needs Change   |     Critical |         n |
| Failed / Needs Change   |     Moderate |         n |
| Minor Concern / Warning |        Minor |         n |

### 💡 Feedback Highlights

A severity-ordered list of notable issues.

### 🏁 Next Steps

Clear instructions for the contributor.

### 🌟 Appreciation

A positive and encouraging closing note.

---

## 7. Final Submission Script

The final step:

```
node .github/scripts/submitClaudeCodeReview.mjs
```

This script can:

- Submit Approve / Request Changes
- Label the PR
- Dismiss conflicting reviews
- Clean up previous automated comments

Your implementation determines what it does.

---

# Permissions

This workflow requires:

| Permission             | Purpose                              |
| ---------------------- | ------------------------------------ |
| `contents: read`       | Access repository content            |
| `pull-requests: write` | Post inline comments, submit reviews |
| `issues: write`        | React to comments, create comments   |
| `id-token: write`      | Authentication                       |
| `actions: read`        | Access workflow metadata             |

---

# Design Principles

- True inline review (not block-only)
- Avoid duplicate unresolved comments
- Strict adherence to project conventions via `CLAUDE.md`
- Always generates a summary review
- Clear severity-based feedback
- Maintains consistent format across reviews
- Reads historical comments for continuity

---

# Example Usage

Developer posts this comment in a PR:

```
@claude-inline-code-review
```

Claude then:

1. Reacts with 👀
2. Reviews the PR diff
3. Adds inline comments where needed
4. Posts a structured summary
5. Submits the final review
6. Executes the final script

---

# Conclusion

This workflow provides a **powerful AI-assisted code reviewer** that performs detailed, context-aware inline reviews following your project’s exact standards.
