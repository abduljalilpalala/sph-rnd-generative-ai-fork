#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
    echo "LocalStack is not ready yet. Retrying in 2 seconds..."
    sleep 2
done

echo "LocalStack is ready!"

# Create S3 bucket
BUCKET_NAME=${S3_BUCKET:-local-files}
echo "Creating S3 bucket: $BUCKET_NAME"

aws --endpoint-url=http://localhost:4566 s3 mb s3://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# List buckets to confirm
echo "Available buckets:"
aws --endpoint-url=http://localhost:4566 s3 ls

echo "LocalStack S3 initialization complete!"
