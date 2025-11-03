# Claude Unit Test Generator v1

## Summary
This workflow automatically generates comprehensive unit tests for changed files in a pull request using Claude. It analyzes PR modifications, follows project testing patterns, and creates properly structured test files for both backend and frontend code.

---

## How to Use

You can trigger this workflow in **two ways:**

1. **Via PR Comment**
   - Add a comment in any pull request containing the keyword:
   ```
   @claude-create-unit-test
   ```
   - Claude will react 👀 to acknowledge your request and begin generating tests.

2. **Via Label**
   - Add the label `claude-create-unit-test` to a pull request.
   - The workflow will automatically run and generate unit tests.

---

## What It Does

When triggered, the workflow:
1. Adds an 👀 reaction to acknowledge the test generation request.
2. Checks out the pull request's head branch.
3. Identifies the PR number and branch information.
4. Verifies required documentation files exist (with testing guidelines and patterns).
5. Posts an initial status comment indicating analysis is in progress.
6. Runs **Claude Code** with repository context to:
   - Read testing documentation and guidelines
   - Analyze the PR diff to identify changed files
   - Generate comprehensive unit tests following project patterns
7. Creates test files in the **same directory** as the source files.
8. Commits test files to a new branch (`{original-branch}-unit-test`).
9. Pushes the branch and updates the PR comment with:
   - Count of generated backend and frontend tests
   - Links to review and run the tests locally
   - Direct link to create a PR from the test branch
   - List of all generated test files
10. Adds a 🚀 reaction when complete (or 😕 if failed).

---

## What Gets Tested

### Backend Tests (`.spec.ts`)
Tests are generated for:
- ✅ **Controllers** (`.controller.ts` files)
- ✅ **Services** (`.service.ts` files)

Tests are **NOT** generated for:
- ❌ DTOs (`.dto.ts` files)
- ❌ Entities (`.entity.ts` files)
- ❌ Modules (`.module.ts` files)
- ❌ Files in `node_modules/`

### Frontend Tests (`.test.ts` / `.test.tsx`)
Tests are generated for:
- ✅ **Components** (`.tsx` files in `components/` directory)
- ✅ **Hooks** (`use*.ts` files in `hooks/` directory)
- ✅ **Utilities** (`.ts` files in `lib/` directory, excluding configs)

Tests are **NOT** generated for:
- ❌ Page files in `app/` directory
- ❌ Config files (`.config.ts`, `.config.js`)
- ❌ Type definitions (`.d.ts`)
- ❌ Files in `node_modules/`

---

## Generated Test Files

### File Naming Convention
Test files are created alongside their source files:

**Backend Examples:**
```
src/user/user.controller.ts        → src/user/user.controller.spec.ts
src/product/product.service.ts     → src/product/product.service.spec.ts
```

**Frontend Examples:**
```
components/atoms/Button.tsx        → components/atoms/Button.test.tsx
hooks/useUsers.ts                  → hooks/useUsers.test.ts
lib/helpers.ts                     → lib/helpers.test.ts
```

### Important Note
The workflow **only generates tests for files changed in the PR**, not for the entire service, controller, or repository. This keeps CI/CD times reasonable and prevents unnecessary test generation for unchanged code.

---

## Output Format

When tests are successfully generated, the workflow posts a detailed comment with:

```md
✅ Unit tests have been generated and pushed to branch `{branch-name}-unit-test`

**Tests generated:**
- **Backend**: X test file(s) (`.spec.ts`)
- **Frontend**: Y test file(s) (`.test.ts`/`.test.tsx`)

**Next steps:**
1. Review the generated tests locally
2. Run tests to verify they work
3. Create a PR from the test branch

[View all generated test files]
[Testing guidelines]
```

If no tests are generated, the workflow explains why (e.g., only DTOs changed, missing documentation files).

---

## Next Steps After Generation

Once tests are generated:

1. **Review locally:**
   ```bash
   git fetch origin
   git checkout {branch-name}-unit-test
   ```

2. **Run tests to verify:**
   - Backend: `cd test-projects/test-backend && yarn test`
   - Frontend: `cd test-projects/test-frontend && yarn test`

3. **Create a PR from the test branch** using the provided link to merge into your original PR branch.

4. **Iterate if needed** - Update source code, trigger the workflow again for additional tests.

---

## Requirements

### Documentation Files
The workflow requires documentation files in your repository root that define testing patterns and conventions. You can organize these into **one or more files** according to your project's preferences:

**Example configurations:**

**Single file (minimal):**
- `TESTING.md` - All testing guidelines in one file

**Two files (split by layer):**
- `TESTING.md` - General and backend patterns
- `FRONTEND.md` - Frontend-specific patterns

**Three files (separated concerns - recommended):**
- `CLAUDE.md` - General testing guidelines
- `CLAUDE-BE.md` - Backend testing patterns and conventions
- `CLAUDE-FE.md` - Frontend testing patterns and conventions

**To configure for your project:**
1. Create your documentation file(s) with your preferred names
2. Update the workflow's `Generate Unit Tests with Claude` step to reference your file names in the prompt:
   ```bash
   cat YOUR-DOC-FILE.md
   cat YOUR-BACKEND-DOC.md
   # Add more cat commands as needed
   ```

These files should define the testing style, mocking strategies, and patterns Claude should follow when generating tests.

### Secrets
You must configure this secret in your GitHub repository:
- `ANTHROPIC_API_KEY_UNIT_TEST` - API key for Claude to access the model

### Permissions Required
The workflow requires the following GitHub permissions:
- `contents: write` - To create and push test files
- `pull-requests: write` - To post status comments
- `issues: write` - To add reactions and post comments
- `id-token: write` - For authentication
- `actions: read` - For workflow context

---

## Common Scenarios

### Scenario 1: Only DTOs Changed
**Result:** No tests generated (as expected)
```
⚠️ No unit test files were generated.
Possible reasons:
- No testable code changes (only DTOs, configs, or docs changed)
```

### Scenario 2: Service and Component Changed
**Result:** Tests generated for both
```
✅ Unit tests have been generated
- Backend: 1 test file(s) (.spec.ts)
- Frontend: 1 test file(s) (.test.tsx)
```

### Scenario 3: Page Component Changed
**Result:** No frontend tests generated (as expected)
```
⚠️ No unit test files were generated.
Possible reasons:
- Changes are in excluded directories (app/ pages)
```

---

## Troubleshooting

### Workflow Fails Silently
**Check:**
- Is `ANTHROPIC_API_KEY_UNIT_TEST` secret configured?
- Do your documentation files exist and are they referenced correctly in the workflow?
- Does your GitHub token have sufficient permissions?

### No Tests Generated When Expected
**Possible causes:**
- Changed files are in excluded categories (DTOs, configs, pages)
- Changed files are in excluded directories (`node_modules/`, `app/`)
- Documentation files are missing

### Tests in `node_modules/` Directory
**The workflow automatically cleans this up**, but if it occurs:
1. Check the workflow logs for errors
2. Verify the pre-flight documentation check passed
3. Review the files changed in the PR

---

## What's Included in v1

✨ **Improved File Scoping:**
- Generates tests only for changed files in the PR (not entire repository)

🔍 **Enhanced Pre-flight Checks:**
- Verifies documentation files exist before processing

🧹 **Automatic Cleanup:**
- Removes any test files accidentally created in `node_modules/`

📊 **Detailed Reporting:**
- Counts backend vs frontend tests separately
- Shows all generated file paths
- Provides direct links to review and run tests

🔗 **Streamlined PR Integration:**
- Direct comparison link to create PR from test branch
- Links to testing guidelines documentation