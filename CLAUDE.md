# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this monorepo.

## Project Structure

This is a monorepo containing both frontend and backend applications:

```
rnd/
├── test-projects/
│   ├── test-backend/          # NestJS + Prisma backend
│   └── test-frontend/         # Next.js + RTK Query frontend
├── CLAUDE-BE.md               # Backend-specific guidance
├── CLAUDE-FE.md               # Frontend-specific guidance
└── CLAUDE.md                  # This file (routing guidance)
```

## Context-Aware Guidelines

**IMPORTANT**: When working on this project, you must use the appropriate context file based on the work location:

### Working on Backend (`test-projects/test-backend/`)

- **Use**: [CLAUDE-BE.md](CLAUDE-BE.md) for all backend-related work
- **Applies to**: NestJS, Prisma, PostgreSQL, database migrations, API endpoints
- **File patterns**: `test-projects/test-backend/**/*`, `*.prisma`, backend configurations

### Working on Frontend (`test-projects/test-frontend/`)

- **Use**: [CLAUDE-FE.md](CLAUDE-FE.md) for all frontend-related work
- **Applies to**: Next.js, React, TypeScript, RTK Query, Tailwind CSS, UI components
- **File patterns**: `test-projects/test-frontend/**/*`, frontend configurations

### General Workflow

1. **Identify the workspace**: Check which directory you're working in
2. **Load the appropriate context**: Read the corresponding CLAUDE-\*.md file
3. **Follow the guidelines**: Apply the coding standards, architecture patterns, and best practices from that file
4. **Cross-reference when needed**: For full-stack features, consult both files

## Quick Reference

| Task                            | Context File                 | Location                       |
| ------------------------------- | ---------------------------- | ------------------------------ |
| API endpoints, database schemas | [CLAUDE-BE.md](CLAUDE-BE.md) | `test-projects/test-backend/`  |
| UI components, pages, hooks     | [CLAUDE-FE.md](CLAUDE-FE.md) | `test-projects/test-frontend/` |
| Full-stack features             | Both files                   | Both directories               |
| Scripts, CI/CD, root configs    | This file                    | Root directory                 |

## Development Workflow

### Starting Services

```bash
./boot.sh              # Start all services (database, backend, frontend)
./stop.sh              # Stop all services
```

### Backend Development

```bash
cd test-projects/test-backend
# See CLAUDE-BE.md for commands
```

### Frontend Development

```bash
cd test-projects/test-frontend
# See CLAUDE-FE.md for commands
```

## Unit Testing

Both backend and frontend have comprehensive unit testing guidelines:

### Backend Unit Tests

- **Framework**: Jest + NestJS Testing utilities
- **File extension**: `.spec.ts`
- **Coverage**: Controllers, Services, Business Logic
- **See**: [CLAUDE-BE.md](CLAUDE-BE.md) - Unit Testing Guidelines section

### Frontend Unit Tests

- **Framework**: Jest + React Testing Library
- **File extension**: `.test.ts` / `.test.tsx`
- **Coverage**: Components, Hooks, Utilities
- **See**: [CLAUDE-FE.md](CLAUDE-FE.md) - Unit Testing Guidelines section

## Code Review Guidelines

When reviewing code:

- **Backend changes**: Verify adherence to [CLAUDE-BE.md](CLAUDE-BE.md)
- **Frontend changes**: Verify adherence to [CLAUDE-FE.md](CLAUDE-FE.md)
- **Full-stack changes**: Check both files for consistency

---

For detailed guidelines, see:

- **Backend**: [CLAUDE-BE.md](CLAUDE-BE.md)
- **Frontend**: [CLAUDE-FE.md](CLAUDE-FE.md)
