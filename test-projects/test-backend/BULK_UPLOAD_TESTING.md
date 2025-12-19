# Bulk Upload Testing Guide

This guide explains how to test the optimized bulk user upload feature that can handle 1000+ entries without lag.

## Generating Test Data

A script is provided to generate Excel files with test data:

### Quick Start

```bash
cd test-projects/test-backend

# Generate default file (1000 users)
yarn generate:test-excel

# Or generate to a specific location
node scripts/generate-test-excel.js ./path/to/output.xlsx
```

This will create an Excel file with:
- 1000 unique user entries
- Realistic names and emails
- Proper format (email, name columns)
- Ready for bulk upload testing

### Generated File Details

- **Location**: `test-projects/test-backend/test-users-1000.xlsx` (default)
- **Entries**: 1000 users
- **Columns**:
  - `email` (required): Unique email addresses
  - `name` (optional): 90% filled, 10% empty (to test optional fields)

## Performance Optimizations

The bulk upload feature has been optimized to handle large datasets efficiently:

### Backend Optimizations (user.service.ts)

1. **Batch Insert**: Uses Prisma's `createMany()` instead of sequential inserts
   - Reduces database round trips from 1000+ to just 2-3 queries
   - Processes in chunks of 500 for very large files

2. **Pre-validation**:
   - Checks for duplicate emails in-file before database operations
   - Single database query to check existing emails
   - Prevents unnecessary transaction overhead

3. **Efficient Error Handling**:
   - Validates all data upfront
   - Reports all errors in a single response
   - Uses `skipDuplicates` option for race condition safety

### Frontend Optimizations (BulkUploadForm.tsx)

1. **Loading Indicators**:
   - Clear progress feedback during upload
   - Prevents user from navigating away during processing
   - Animated spinner with helpful messages

2. **Better UX**:
   - Informative error messages
   - Detailed success/failure reporting
   - File validation before upload

## Performance Benchmarks

Expected performance for 1000 user entries:

| Metric | Before Optimization | After Optimization |
|--------|--------------------|--------------------|
| Database Operations | 1000+ inserts | 2-3 batched inserts |
| Processing Time | ~10-15 seconds | ~1-2 seconds |
| Network Round Trips | 1000+ | ~3 |
| Transaction Size | Per-user | Batched |

## Testing Instructions

### 1. Generate Test File

```bash
cd test-projects/test-backend
yarn generate:test-excel
```

### 2. Start Services

```bash
# From project root
./boot.sh
```

This starts:
- PostgreSQL database
- Backend API (port 3000)
- Frontend app (port 3001)

### 3. Test Bulk Upload

1. Navigate to http://localhost:3001/users
2. Click "Bulk Upload" button
3. Select the generated file: `test-projects/test-backend/test-users-1000.xlsx`
4. Click "Upload and Create Users"
5. Observe:
   - Loading indicator during processing
   - Results showing created/failed counts
   - Any validation errors

### 4. Expected Results

For the generated test file:
- **Success**: All 1000 users created (assuming database is empty)
- **Processing Time**: 1-2 seconds
- **No UI Lag**: Application remains responsive
- **Detailed Report**: Shows created count and any errors

### 5. Testing Edge Cases

**Duplicate Emails in File**:
```bash
# Modify the script to generate some duplicates
# Edit scripts/generate-test-excel.js and adjust the logic
node scripts/generate-test-excel.js ./test-duplicates.xlsx
```

**Existing Users**:
1. Upload the file once (creates 1000 users)
2. Upload the same file again
3. Expected: All 1000 will fail with "Email already exists in database"

**Invalid Emails**:
- Manually edit the generated Excel file
- Change some emails to invalid formats (e.g., "notanemail")
- Expected: Those rows will fail validation

**Large Files (2000+ entries)**:
```javascript
// Edit scripts/generate-test-excel.js
const NUM_USERS = 2000; // Change this line
```

## API Endpoint Details

**Endpoint**: `POST /user/bulk-upload`

**Request**:
- Content-Type: `multipart/form-data`
- Field: `file` (Excel file)

**Response**:
```json
{
  "success": true,
  "message": "Successfully created 1000 user(s)",
  "created": 1000,
  "failed": 0,
  "errors": []
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "No users were created",
  "created": 0,
  "failed": 5,
  "errors": [
    {
      "row": 2,
      "email": "invalid-email",
      "name": "John Doe",
      "error": "Invalid email format"
    }
  ]
}
```

## Troubleshooting

### Issue: Script fails to generate file

**Solution**: Ensure you have the `xlsx` package installed:
```bash
cd test-projects/test-backend
yarn install
```

### Issue: Upload takes too long

**Check**:
- Database connection is healthy
- No other heavy operations running
- Database indices are properly set up on the email column

### Issue: Out of memory errors

**Solution**: The script is configured to process in batches of 500. For extremely large files (10,000+), you may need to:
1. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
2. Further tune the BATCH_SIZE constant in `user.service.ts`

## File Format Requirements

The Excel file must follow this structure:

| email              | name        |
|--------------------|-------------|
| user1@example.com | John Doe    |
| user2@example.com | Jane Smith  |
| ...                | ...         |

**Rules**:
- First row: Column headers (`email`, `name`)
- `email` column: Required, must be valid email format
- `name` column: Optional
- File extensions: `.xlsx` or `.xls`
- Maximum recommended: 10,000 entries per file

## Code References

**Backend**:
- Service: `test-projects/test-backend/src/user/user.service.ts` (lines 42-156)
- Controller: `test-projects/test-backend/src/user/user.controller.ts` (lines 29-35)
- DTO: `test-projects/test-backend/src/user/dto/bulk-upload-response.dto.ts`

**Frontend**:
- Form: `test-projects/test-frontend/components/organisms/BulkUploadForm.tsx`
- Hook: `test-projects/test-frontend/hooks/useBulkUploadUsers.ts`
- API: `test-projects/test-frontend/lib/services/userApi.ts` (bulkUploadUsers mutation)

**Test Generator**:
- Script: `test-projects/test-backend/scripts/generate-test-excel.js`

## Additional Notes

- The optimization maintains full compatibility with the existing API
- Error reporting is comprehensive and user-friendly
- The batch size (500) can be adjusted in `user.service.ts` line 175
- The script generates realistic but fake data suitable for testing only
