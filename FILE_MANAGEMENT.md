# File Management Feature Documentation

## Overview

A full-stack file management system with LocalStack S3 integration, supporting image and document uploads with batch processing capabilities.

## Features

- **File Upload**: Single and batch upload (up to 1000 files)
- **File Types**: Images (jpg, png, gif) and Documents (pdf, doc, docx, txt)
- **Size Limit**: 10MB per file
- **Storage**: LocalStack S3 (AWS S3 compatible)
- **Progress Tracking**: Real-time upload progress for batch operations
- **File Operations**: Upload, Download, Delete, List
- **Drag & Drop**: Intuitive drag-and-drop file upload interface

## Architecture

### Backend (NestJS + Prisma + PostgreSQL)

**Database Schema:**
- `File` model tracks file metadata in PostgreSQL
- `FileType` enum: IMAGE, DOCUMENT
- `FileStatus` enum: PENDING, UPLOADING, COMPLETED, FAILED
- Relationships to User, Project, and Task models

**Storage Layer:**
- `S3StorageService`: AWS S3 implementation with LocalStack support
- Abstract `IStorageService` interface for future storage providers
- Batch upload with concurrency control (10 concurrent uploads)
- Signed URLs for secure file downloads

**API Endpoints:**
- `POST /files/upload` - Single file upload
- `POST /files/upload/batch` - Batch upload (up to 1000 files)
- `GET /files` - List files with filters
- `GET /files/:id` - Get file metadata
- `GET /files/:id/download-url` - Get signed download URL
- `DELETE /files/:id` - Delete file
- `DELETE /files/batch` - Batch delete
- `GET /files/batch/:batchId/progress` - Track batch progress

### Frontend (Next.js + RTK Query + Tailwind CSS)

**State Management:**
- RTK Query for API calls and caching
- Custom hooks for business logic
- Real-time progress tracking with polling

**Components (Atomic Design):**
- **Atoms**: FileIcon, ProgressBar, FileSize
- **Molecules**: FileCard, FileUploadInput
- **Organisms**: FileGallery, FileUploader
- **Pages**: `/files` - File management page

**Custom Hooks:**
- `useFiles` - Fetch and delete files
- `useFileUpload` - Single file upload
- `useBatchUpload` - Batch upload with progress tracking

## Setup Instructions

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Yarn or NPM

### Backend Setup

1. **Start services:**
   ```bash
   cd test-projects/test-backend
   docker compose up -d
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Run database migration:**
   ```bash
   yarn prisma migrate dev --name add-file-management
   ```

5. **Initialize LocalStack S3 bucket:**
   ```bash
   bash scripts/init-localstack.sh
   ```

6. **Start backend server:**
   ```bash
   yarn start:dev
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd test-projects/test-frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
   ```

4. **Start development server:**
   ```bash
   yarn dev
   ```

5. **Access file management:**
   Open browser to `http://localhost:3001/files`

## Usage

### Uploading Files

1. Navigate to `/files`
2. Click "Upload Files" button
3. Drag and drop files or click "Choose files"
4. Click "Upload Files" to start upload
5. Monitor progress for batch uploads

### Downloading Files

1. Click "Download" button on any file card
2. File will open in new tab with signed URL

### Deleting Files

1. Click "Delete" button on any file card
2. File will be removed from S3 and database

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rnd"

# S3/LocalStack Configuration
S3_BUCKET=local-files
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES_PER_BATCH=1000
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Switching to Production AWS S3

To use real AWS S3 instead of LocalStack:

1. **Update backend environment variables:**
   ```bash
   S3_BUCKET=your-production-bucket
   S3_REGION=us-east-1
   S3_ENDPOINT=  # Leave empty for real AWS S3
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   ```

2. **Create S3 bucket in AWS Console**

3. **Configure IAM permissions** for S3 operations

4. **No code changes required** - storage service is fully compatible

## Testing

### Backend Tests

```bash
cd test-projects/test-backend
yarn test
```

### Frontend Tests

```bash
cd test-projects/test-frontend
yarn test
```

## File Structure

### Backend

```
test-projects/test-backend/src/
├── file/
│   ├── dto/
│   │   ├── file-query.dto.ts
│   │   ├── upload-metadata.dto.ts
│   │   └── batch-delete.dto.ts
│   ├── file.controller.ts
│   ├── file.service.ts
│   └── file.module.ts
└── storage/
    ├── interfaces/
    │   └── storage.interface.ts
    ├── s3-storage.service.ts
    └── storage.module.ts
```

### Frontend

```
test-projects/test-frontend/
├── app/files/
│   └── page.tsx
├── components/
│   ├── atoms/
│   │   ├── FileIcon.tsx
│   │   ├── ProgressBar.tsx
│   │   └── FileSize.tsx
│   ├── molecules/
│   │   ├── FileCard.tsx
│   │   └── FileUploadInput.tsx
│   └── organisms/
│       ├── FileGallery.tsx
│       └── FileUploader.tsx
├── hooks/
│   ├── useFiles.ts
│   ├── useFileUpload.ts
│   └── useBatchUpload.ts
└── lib/services/
    └── fileApi.ts
```

## Performance Considerations

### Batch Upload Strategy

- Frontend splits files into chunks of 50
- Backend processes batches with concurrency limit of 10
- Progress tracked in memory (can be moved to Redis for production)
- Polling interval: 2 seconds

### Optimization Tips

1. **Large Files**: Consider implementing chunked uploads for files > 10MB
2. **Many Files**: Batch progress cache should use Redis for multi-instance deployments
3. **Image Thumbnails**: Generate thumbnails asynchronously after upload
4. **Pagination**: Implement pagination for file listings with many files

## Security Considerations

1. **File Validation**: MIME type and extension validation
2. **Size Limits**: 10MB per file, 1000 files per batch
3. **Authorization**: Users can only access/delete their own files
4. **Signed URLs**: Temporary access (1 hour expiration)
5. **Input Sanitization**: Filename sanitization to prevent path traversal

## Troubleshooting

### LocalStack Not Starting

```bash
docker compose down
docker compose up -d localstack
docker logs rnd-localstack
```

### S3 Bucket Not Created

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://local-files
```

### Files Not Uploading

1. Check LocalStack is running: `curl http://localhost:4566/_localstack/health`
2. Verify environment variables in backend
3. Check backend logs for errors
4. Verify file size is under 10MB

### Frontend Build Errors

```bash
cd test-projects/test-frontend
rm -rf .next node_modules
yarn install
yarn dev
```

## Future Enhancements

- [ ] Folder organization
- [ ] File sharing with permissions
- [ ] User storage quotas
- [ ] Image thumbnail generation
- [ ] File versioning
- [ ] Resumable uploads for large files
- [ ] WebSocket for real-time progress (alternative to polling)
- [ ] File search and filtering
- [ ] Bulk operations UI
- [ ] File preview modal

## Support

For issues or questions, please refer to:
- [Backend Guidelines](CLAUDE-BE.md)
- [Frontend Guidelines](CLAUDE-FE.md)
- [Main Project Guidelines](CLAUDE.md)
