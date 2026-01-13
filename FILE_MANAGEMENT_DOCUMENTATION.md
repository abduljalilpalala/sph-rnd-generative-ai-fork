# File Management System Documentation

## Overview

This standalone file management system allows users to upload, manage, view, and delete files (images and documents) with full LocalStack S3 integration. The system is designed to be completely independent from other features in the application.

## Architecture

### Backend (NestJS + Prisma + LocalStack S3)
- **Location**: `test-projects/test-backend/src/file/`
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: LocalStack S3 (AWS S3-compatible local emulator)

### Frontend (Next.js + RTK Query + Tailwind CSS)
- **Location**: `test-projects/test-frontend/components/organisms/FileManagementPane.tsx`
- **UI Pattern**: Content pane (no page routing - updates only the main content area)
- **Design**: Google Drive-inspired interface

---

## Database Schema

### File Model
```prisma
model File {
  id            Int         @id @default(autoincrement())
  originalName  String
  storedName    String      @unique
  s3Key         String      @unique
  s3Bucket      String
  url           String?     // Direct access URL for the file (7-day expiration)
  mimeType      String
  fileType      FileType    // IMAGE | DOCUMENT
  size          Int         // in bytes
  status        FileStatus  @default(PENDING)
  uploadedById  Int
  uploadedBy    User        @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
  metadata      Json?
  errorMessage  String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([uploadedById])
  @@index([fileType])
  @@index([status])
}
```

**Note**: This model is independent - no relations to `Project` or `Task` models.

---

## Accessing Files in Containers

### LocalStack S3 Container

#### 1. Container Access
```bash
# Enter the LocalStack container
docker exec -it rnd-localstack sh

# OR use docker compose
cd test-projects/test-backend
docker compose exec localstack sh
```

#### 2. Using AWS CLI inside container
```bash
# List all buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# List files in the bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://local-files/

# List files for a specific user
aws --endpoint-url=http://localhost:4566 s3 ls s3://local-files/uploads/1/

# Download a file
aws --endpoint-url=http://localhost:4566 s3 cp s3://local-files/uploads/1/filename.jpg ./
```

#### 3. Direct File System Access
LocalStack stores files in `/var/lib/localstack/state` within the container:

```bash
# Navigate to storage directory
cd /var/lib/localstack/state

# Find your files
find . -name "*.jpg" -o -name "*.pdf"
```

### Backend Container (NestJS)

#### 1. Container Access
```bash
# If running in Docker
docker exec -it rnd-backend sh

# Navigate to project directory
cd /app
```

#### 2. Query Files via Prisma
```bash
# Start Node.js REPL
node

# In the REPL:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all files
prisma.file.findMany().then(console.log);

// Get files by user
prisma.file.findMany({ where: { uploadedById: 1 } }).then(console.log);

// Get file with full details
prisma.file.findUnique({
  where: { id: 1 },
  include: { uploadedBy: true }
}).then(console.log);
```

---

## API Endpoints

### Base URL
- Development: `http://localhost:3000/files`

### Endpoints

#### 1. Upload Single File
```http
POST /files/upload
Content-Type: multipart/form-data

Body:
- file: <binary>
- userId: <number>
```

#### 2. Upload Batch Files (up to 1000)
```http
POST /files/upload/batch
Content-Type: multipart/form-data

Body:
- files: <array of binaries>
- userId: <number>
```

#### 3. Get Files with Filters
```http
GET /files?userId=1&fileType=IMAGE&search=avatar&sortBy=date&sortOrder=desc&limit=12&offset=0
```

Query Parameters:
- `userId` (optional): Filter by user ID
- `fileType` (optional): `IMAGE` | `DOCUMENT`
- `search` (optional): Search in file names
- `sortBy` (optional): `name` | `date` | `size`
- `sortOrder` (optional): `asc` | `desc`
- `limit` (optional): Items per page (default: 100)
- `offset` (optional): Skip items (default: 0)

#### 4. Get File by ID
```http
GET /files/:id
```

#### 5. Get Download URL
```http
GET /files/:id/download-url

Response:
{
  "url": "https://...",
  "expiresIn": 3600
}
```

#### 6. Delete File
```http
DELETE /files/:id?userId=1
```

#### 7. Batch Delete
```http
DELETE /files/batch
Content-Type: application/json

Body:
{
  "fileIds": [1, 2, 3],
  "userId": 1
}
```

---

## Frontend Usage

### Accessing File Management

The File Management feature is accessed via the **sidebar** in the main dashboard. It does **NOT** navigate to a new page - instead, it updates only the right content pane.

#### Integration Example
```typescript
// In app/page.tsx
import { FileManagementPane } from "@/components/organisms";

const [activeSection, setActiveSection] = useState<string>("");

// Sidebar callback
const renderContent = () => {
  switch (activeSection) {
    case "files":
      return <FileManagementPane />;
    default:
      return <DashboardContent />;
  }
};
```

