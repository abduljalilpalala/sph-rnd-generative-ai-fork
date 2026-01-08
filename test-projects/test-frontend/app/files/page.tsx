"use client";

import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/templates";
import { FileGallery, FileUploader } from "@/components/organisms";
import { Button, Card } from "@/components/atoms";
import { useFiles } from "@/hooks/useFiles";

export default function FilesPage() {
  const [showUploader, setShowUploader] = useState(false);
  const [userId] = useState(1);

  const { files, isLoading, handleDelete, isDeleting } = useFiles({ userId });
  const [deletingId, setDeletingId] = useState<number | undefined>();

  const handleDeleteFile = async (id: number) => {
    setDeletingId(id);
    try {
      await handleDelete(id, userId);
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleDownload = async (id: number) => {
    const file = files?.find((f) => f.id === id);
    if (file) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/files/${id}/download-url`
        );
        const data = await response.json();
        window.open(data.url, "_blank");
      } catch (error) {
        console.error("Failed to download file:", error);
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="File Management"
        subtitle="Upload and manage your files"
        actions={
          <Button onClick={() => setShowUploader(!showUploader)}>
            {showUploader ? "Hide Uploader" : "Upload Files"}
          </Button>
        }
      />

      <div className="space-y-6">
        {showUploader && (
          <Card>
            <FileUploader
              userId={userId}
              onUploadComplete={() => setShowUploader(false)}
            />
          </Card>
        )}

        <FileGallery
          files={files}
          isLoading={isLoading}
          onDelete={handleDeleteFile}
          onDownload={handleDownload}
          deletingId={deletingId}
        />
      </div>
    </PageLayout>
  );
}
