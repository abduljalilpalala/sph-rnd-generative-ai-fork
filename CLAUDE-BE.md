# CLAUDE-BE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS + Prisma backend application with PostgreSQL database, containerized with Docker. The project is located in the `test-projects/test-backend/` subdirectory.

## Development Commands

All commands should be run from the `test-projects/test-backend/` directory:

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
test-projects/test-backend/
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

## Unit Testing Guidelines

### Overview
This project uses Jest and NestJS testing utilities for comprehensive unit testing. While unit tests are optional for PRs, following these guidelines ensures high-quality test coverage when tests are written.

### Test File Requirements

#### File Naming and Location
- Create test files in the **SAME directory** as the source file
- Use `.spec.ts` extension for all test files
- Examples:
  - `src/user/user.controller.ts` → `src/user/user.controller.spec.ts`
  - `src/user/user.service.ts` → `src/user/user.service.spec.ts`
  - `src/product/product.controller.ts` → `src/product/product.controller.spec.ts`

#### Files That Need Tests
Create a `.spec.ts` file for:
- ✅ **All controllers** (`.controller.ts` files) - Test HTTP endpoints and request/response handling
- ✅ **All services** (`.service.ts` files) - Test business logic and data operations
- ✅ **Complex business logic** in other TypeScript files
- ✅ **Utility functions** and helpers

