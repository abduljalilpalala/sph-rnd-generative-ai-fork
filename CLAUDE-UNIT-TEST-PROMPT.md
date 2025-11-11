Generate comprehensive unit tests for PR #${{ steps.pr-info.outputs.number }}.

## STEP 1 - READ DOCUMENTATION:

```bash
cat CLAUDE.md
cat CLAUDE-BE.md
cat CLAUDE-FE.md
```

## STEP 2 - ANALYZE PR CHANGES:

```bash
gh pr diff ${{ steps.pr-info.outputs.number }}
```

## STEP 3 - IDENTIFY FILES THAT NEED TESTS:

From the PR diff, identify files that need tests:

### Backend files (test-projects/test-backend/src/):

- ✅ Include: .controller.ts files (e.g., user.controller.ts)
- ✅ Include: .service.ts files (e.g., user.service.ts)
- ❌ Exclude: .dto.ts files (DTOs don't need unit tests)
- ❌ Exclude: .entity.ts files (entities don't need unit tests)
- ❌ Exclude: .module.ts files (modules don't need unit tests)
- ❌ Exclude: files in node_modules/

### Frontend files (test-projects/test-frontend/):

- ✅ Include: Component .tsx files in components/ directory
- ✅ Include: Hook files (use*.ts) in hooks/ directory
- ✅ Include: Utility .ts files in lib/ directory (except configs)
- ❌ Exclude: Page files in app/ directory
- ❌ Exclude: Config files (.config.ts, .config.js)
- ❌ Exclude: Type definition files (.d.ts)
- ❌ Exclude: files in node_modules/

## STEP 4 - CREATE TEST FILES:

For each identified file, create a test file IN THE SAME DIRECTORY:

### Backend examples:
- src/user/user.controller.ts → src/user/user.controller.spec.ts
- src/product/product.service.ts → src/product/product.service.spec.ts

### Frontend examples:
- components/atoms/Button.tsx → components/atoms/Button.test.tsx
- hooks/useUsers.ts → hooks/useUsers.test.ts

Follow the patterns in CLAUDE-BE.md and CLAUDE-FE.md exactly.

## CRITICAL RULES:

- ✅ DO: Create tests only in test-projects/ directories
- ✅ DO: Follow naming conventions (.spec.ts or .test.ts/.test.tsx)
- ✅ DO: Use patterns from documentation
- ❌ DO NOT: Create any files in node_modules/
- ❌ DO NOT: Create tests for DTOs, entities, modules, configs
- ❌ DO NOT: Create output.txt or markdown files
- ❌ DO NOT: Commit files

Start by reading the docs and PR diff.

After creating each test file, run the tests to verify they pass. Fix any failures before committing.