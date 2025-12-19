"use client";

import { useBulkUploadUsers } from "@/hooks/useBulkUploadUsers";
import { BulkUploadForm } from "@/components/organisms";
import { PageLayout, PageHeader } from "@/components/templates";
import { Link } from "@/components/atoms";

export default function BulkUploadPage() {
  const { handleUpload, isLoading, uploadResult, error, reset } =
    useBulkUploadUsers();

  return (
    <PageLayout>
      <PageHeader
        title="Bulk User Upload"
        actions={[
          <Link key="back" href="/users" variant="secondary">
            ← Back to Users
          </Link>,
        ]}
      />
      <BulkUploadForm
        onUpload={handleUpload}
        isLoading={isLoading}
        uploadResult={uploadResult}
        error={error}
        onReset={reset}
      />
    </PageLayout>
  );
}
