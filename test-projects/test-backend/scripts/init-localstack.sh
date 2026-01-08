#!/bin/bash

set -e

# Configuration
MAX_RETRIES=30
RETRY_COUNT=0
LOCALSTACK_ENDPOINT="http://localhost:4566"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Waiting for LocalStack to be ready...${NC}"

# Wait for LocalStack to be ready with timeout
until curl -sf "${LOCALSTACK_ENDPOINT}/_localstack/health" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: LocalStack failed to become ready after ${MAX_RETRIES} attempts (60 seconds).${NC}"
        echo -e "${RED}Please ensure LocalStack container is running: docker ps | grep localstack${NC}"
        exit 1
    fi

    echo "LocalStack is not ready yet. Retrying in 2 seconds... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Check if S3 service is available
echo -e "${YELLOW}Checking S3 service availability...${NC}"
RETRY_COUNT=0

until curl -sf "${LOCALSTACK_ENDPOINT}/_localstack/health" | grep -qE '"s3":\s*"(available|running)"'; do
    RETRY_COUNT=$((RETRY_COUNT + 1))

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: S3 service failed to become available after ${MAX_RETRIES} attempts.${NC}"
        echo "Health check response:"
        curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health" | jq '.' || curl -s "${LOCALSTACK_ENDPOINT}/_localstack/health"
        exit 1
    fi

    echo "S3 service is not ready yet. Retrying in 2 seconds... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo -e "${GREEN}LocalStack is ready!${NC}"

# Create S3 bucket
BUCKET_NAME=${S3_BUCKET:-local-files}
echo -e "${YELLOW}Creating S3 bucket: $BUCKET_NAME${NC}"

# Check if aws CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed. Please install it first.${NC}"
    echo "Install with: pip install awscli-local awscli"
    exit 1
fi

# Configure AWS CLI for LocalStack (if not already configured)
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export AWS_DEFAULT_REGION=${S3_REGION:-us-east-1}

# Create bucket (ignore error if already exists)
if aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 mb "s3://$BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}Bucket '$BUCKET_NAME' created successfully.${NC}"
else
    echo -e "${YELLOW}Bucket '$BUCKET_NAME' already exists or failed to create.${NC}"
fi

# List buckets to confirm
echo -e "${YELLOW}Available buckets:${NC}"
aws --endpoint-url="${LOCALSTACK_ENDPOINT}" s3 ls

echo -e "${GREEN}LocalStack S3 initialization complete!${NC}"
echo -e "${GREEN}S3 endpoint: ${LOCALSTACK_ENDPOINT}${NC}"
echo -e "${GREEN}Bucket name: ${BUCKET_NAME}${NC}"
