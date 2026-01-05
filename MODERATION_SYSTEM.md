# Role-Based Post Moderation & Reporting System

This document describes the comprehensive role-based moderation and reporting system implemented for posts.

## Overview

The system implements a complete role-based access control (RBAC) for post management, reporting, and moderation with three user roles: **USER**, **MODERATOR**, and **ADMIN**.

## Database Schema

### Entities

#### User (Enhanced)
- Added `role` field (UserRole enum: USER, MODERATOR, ADMIN)
- Relations to posts, reports, and moderation logs

#### Post
- `id`: Unique identifier
- `title`: Post title
- `content`: Post content
- `authorId`: Reference to User
- `createdAt`, `updatedAt`: Timestamps
- Relations: author, reports, moderationLogs

#### Report
- `id`: Unique identifier
- `reason`: Reason for reporting
- `postId`: Reference to Post
- `reporterId`: Reference to User (reporter)
- `status`: ReportStatus enum (PENDING, APPROVED, REJECTED)
- `createdAt`, `updatedAt`: Timestamps
- Unique constraint: A user can only report a post once

#### ModerationLog
- `id`: Unique identifier
- `action`: Action taken (e.g., REPORT_APPROVED, REPORT_REJECTED)
- `postId`: Reference to Post
- `moderatorId`: Reference to User (moderator)
- `details`: Additional details
- `createdAt`: Timestamp

## Backend Implementation

### Modules

1. **Post Module** (`src/post/`)
   - PostService: Business logic for post CRUD operations
   - PostController: REST API endpoints
   - Authorization: Users can only edit/delete their own posts; Moderators/Admins can edit/delete any post

2. **Report Module** (`src/report/`)
   - ReportService: Business logic for reporting posts
   - ReportController: REST API endpoints
   - Authorization: Only Moderators/Admins can view and moderate reports

3. **ModerationLog Module** (`src/moderation-log/`)
   - ModerationLogService: Service for logging all moderation actions
   - Automatically logs approve/reject actions

4. **Common** (`src/common/`)
   - Guards: RolesGuard for role-based authorization
   - Decorators: @Roles(), @CurrentUser()
   - Middleware: AuthMiddleware (simulates user authentication via headers)

### API Endpoints

#### Posts (`/posts`)
- `POST /posts` - Create a post (authenticated users)
- `GET /posts` - Get all posts (public)
- `GET /posts/:id` - Get single post (public)
- `PUT /posts/:id` - Update post (owner or moderator/admin)
- `DELETE /posts/:id` - Delete post (owner or moderator/admin)
- `GET /posts/author/:authorId` - Get posts by author (public)

#### Reports (`/reports`)
- `POST /reports` - Create a report (authenticated users, cannot report own post)
- `GET /reports` - Get all reports (moderator/admin only)
- `GET /reports/pending` - Get pending reports (moderator/admin only)
- `GET /reports/:id` - Get single report (moderator/admin only)
- `PATCH /reports/:id/approve` - Approve a report (moderator/admin only, cannot moderate own post)
- `PATCH /reports/:id/reject` - Reject a report (moderator/admin only, cannot moderate own post)

#### Users (`/users`)
- `PATCH /users/:id/role` - Update user role (admin only)

### Authorization Rules

#### General Rules
1. Users can only edit or delete **their own posts**
2. Users **cannot moderate their own posts**
3. All moderation actions are **automatically logged**

#### Role Permissions

**USER:**
- Create, edit, and delete their own posts
- Report posts created by other users
- Cannot view reports or moderation logs

**MODERATOR:**
- All USER permissions
- View all reported posts
- Approve, reject, or edit reported posts (except their own)
- Cannot assign or remove roles

**ADMIN:**
- All MODERATOR permissions
- Override any moderation decisions
- Assign or remove moderator/admin roles
- Full system access

### Security Features

1. **Ownership Checks**: Enforced at service level
2. **Role Guards**: NestJS guards prevent unauthorized access
3. **Self-Moderation Prevention**: Users cannot moderate their own posts
4. **Duplicate Report Prevention**: Unique constraint prevents multiple reports from same user
5. **Audit Trail**: All moderation actions logged with details

### Authentication

The system uses a simple header-based authentication for demonstration:
- `X-User-Id`: User ID
- `X-User-Email`: User email
- `X-User-Role`: User role (USER, MODERATOR, ADMIN)

**Note**: In production, replace with proper JWT or session-based authentication.

### Testing

Comprehensive unit tests included for:
- PostService and PostController
- ReportService and ReportController
- All authorization logic
- Error cases and edge cases

Run tests:
```bash
cd test-projects/test-backend
yarn test
```

## Frontend Integration Guide

### RTK Query API Slice (to be implemented)

