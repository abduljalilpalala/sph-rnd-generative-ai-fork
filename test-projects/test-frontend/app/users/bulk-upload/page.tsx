"use client";

import { useBulkUploadUsers } from "@/hooks/useBulkUploadUsers";
import { BulkUploadForm } from "@/components/organisms";
import { PageLayout, PageHeader } from "@/components/templates";

export default function BulkUploadPage() {
  const { handleUpload, isLoading, uploadResult, error, reset } =
    useBulkUploadUsers();

  return (
    <PageLayout>
      <PageHeader
        title="Bulk User Upload"
        actions={[
          { href: "/users", label: "← Back to Users", variant: "secondary" },
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