#### Files That DON'T Need Tests
DO NOT create test files for:
- ❌ **DTOs** (`.dto.ts` files) - Data transfer objects with validation decorators only
- ❌ **Entities** (`.entity.ts` files) - Database entity definitions
- ❌ **Modules** (`.module.ts` files) - Dependency injection configuration
- ❌ **Interfaces** and type definitions
- ❌ **Configuration files** (`.config.ts`)
- ❌ **Migration files** in `prisma/migrations/`
- ❌ **Files in node_modules/** - NEVER create tests here

**Example of what to test:**
```
src/user/
├── user.controller.ts     ✅ Test this → user.controller.spec.ts
├── user.service.ts        ✅ Test this → user.service.spec.ts
├── user.module.ts         ❌ Skip - module config
├── dto/
│   ├── create-user.dto.ts ❌ Skip - just validation decorators
│   └── update-user.dto.ts ❌ Skip - just validation decorators
└── entities/
    └── user.entity.ts     ❌ Skip - entity definition
```

### Testing Framework Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Tests here...
});
```

### Testing Patterns

#### Controller Tests
- Test all HTTP endpoints (GET, POST, PATCH, DELETE)
- Mock injected services
- Verify correct service methods are called
- Test response formatting
- Test error handling

```typescript
describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, email: 'test@example.com', name: 'Test' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { email: 'test@example.com', name: 'Test' };
      const result = { id: 1, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
    });
  });
});
```

#### Service Tests
- Test all public methods
- Mock Prisma client methods
- Test business logic thoroughly
- Test data transformations
- Test error cases

```typescript
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, email: 'test@example.com', name: 'Test' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto = { email: 'test@example.com', name: 'Test' };
      const user = { id: 1, ...createDto };
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      const result = await service.create(createDto);
      expect(result).toEqual(user);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw error if user already exists', async () => {
      const createDto = { email: 'test@example.com', name: 'Test' };
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Unique constraint'));

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });
});
```

### Test Coverage Requirements

#### What to Test
- ✅ **Success cases**: Normal operation with valid inputs
- ✅ **Error cases**: Invalid inputs, database errors, constraint violations
- ✅ **Edge cases**: Empty arrays, null values, boundary conditions
- ✅ **Business logic**: All conditional branches and calculations
- ✅ **Data transformations**: Input validation, output formatting

#### Mock Guidelines
- **Always mock**:
  - `PrismaService` and all database operations
  - External services and APIs
  - File system operations
  - Environment variables if needed
- **Never mock**: The class/service being tested

### Best Practices

1. **Descriptive Test Names**: Use clear, action-oriented descriptions
   ```typescript
   it('should return user by id')
   it('should throw error when user not found')
   it('should update user email successfully')
   ```

2. **Arrange-Act-Assert Pattern**:
   ```typescript
   it('should create a user', async () => {
     // Arrange
     const createDto = { email: 'test@example.com', name: 'Test' };
     (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, ...createDto });

     // Act
     const result = await service.create(createDto);

     // Assert
     expect(result).toEqual({ id: 1, ...createDto });
     expect(prisma.user.create).toHaveBeenCalledWith({ data: createDto });
   });
   ```

3. **Isolated Tests**: Each test should be independent
   - Use `beforeEach` for setup
   - Reset mocks between tests
   - Don't rely on test execution order

4. **Type Safety**: Use proper TypeScript types
   ```typescript
   const mockPrismaService = {
     user: {
       findMany: jest.fn<Promise<User[]>, []>(),
       findUnique: jest.fn<Promise<User | null>, [any]>(),
     },
   };
   ```

### Common Mocking Patterns

#### Mock Prisma Service
```typescript
const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

#### Mock External Services
```typescript
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
};
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run specific test file
yarn test user.service.spec.ts

# Run E2E tests
yarn test:e2e
```

### Automated Test Generation (GitHub Actions)

Unit tests can be automatically generated for PRs using the `@claude-create-unit-test` workflow:

1. **Trigger via comment**: Comment `@claude-create-unit-test` on any PR
2. **Trigger via label**: Add the `claude-create-unit-test` label to a PR

The workflow will:
- Analyze all changed `.controller.ts` and `.service.ts` files
- Generate corresponding `.spec.ts` files following these guidelines
- Push tests to a new branch `{pr-branch}-unit-test`
- Provide instructions for review and merging

### Checklist for PR Test Files

When creating unit tests for a PR, ensure:
- [ ] Every `.controller.ts` file has a corresponding `.spec.ts` file
- [ ] Every `.service.ts` file has a corresponding `.spec.ts` file
- [ ] All public methods are tested
- [ ] Success cases are covered
- [ ] Error cases are covered
- [ ] Edge cases are handled
- [ ] All dependencies are properly mocked
- [ ] Tests follow NestJS testing patterns
- [ ] Test names are descriptive
- [ ] Tests are isolated and independent

### Tips for Writing Good Tests

1. **Start with the happy path**: Test successful operations first
2. **Then add error cases**: Test what happens when things go wrong
3. **Don't test implementation details**: Focus on behavior, not internal workings
4. **Keep tests simple**: One assertion per test when possible
5. **Use descriptive names**: Test names should explain what they verify
6. **Mock at the boundary**: Mock external dependencies, not internal logic
7. **Test edge cases**: Empty inputs, null values, boundary conditions
8. **Follow AAA pattern**: Arrange, Act, Assert for clarity

## Centralized Error Handling

### Overview
This project uses a centralized error handling utility located at `src/common/utils/error-handler.util.ts` to ensure consistent error logging and handling throughout the backend application.

### When to Use the Error Handler

**ALWAYS use the centralized error handler in `catch` blocks** for:
- ✅ Database operations (Prisma queries)
- ✅ External service calls (S3, APIs)
- ✅ File operations
- ✅ Any operation that may throw errors

**Benefits:**
- Consistent error logging format across the application
- Automatic error normalization (Error, string, object → structured format)
- Context-aware logging (includes service/method name)
- Type-safe error handling
- Development vs. production logging modes
- Integration with NestJS Logger

### Basic Usage

#### Import the Utility
```typescript
import { logError } from '../../common/utils/error-handler.util';
```

#### Log Errors in Catch Blocks
```typescript
try {
  // Your operation here
  await this.prisma.user.create({ data: userData });
} catch (error) {
  // Log the error with context, then re-throw
  logError(error, 'UserService.create', this.logger);
  throw error;
}
```

### Usage Guidelines

#### Rule 1: Always Provide Context
The context parameter should follow the format: `ClassName.methodName`

```typescript
// ✅ GOOD: Clear context
logError(error, 'FileService.uploadFile', this.logger);
logError(error, 'S3StorageService.delete', this.logger);
logError(error, 'UserController.findOne', this.logger);

// ❌ BAD: Missing or vague context
logError(error);
logError(error, 'error');
logError(error, 'Something went wrong');
```

#### Rule 2: Re-throw After Logging
Always re-throw the error after logging so NestJS exception filters can handle it properly:

```typescript
// ✅ GOOD: Logs then re-throws
try {
  await someOperation();
} catch (error) {
  logError(error, 'ServiceName.methodName', this.logger);
  throw error;
}

// ❌ BAD: Swallows the error
try {
  await someOperation();
} catch (error) {
  logError(error, 'ServiceName.methodName', this.logger);
  // No throw - error is swallowed!
}
```

#### Rule 3: Use Logger Instance from Your Service
Pass your service's Logger instance for proper context tracking:

```typescript
@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      // Upload logic
    } catch (error) {
      // Pass this.logger to maintain service context
      logError(error, 'FileService.uploadFile', this.logger);
      throw error;
    }
  }
}
```

### Complete Example

Here's a real-world example from the file service:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { logError } from '../common/utils/error-handler.util';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: S3StorageService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: number) {
    try {
      // Upload file to S3
      const uploadResult = await this.storageService.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      // Save file record to database
      const fileRecord = await this.prisma.file.create({
        data: {
          originalName: file.originalname,
          storedName: uploadResult.key,
          s3Key: uploadResult.key,
          s3Bucket: uploadResult.bucket,
          mimeType: file.mimetype,
          size: file.size,
          uploadedById: userId,
        },
      });

      return fileRecord;
    } catch (error) {
      // Log with context, then re-throw
      logError(error, 'FileService.uploadFile', this.logger);
      throw error;
    }
  }

  async deleteFile(id: number) {
    try {
      const file = await this.prisma.file.findUnique({ where: { id } });
      if (!file) {
        throw new Error('File not found');
      }

      // Delete from S3
      await this.storageService.delete(file.s3Key);

      // Delete from database
      await this.prisma.file.delete({ where: { id } });

      return { success: true };
    } catch (error) {
      logError(error, 'FileService.deleteFile', this.logger);
      throw error;
    }
  }
}
```

### Error Output Format

When an error is logged, the centralized handler produces structured output:

```
[Nest] 12345  - 01/12/2026, 10:30:45 AM   ERROR [FileService] Failed to upload file to S3
{
  "name": "Error",
  "code": "NoSuchBucket",
  "statusCode": undefined,
  "timestamp": "2026-01-12T10:30:45.123Z"
}
```

In development mode, the original error object is also logged for debugging purposes.

### Advanced Features

#### Type Guards
The utility provides type guards for identifying specific error types:

```typescript
import { isPrismaError, isStorageError } from '../../common/utils/error-handler.util';

try {
  await operation();
} catch (error) {
  if (isPrismaError(error)) {
    // Handle database errors specifically
  } else if (isStorageError(error)) {
    // Handle S3/storage errors specifically
  }
  logError(error, 'ServiceName.methodName', this.logger);
  throw error;
}
```

#### Error Normalization
The utility automatically normalizes different error types:
- **Error instances**: Extracts message, name, stack, code
- **HTTP errors**: Extracts status code and response data
- **String errors**: Wraps strings in structured format
- **Object errors**: Extracts message property
- **Unknown types**: Provides fallback structure

### Best Practices

1. **Always include context**: Use `ClassName.methodName` format
2. **Always re-throw**: Let NestJS handle HTTP responses
3. **Use service logger**: Pass `this.logger` for context consistency
4. **Log at operation boundaries**: Catch at service method level
5. **Don't log twice**: Only log once per error chain

### Checklist

When adding error handling to your service/controller:
- [ ] Import `logError` from `error-handler.util`
- [ ] Add try-catch blocks around operations that may fail
- [ ] Call `logError(error, 'ClassName.methodName', this.logger)` in catch block
- [ ] Re-throw the error after logging
- [ ] Test that errors are logged with proper context

### Migration Guide

If you have existing catch blocks with custom error logging:

**Before:**
```typescript
try {
  await operation();
} catch (error) {
  this.logger.error(`Failed to do something: ${error.message}`);
  throw error;
}
```

**After:**
```typescript
try {
  await operation();
} catch (error) {
  logError(error, 'ServiceName.methodName', this.logger);
  throw error;
}
```

### Related Tools

- **NestJS Logger**: Used internally by the error handler
- **Exception Filters**: Handle errors after they're logged and thrown
- **Prisma Error Codes**: Detected automatically via `isPrismaError()`