```typescript
// lib/services/postsApi.ts
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add auth headers
      const user = selectCurrentUser(getState());
      if (user) {
        headers.set('x-user-id', user.id);
        headers.set('x-user-email', user.email);
        headers.set('x-user-role', user.role);
      }
      return headers;
    },
  }),
  tagTypes: ['Post', 'Report'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    createPost: builder.mutation<Post, CreatePostDto>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'],
    }),
    reportPost: builder.mutation<Report, CreateReportDto>({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report'],
    }),
    getReports: builder.query<Report[], void>({
      query: () => '/reports/pending',
      providesTags: ['Report'],
    }),
    approveReport: builder.mutation<Report, number>({
      query: (id) => ({
        url: `/reports/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Report', 'Post'],
    }),
    // ... more endpoints
  }),
});
```

### Component Structure (to be implemented)

Following atomic design:

**Atoms:**
- ReportButton: Button to report a post
- ModerationBadge: Badge showing post status

**Molecules:**
- PostCard: Display post with actions
- ReportForm: Form to submit a report

**Organisms:**
- PostList: List of posts with role-based actions
- ModerationDashboard: Dashboard for moderators/admins
- ReportList: List of reported posts

**Templates:**
- PostsPage: Page layout for posts
- ModerationPage: Page layout for moderation

### Role-Based Rendering

```typescript
// components/organisms/PostCard.tsx
export const PostCard = ({ post, currentUser }) => {
  const isOwner = post.authorId === currentUser.id;
  const canModerate = ['MODERATOR', 'ADMIN'].includes(currentUser.role);
  const canReport = !isOwner && currentUser.role !== null;

  return (
    <Card>
      <PostContent post={post} />

      {isOwner && (
        <div>
          <Button onClick={() => handleEdit(post.id)}>Edit</Button>
          <Button onClick={() => handleDelete(post.id)}>Delete</Button>
        </div>
      )}

      {canReport && (
        <ReportButton postId={post.id} />
      )}

      {canModerate && post._count.reports > 0 && (
        <ModerationBadge count={post._count.reports} />
      )}
    </Card>
  );
};
```

### Moderation Dashboard (to be implemented)

```typescript
// app/moderation/page.tsx
'use client';

import { useGetReportsQuery } from '@/lib/services/postsApi';
import { ReportList, ModerationActions } from '@/components/organisms';

export default function ModerationPage() {
  const { data: reports, isLoading } = useGetReportsQuery();

  if (isLoading) return <LoadingState />;

  return (
    <PageLayout>
      <PageHeader title="Moderation Dashboard" />
      <ReportList reports={reports} />
    </PageLayout>
  );
}
```

## Database Migration

To apply the schema changes:

```bash
cd test-projects/test-backend

# Generate Prisma Client
yarn prisma generate

# Create and apply migration
yarn prisma migrate dev --name add-posts-roles-reports-moderation

# Or use db push for development
yarn prisma db push
```

## Usage Examples

### Creating a Post

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-user-email: user@example.com" \
  -H "x-user-role: USER" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post"
  }'
```

### Reporting a Post

```bash
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -H "x-user-email: reporter@example.com" \
  -H "x-user-role: USER" \
  -d '{
    "postId": 1,
    "reason": "This post contains spam"
  }'
```

### Approving a Report (Moderator)

```bash
curl -X PATCH http://localhost:3000/reports/1/approve \
  -H "x-user-id: 3" \
  -H "x-user-email: moderator@example.com" \
  -H "x-user-role: MODERATOR"
```

### Assigning Moderator Role (Admin)

```bash
curl -X PATCH http://localhost:3000/users/2/role \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: ADMIN" \
  -d '{
    "role": "MODERATOR"
  }'
```

## Next Steps

### Backend (Completed)
- ✅ Database schema with Post, Report, ModerationLog
- ✅ Role-based guards and decorators
- ✅ Post CRUD with ownership checks
- ✅ Report system with moderation workflow
- ✅ Moderation logging
- ✅ Unit tests for services and controllers

### Frontend (To Be Implemented)
- [ ] RTK Query API slices for posts, reports
- [ ] Post list and detail components
- [ ] Report modal/form component
- [ ] Moderation dashboard for moderators/admins
- [ ] Role-based conditional rendering
- [ ] Unit tests for components and hooks

### Additional Enhancements
- [ ] Real authentication system (JWT/OAuth)
- [ ] Email notifications for moderation actions
- [ ] Soft delete for posts
- [ ] Post edit history
- [ ] Appeal system for rejected reports
- [ ] Admin dashboard with analytics
- [ ] Rate limiting for report submissions
- [ ] Bulk moderation actions

## Security Considerations

1. **Production Authentication**: Replace header-based auth with JWT or session-based authentication
2. **Input Validation**: Add DTOs with class-validator decorators
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **CORS**: Configure proper CORS settings
5. **SQL Injection**: Prisma protects against SQL injection by default
6. **XSS Protection**: Sanitize user input on frontend
7. **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Conclusion

This implementation provides a solid foundation for a role-based post moderation and reporting system with proper authorization, audit logging, and comprehensive test coverage. The backend is fully functional and ready for frontend integration.
