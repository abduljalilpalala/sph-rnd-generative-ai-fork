# CLAUDE-FE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js frontend in this repository.

## Project Overview

Next.js 15 frontend application with TypeScript, Tailwind CSS, and Redux Toolkit (RTK Query) for state management and API integration. Connects to the NestJS backend at `http://localhost:3000`.

## Development Commands

All commands should be run from the `test-projects/test-frontend/` directory:

```bash
# Install dependencies
npm install
# or
yarn install

# Development
npm run dev              # Start development server on port 3000
yarn dev

# Build
npm run build            # Build for production
npm run start            # Start production server
yarn build
yarn start

# Code quality
npm run lint             # Run ESLint
npm run format          # Format code with Prettier
yarn lint
yarn format
```

## Folder Structure

```
test-projects/test-frontend/
├── app/                           # Next.js App Router pages (high-level only)
│   ├── layout.tsx                 # Root layout with StoreProvider
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles (Tailwind directives)
│   └── users/                     # User management routes
│       ├── page.tsx               # User list page (view all users)
│       ├── create/
│       │   └── page.tsx           # Create user page
│       └── [id]/
│           ├── page.tsx           # User detail page
│           └── edit/
│               └── page.tsx       # Edit user page
├── components/                    # Atomic Design component structure
│   ├── atoms/                     # Basic building blocks
│   │   ├── Alert.tsx              # Alert/notification component
│   │   ├── Button.tsx             # Button with variants (primary, secondary, success, danger, ghost)
│   │   ├── Card.tsx               # Card container
│   │   ├── Input.tsx              # Form input with error states
│   │   ├── Label.tsx              # Form label with required indicator
│   │   ├── Link.tsx               # Styled link component
│   │   ├── Text.tsx               # Typography component
│   │   └── index.ts               # Barrel exports
│   ├── molecules/                 # Simple component combinations
│   │   ├── DataDisplay.tsx        # Label + Value display pair
│   │   ├── EmptyState.tsx         # Empty state message
│   │   ├── FormField.tsx          # Label + Input + Error message
│   │   ├── TableHeader.tsx        # Reusable table header
│   │   ├── TableRow.tsx           # Reusable table row
│   │   └── index.ts               # Barrel exports
│   ├── organisms/                 # Complex feature components
│   │   ├── UserDetail.tsx         # User detail display
│   │   ├── UserForm.tsx           # Complete user form
│   │   ├── UserList.tsx           # User table with actions
│   │   └── index.ts               # Barrel exports
│   └── templates/                 # Page layouts and templates
│       ├── ErrorState.tsx         # Error page template
│       ├── LoadingState.tsx       # Loading page template
│       ├── PageHeader.tsx         # Page header with title and actions
│       ├── PageLayout.tsx         # Base page wrapper
│       └── index.ts               # Barrel exports
├── hooks/                         # Custom React hooks (business logic)
│   ├── useUsers.ts                # Hook for fetching and deleting users
│   ├── useUser.ts                 # Hook for fetching single user
│   ├── useCreateUser.ts           # Hook for creating user
│   └── useUpdateUser.ts           # Hook for updating user
├── lib/                           # Core application logic
│   ├── store.ts                   # Redux store configuration
│   ├── hooks.ts                   # Typed Redux hooks
│   ├── StoreProvider.tsx          # Client-side Redux provider
│   └── services/
│       └── userApi.ts             # RTK Query API definitions
├── .env.local                     # Environment variables
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## Architecture

### Code Organization Philosophy
- **Pages** ([app/](app/)): High-level composition only - use hooks and components
- **Hooks** ([hooks/](hooks/)): Business logic, API calls, and state management
- **Components** ([components/](components/)): Atomic Design structure for UI components
- **Separation of Concerns**: Pages orchestrate, hooks manage logic, components render UI

### Atomic Design Component Structure
Components follow the Atomic Design methodology:
- **Atoms** ([components/atoms/](components/atoms/)): Smallest building blocks (Button, Input, Label, Alert, etc.)
- **Molecules** ([components/molecules/](components/molecules/)): Simple combinations of atoms (FormField, DataDisplay, TableRow, etc.)
- **Organisms** ([components/organisms/](components/organisms/)): Complex feature components (UserForm, UserList, UserDetail)
- **Templates** ([components/templates/](components/templates/)): Page-level layouts and structures (PageLayout, PageHeader, LoadingState, ErrorState)

### State Management
- **Redux Toolkit** with **RTK Query** for API calls and caching
- Store configuration in [lib/store.ts](lib/store.ts)
- API service in [lib/services/userApi.ts](lib/services/userApi.ts)
- Client-side provider wrapper in [lib/StoreProvider.tsx](lib/StoreProvider.tsx)

### Custom Hooks
- **useUsers**: Fetch all users and handle deletion
- **useUser**: Fetch single user by ID
- **useCreateUser**: Handle user creation with form logic
- **useUpdateUser**: Handle user updates with form logic
- Hooks encapsulate RTK Query calls and business logic

### Components Structure (Atomic Design)
- **atoms/**: Basic UI elements - Button, Input, Label, Alert, Card, Link, Text
- **molecules/**: Simple combinations - FormField, DataDisplay, TableHeader, TableRow, EmptyState
- **organisms/**: Complex features - UserForm, UserList, UserDetail
- **templates/**: Page layouts - PageLayout, PageHeader, LoadingState, ErrorState
- All components are presentational and receive data via props
- Use barrel exports (index.ts) for clean imports

### API Integration
- Base URL: `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3000`)
- RTK Query endpoints: `getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`
- Automatic cache invalidation using tags
- Typed hooks: `useGetUsersQuery`, `useCreateUserMutation`, etc.

### Routing
- **App Router** (Next.js 15)
- Server components by default, client components marked with `"use client"`
- Dynamic routes: `/users/[id]` and `/users/[id]/edit`

### Styling
- **Tailwind CSS** for utility-first styling
- Custom styles in [app/globals.css](app/globals.css)
- Responsive design patterns

## Key Patterns

### Page Structure (High-Level)
Pages should be minimal and only orchestrate hooks and components:

```typescript
"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserList } from "@/components/organisms";
import { LoadingState, PageLayout, PageHeader } from "@/components/templates";

