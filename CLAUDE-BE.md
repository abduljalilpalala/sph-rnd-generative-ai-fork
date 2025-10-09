# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS + Prisma backend application with PostgreSQL database, containerized with Docker. The project is located in the `rnd-backend/` subdirectory.

## Development Commands

All commands should be run from the `rnd-backend/` directory:

```bash
# Start PostgreSQL database
docker compose up -d

# Install dependencies
yarn install

# Database operations
yarn prisma migrate reset      # Reset and migrate database
yarn prisma db push           # Push schema changes without migrations
yarn reset                    # Reset database and run seed scripts
yarn seed                     # Run database seed scripts

# Development
yarn start:dev               # Start in watch mode
yarn start:debug            # Start with debugger
yarn build                  # Build for production
yarn start:prod            # Run production build

# Code quality
yarn lint                   # Run ESLint with auto-fix
yarn format                # Format code with Prettier

# Testing
yarn test                  # Run unit tests
yarn test:watch           # Run tests in watch mode
yarn test:cov             # Run tests with coverage
yarn test:e2e             # Run end-to-end tests
yarn test:debug           # Run tests with debugger
```

## Folder Structure

```
rnd-backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   ├── prisma/
│   │   ├── prisma.module.ts       # Prisma module
│   │   └── prisma.service.ts      # Database connection service
│   └── user/
│       ├── user.module.ts         # User feature module
│       ├── user.controller.ts     # User REST endpoints
│       └── user.service.ts        # User business logic
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration files
├── test/
│   ├── jest-e2e.json              # E2E test configuration
│   └── app.e2e-spec.ts            # E2E tests
├── scripts/
│   ├── prisma-reset.sh            # Database reset script
│   └── seed.sh                    # Database seeding script
├── docker-compose.yml             # PostgreSQL container setup
├── Dockerfile                     # Application container
└── package.json                   # Dependencies and scripts
```

## Architecture

### Database Configuration
- PostgreSQL runs in Docker on port **5433** (mapped from container port 5432)
- Database name: `rnd`
- Credentials: `postgres`/`postgres` (development)
- Connection managed via Prisma ORM

### Module Structure
- **PrismaModule**: Provides `PrismaService` that extends `PrismaClient` with lifecycle hooks (`onModuleInit`, `onModuleDestroy`) for connection management
- **UserModule**: CRUD operations for User entity through `UserService` and `UserController`
- All feature modules should inject `PrismaService` for database access

### Application Entry
- Server runs on port 3000 (configurable via `PORT` environment variable)
- Application bootstraps through `src/main.ts` using `NestFactory.create(AppModule)`

### Database Schema
- Primary model: `User` (id, email, name, createdAt, updatedAt)
- Prisma schema located at `prisma/schema.prisma`
- Migrations stored in `prisma/migrations/`

## Key Patterns

- Services should inject `PrismaService` via constructor for database operations
- All models auto-generate TypeScript types via Prisma Client
- DATABASE_URL environment variable required for Prisma connection
