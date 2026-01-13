"use client";

import { FileCard } from "@/components/molecules/FileCard";
import { File } from "@/lib/services/fileApi";
import { EmptyState } from "@/components/molecules";

interface FileGalleryProps {
  files?: File[];
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  isLoading?: boolean;
  deletingId?: number;
}

export const FileGallery = ({
  files,
  onDelete,
  onDownload,
  isLoading,
  deletingId,
}: FileGalleryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return <EmptyState message="No files uploaded yet" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDelete={onDelete}
          onDownload={onDownload}
          isDeleting={deletingId === file.id}
        />
      ))}
    </div>
  );
};
