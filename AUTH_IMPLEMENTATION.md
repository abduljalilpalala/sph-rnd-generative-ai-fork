# Authentication Implementation Guide

This document describes the full-stack authentication system implemented for the application.

## Overview

A JWT-based authentication system with login/logout functionality across both backend (NestJS) and frontend (Next.js).

## Backend Implementation (NestJS)

### Architecture

- **JWT Authentication**: Token-based authentication using `@nestjs/jwt` and `@nestjs/passport`
- **Password Hashing**: Bcrypt for secure password storage
- **Auth Guard**: JWT strategy to protect routes

### Files Created

```
test-projects/test-backend/src/auth/
├── auth.module.ts          # Auth module configuration
├── auth.service.ts         # Authentication business logic
├── auth.controller.ts      # Auth endpoints (login, logout, profile)
├── jwt.strategy.ts         # JWT validation strategy
├── jwt-auth.guard.ts       # Guard for protected routes
├── dto/
│   └── login.dto.ts        # Login request validation
└── *.spec.ts               # Unit tests
```

### API Endpoints

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### GET /auth/profile
Get authenticated user profile (requires JWT token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### POST /auth/logout
Logout (token invalidation is handled client-side).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Database Changes

Updated Prisma schema to include password field:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String   // Added for authentication
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Migration Required:**
```bash
cd test-projects/test-backend
yarn prisma migrate dev --name add_password_to_user
```

### Environment Variables

Add to `.env`:
```env
JWT_SECRET=your-secure-secret-key-change-in-production
```

### Dependencies Added

```json
{
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "bcrypt": "^5.1.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1"
}
```

DevDependencies:
```json
{
  "@types/bcrypt": "^5.0.2",
  "@types/passport-jwt": "^4.0.1"
}
```

### Protected Routes Example

To protect any route, use the `JwtAuthGuard`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected')
protectedRoute(@Request() req) {
  return { userId: req.user.userId };
}
```

## Frontend Implementation (Next.js)

### Architecture

- **RTK Query**: API state management for auth endpoints
- **Local Storage**: Token and user data storage
- **Protected Routes**: HOC to restrict access to authenticated users
- **Custom Hook**: `useAuth` for centralized auth logic

### Files Created

```
test-projects/test-frontend/
├── lib/services/
│   └── authApi.ts              # RTK Query auth API
├── hooks/
│   └── useAuth.ts              # Auth business logic hook
├── app/
│   └── login/
│       └── page.tsx            # Login page
└── components/templates/
    └── ProtectedRoute.tsx      # Protected route wrapper
```

### Files Modified

```
test-projects/test-frontend/
├── lib/store.ts                # Added authApi to Redux store
├── app/page.tsx                # Wrapped with ProtectedRoute
└── components/organisms/
    └── TopNavigation.tsx       # Added logout button
```

### Usage Examples

#### Login Page

```tsx
import { useAuth } from "@/hooks/useAuth";

const LoginPage = () => {
  const { handleLogin, isLoggingIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(email, password);
      router.push("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return <form onSubmit={onSubmit}>...</form>;
};
```

#### Protected Routes

```tsx
import { ProtectedRoute } from "@/components/templates";

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <div>Dashboard Content</div>
    </ProtectedRoute>
  );
};
```

#### Logout

```tsx
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { handleLogout } = useAuth();

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};
```

### Authentication Flow

1. **Login:**
   - User submits email/password
   - API call to `/auth/login`
   - Token stored in localStorage
   - User redirected to dashboard

2. **Authenticated Requests:**
   - Token automatically added to headers via RTK Query
   - `Authorization: Bearer <token>`

3. **Protected Routes:**
   - `ProtectedRoute` checks for token
   - Redirects to `/login` if not authenticated
   - Shows loading state during check

4. **Logout:**
   - API call to `/auth/logout`
   - Token removed from localStorage
   - User redirected to `/login`

### Token Storage

Tokens are stored in **localStorage** for this implementation. For production:

- Consider **httpOnly cookies** for enhanced security
- Implement **refresh tokens** for longer sessions
- Add **token expiration handling**

## Security Best Practices Implemented

### Backend
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with expiration (24h)
- ✅ Validation using class-validator
- ✅ Separate user data from password in responses
- ✅ Authorization guards for protected routes

### Frontend
- ✅ Secure token storage
- ✅ Automatic token inclusion in requests
- ✅ Client-side route protection
- ✅ Token cleanup on logout
- ✅ Error handling for failed auth

## Testing

### Backend Tests

Run backend tests:
```bash
cd test-projects/test-backend
yarn test
```

Test files:
- `src/auth/auth.service.spec.ts` - Auth service unit tests
- `src/auth/auth.controller.spec.ts` - Auth controller unit tests

### Frontend Tests

Run frontend tests:
```bash
cd test-projects/test-frontend
npm test
```

Test files:
- `hooks/useAuth.test.ts` - useAuth hook unit tests
- `components/templates/ProtectedRoute.test.tsx` - ProtectedRoute component tests

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd test-projects/test-backend
yarn install
```

**Frontend:**
```bash
cd test-projects/test-frontend
npm install
```

### 2. Database Migration

```bash
cd test-projects/test-backend
yarn prisma migrate dev --name add_password_to_user
```

### 3. Create Test User

You'll need to create a user with a hashed password. You can do this via the updated user creation endpoint or directly in the database.

**Example (using API):**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 4. Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rnd"
JWT_SECRET="your-secure-secret-key-change-in-production"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Start Services

```bash
# From root directory
./boot.sh

# Or manually:
# Backend
cd test-projects/test-backend
docker compose up -d
yarn start:dev

# Frontend
cd test-projects/test-frontend
npm run dev
```

### 6. Test Authentication

1. Navigate to `http://localhost:3001/login`
2. Login with your test user credentials
3. You should be redirected to the dashboard
4. Click the logout button to logout

## Future Enhancements

Consider implementing:

1. **Refresh Tokens**: Long-lived sessions with token refresh
2. **Password Reset**: Email-based password recovery
3. **Email Verification**: Verify user email addresses
4. **2FA**: Two-factor authentication
5. **OAuth**: Social login (Google, GitHub, etc.)
6. **Role-Based Access Control (RBAC)**: User roles and permissions
7. **Session Management**: Server-side session tracking
8. **Rate Limiting**: Prevent brute force attacks
9. **Audit Logging**: Track authentication events
10. **Token Blacklisting**: Server-side token revocation

## Troubleshooting

### "Invalid credentials" error
- Ensure user exists in database with hashed password
- Check email/password are correct
- Verify backend is running on correct port

### Redirect loop on protected pages
- Clear localStorage
- Check token is valid and not expired
- Verify JWT_SECRET matches between requests

### CORS errors
- Ensure CORS is enabled in NestJS
- Check API_URL in frontend .env.local

### Tests failing
- Ensure mocks are properly configured
- Clear test cache: `yarn test --clearCache`
- Check dependencies are installed

## API Response Codes

- `200`: Success
- `201`: Created (user registration)
- `401`: Unauthorized (invalid credentials or token)
- `403`: Forbidden (valid token but insufficient permissions)
- `500`: Internal server error

## Contributing

When adding new protected routes:

1. **Backend**: Add `@UseGuards(JwtAuthGuard)` to controller methods
2. **Frontend**: Wrap pages with `<ProtectedRoute>`
3. **Tests**: Add unit tests for new auth-related code

## License

[Your License Here]