### Features Available

1. **Upload**
   - Single or batch upload (up to 1000 files)
   - Drag-and-drop support
   - Real-time progress tracking
   - File type validation (images and documents)

2. **Pagination**
   - Choose: 6, 12, or 18 items per page
   - Previous/Next navigation
   - Results counter

3. **Search**
   - Real-time search by file name
   - Case-insensitive

4. **Filtering**
   - Filter by type: All, Images, Documents

5. **Sorting**
   - Sort by: Name, Date, Size
   - Order: Ascending or Descending

6. **Preview**
   - Hover over images to see preview indicator
   - Click to open full-screen modal
   - Image zoom and view
   - Download from preview modal

7. **Actions**
   - Download files with signed URLs
   - Delete with confirmation prompt
   - Metadata display (size, date, type)

---

## File Storage Details

### LocalStack S3 Configuration

**Bucket Structure:**
```
local-files/
└── uploads/
    └── {userId}/
        ├── {uuid}.jpg
        ├── {uuid}.pdf
        └── ...
```

**Environment Variables (test-projects/test-backend/.env):**
```bash
S3_BUCKET=local-files
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_FORCE_PATH_STYLE=true
```

### Signed URLs
- Generated for downloads and previews
- Default expiration: 1 hour (3600 seconds)
- Stored URL expiration: 7 days (604800 seconds)

### File Metadata
Each file includes:
- Original filename
- Stored filename (UUID + extension)
- S3 key (full path in bucket)
- MIME type
- File size (bytes)
- Upload status (PENDING | UPLOADING | COMPLETED | FAILED)
- Upload timestamp
- Uploader information

---

## Development

### Setup

1. **Start Database and LocalStack:**
```bash
cd test-projects/test-backend
docker compose up -d
```

2. **Initialize LocalStack S3:**
```bash
bash scripts/init-localstack.sh
```

3. **Run Database Migration:**
```bash
yarn prisma migrate dev
```

4. **Start Backend:**
```bash
yarn start:dev
```

5. **Start Frontend:**
```bash
cd ../test-frontend
yarn dev
```

### Testing File Upload

#### Using cURL:
```bash
# Upload single file
curl -X POST http://localhost:3000/files/upload \
  -F "file=@/path/to/image.jpg" \
  -F "userId=1"

# Get files
curl "http://localhost:3000/files?userId=1"

# Download URL
curl http://localhost:3000/files/1/download-url
```

#### Using Postman:
1. Set request to `POST http://localhost:3000/files/upload`
2. Body → form-data
3. Add key `file` with type `File`
4. Add key `userId` with value `1`
5. Send

---

## Troubleshooting

### Files Not Appearing

**Check LocalStack:**
```bash
# Verify bucket exists
aws --endpoint-url=http://localhost:4566 s3 ls

# Verify files in bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://local-files/uploads/1/
```

**Check Database:**
```bash
cd test-projects/test-backend
yarn prisma studio
# Browse File model
```

### Cannot Download Files

**Issue**: Signed URLs expired
**Solution**: The `url` field in database expires after 7 days. The backend regenerates URLs on-demand via `/files/:id/download-url` endpoint.

### LocalStack Not Ready

**Issue**: Init script keeps retrying
**Solution**: Check LocalStack logs:
```bash
docker compose logs localstack
```

Wait for:
```
Ready.
```

Then run init script:
```bash
bash scripts/init-localstack.sh
```

---

## Migration from LocalStack to AWS S3

When ready for production:

1. **Update Environment Variables:**
```bash
# Remove local endpoint
S3_ENDPOINT=  # Leave empty for real AWS S3
S3_BUCKET=your-production-bucket
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_FORCE_PATH_STYLE=false
```

2. **Create S3 Bucket in AWS:**
```bash
aws s3 mb s3://your-production-bucket --region us-east-1
```

3. **Set Bucket Policy (Optional):**
Configure CORS, lifecycle policies, and permissions as needed.

4. **Deploy and Test:**
The application will automatically use AWS S3 when `S3_ENDPOINT` is not set.

---

## Security Considerations

1. **File Validation**: Validate file types and sizes on upload
2. **Access Control**: Files are scoped to users (userId)
3. **Signed URLs**: Temporary access to files (1-hour expiration)
4. **Delete Authorization**: Users can only delete their own files
5. **CORS**: Configure properly for browser uploads

---

## Performance

### Optimization Tips
- **Pagination**: Default 12 items per page reduces load
- **Lazy Loading**: Only load visible images
- **Signed URL Caching**: Store URLs for 7 days to reduce S3 calls
- **Batch Operations**: Process up to 50 files concurrently
- **Database Indexes**: On `uploadedById`, `fileType`, and `status`

---

## Additional Resources

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)

---

**Last Updated**: 2026-01-08