export default function UsersPage() {
  const { users, isLoading, handleDelete } = useUsers();

  if (isLoading) return <LoadingState />;

  return (
    <PageLayout>
      <PageHeader title="Users" actions={[...]} />
      <UserList users={users} onDelete={handleDelete} />
    </PageLayout>
  );
}
```

### Custom Hooks (Business Logic)
Hooks encapsulate RTK Query calls and business logic:

```typescript
// hooks/useUsers.ts
export function useUsers() {
  const { data: users, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async (id: number) => {
    await deleteUser(id).unwrap();
  };

  return { users, isLoading, handleDelete };
}
```

### Components (Presentation)
Components are built using atomic design principles:

**Atoms** (Basic elements):
```typescript
// components/atoms/Button.tsx
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

**Molecules** (Simple combinations):
```typescript
// components/molecules/FormField.tsx
<FormField
  label="Email"
  type="email"
  required
  error={error}
/>
```

**Organisms** (Complex features):
```typescript
// components/organisms/UserList.tsx
interface UserListProps {
  users: User[] | undefined;
  onDelete: (id: number) => void;
}

export function UserList({ users, onDelete }: UserListProps) {
  return <Card><table>{/* render users */}</table></Card>;
}
```

### API Calls
RTK Query hooks are used within custom hooks, not directly in pages:

```typescript
// In custom hooks only:
const { data, isLoading, error } = useGetUsersQuery();
const [createUser, { isLoading }] = useCreateUserMutation();
```

### Client Components
Pages with interactivity (forms, hooks) must be client components:

```typescript
"use client";

export default function Page() {
  // Can use hooks, state, event handlers
}
```

### Type Safety
- All API types defined in [lib/services/userApi.ts](lib/services/userApi.ts)
- TypeScript strict mode enabled
- Typed Redux hooks exported from [lib/hooks.ts](lib/hooks.ts)

### Error Handling
- Custom components for loading/error states
- Loading states: `LoadingState` component
- Error states: `ErrorState` component
- User feedback via component composition

## Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Pages Overview

1. **Home** ([app/page.tsx](app/page.tsx)): Landing page with navigation links
2. **Users List** ([app/users/page.tsx](app/users/page.tsx)): View all users with delete functionality
3. **Create User** ([app/users/create/page.tsx](app/users/create/page.tsx)): Form to create new user
4. **User Detail** ([app/users/[id]/page.tsx](app/users/[id]/page.tsx)): View single user details
5. **Edit User** ([app/users/[id]/edit/page.tsx](app/users/[id]/edit/page.tsx)): Form to edit existing user

## Backend Integration

This frontend expects the backend to run on `http://localhost:3000` with the following endpoints:

- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `POST /user` - Create user (body: `{ email, name? }`)
- `PATCH /user/:id` - Update user (body: `{ email?, name? }`)
- `DELETE /user/:id` - Delete user

See [../test-projects/test-backend/CLAUDE-BE.md](../test-projects/test-backend/CLAUDE-BE.md) for backend details.

## Best Practices

### Code Organization
- **Pages**: Keep minimal - only compose hooks and components
- **Hooks**: Extract all business logic, API calls, and state management
- **Components**: Keep presentational - receive data via props only
- **No direct RTK Query in pages**: Always wrap in custom hooks

### File Structure Rules
- Create custom hooks in [hooks/](hooks/) for each feature
- Follow Atomic Design for components:
  - **Atoms**: Basic UI elements in [components/atoms/](components/atoms/)
  - **Molecules**: Simple combinations in [components/molecules/](components/molecules/)
  - **Organisms**: Feature components in [components/organisms/](components/organisms/)
  - **Templates**: Page layouts in [components/templates/](components/templates/)
- Use barrel exports (index.ts) in each component directory for clean imports
- Import from organizational level: `@/components/atoms`, `@/components/organisms`, etc.

### General Guidelines
- Always use typed hooks from `lib/hooks.ts` instead of plain `useDispatch`/`useSelector`
- RTK Query handles caching automatically - no need for manual cache management
- Use `"use client"` directive only when necessary (forms, hooks, interactivity)
- All file paths use absolute imports via `@/*` alias (configured in [tsconfig.json](tsconfig.json))
- Keep components pure and testable by passing data via props

## Coding Standards

### Import Patterns
- **Always use module alias/path alias imports (`@/`)** - never use relative paths (including `./` for same-directory imports)
  - ❌ Bad: `import MyComponent from '../../../components/MyComponent';`
  - ❌ Bad: `export { Alert } from "./Alert";` (same-directory relative import)
  - ✅ Good: `import MyComponent from '@/components/MyComponent';`
  - ✅ Good: `export { Alert } from "@/components/atoms/Alert";` (use `@/` even for same-directory)
- Imports from the same directory (atoms, molecules, etc.) should be combined in a single import statement when importing
  - Example: `import { Input, Label } from "@/components/atoms";` (not separate imports)

### Function Declarations

#### Arrow Function Standards
Use arrow functions consistently throughout the codebase following these guidelines:

**When to Use Arrow Functions:**
- ✅ **React Components**: All functional components should use arrow function syntax
  ```typescript
  export const MyComponent = () => {
    return <div>Hello</div>;
  };
  ```
- ✅ **Custom Hooks**: All custom hooks should use arrow functions
  ```typescript
  export const useCustomHook = () => {
    // hook logic
  };
  ```
- ✅ **Utility Functions**: Standalone utility and helper functions
  ```typescript
  export const formatDate = (date: Date) => {
    return date.toISOString();
  };
  ```
- ✅ **Callbacks**: Array methods, event handlers, and inline callbacks
  ```typescript
  const lengths = users.map((user) => user.name.length);
  const handleClick = () => console.log('clicked');
  ```
- ✅ **Promise Chains**: Async operations and promise handlers
  ```typescript
  fetchData()
    .then((data) => processData(data))
    .catch((error) => handleError(error));
  ```

**When NOT to Use Arrow Functions:**
- ❌ **Object Methods**: Use regular function syntax when you need access to `this`
  ```typescript
  const obj = {
    value: 42,
    getValue() {  // NOT: getValue: () => {...}
      return this.value;
    }
  };
  ```
- ❌ **Class Methods**: Use regular method syntax in classes (though we prefer functional components)
- ❌ **Functions Requiring `arguments` Object**: Use regular functions when you need the `arguments` object
- ❌ **Constructors**: Arrow functions cannot be used with `new`
- ❌ **Generator Functions**: Cannot use `yield` in arrow functions

**Syntax Guidelines:**
- Use parentheses for parameters:
  - Single parameter: `(user) => user.name` (preferred for consistency)
  - Multiple parameters: `(a, b) => a + b`
  - No parameters: `() => doSomething()`
- Implicit return for single expressions:
  ```typescript
  const double = (n: number) => n * 2;
  ```
- Explicit return with block body:
  ```typescript
  const processUser = (user: User) => {
    const formatted = formatUser(user);
    return formatted;
  };
  ```
- JSX requires parentheses for implicit return:
  ```typescript
  export const Component = () => (
    <div>Hello</div>
  );
  ```

**Reference**: [MDN Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
