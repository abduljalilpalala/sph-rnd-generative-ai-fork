# Claude Inline Review Workflow

## Summary
This workflow performs automated inline testcase validation when a PR comment contains the `@claude-inline-review` command.

It parses bullet-style test cases directly from the comment, runs Claude analysis, and posts the review result back to the PR.

---

## How to Use

In your Pull Request comment, include the command:

Follow it with bullet-style test cases. Example:
```
@claude-inline-review
- Verify login redirects to dashboard after success.
- Ensure incorrect password shows proper error message.
- Validate logout clears session and redirects to login.
```

## Notes
- Only executes when triggered by a PR comment containing `@claude-inline-review`.  
- Skips execution if no bullet-style test cases are detected.  
- Posts results as a comment or auto-approves if all checks pass.
- Requires valid secrets for `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`.
