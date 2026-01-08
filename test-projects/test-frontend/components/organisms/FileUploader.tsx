"use client";

import { useState } from "react";
import { FileUploadInput } from "@/components/molecules/FileUploadInput";
import { Button, ProgressBar, Alert } from "@/components/atoms";
import { useBatchUpload } from "@/hooks/useBatchUpload";

interface FileUploaderProps {
  userId: number;
  projectId?: number;
  taskId?: number;
  onUploadComplete?: () => void;
}

export const FileUploader = ({
  userId,
  projectId,
  taskId,
  onUploadComplete,
}: FileUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { startBatchUpload, isUploading, progress, progressPercentage, isComplete } =
    useBatchUpload();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select files to upload");
      return;
    }

    try {
      await startBatchUpload(selectedFiles, { userId, projectId, taskId });
    } catch (err) {
      setError("Upload failed. Please try again.");
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setError(null);
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      {!isUploading && !isComplete && (
        <>
          <FileUploadInput
            onFilesSelected={handleFilesSelected}
            multiple
            maxFiles={1000}
            disabled={isUploading}
          />

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload} isLoading={isUploading}>
                  Upload Files
                </Button>
                <Button variant="ghost" onClick={() => setSelectedFiles([])}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isUploading && progress && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-900">Uploading files...</div>
          <ProgressBar progress={progressPercentage} size="lg" />
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total:</span> {progress.totalFiles}
            </div>
            <div>
              <span className="font-medium text-green-600">Completed:</span> {progress.completed}
            </div>
            <div>
              <span className="font-medium text-red-600">Failed:</span> {progress.failed}
            </div>
          </div>
        </div>
      )}

      {isComplete && progress && (
        <div className="space-y-4">
          <Alert variant="success">
            Upload complete! {progress.completed} of {progress.totalFiles} files uploaded
            successfully.
          </Alert>
          {progress.failed > 0 && (
            <Alert variant="error">{progress.failed} files failed to upload.</Alert>
          )}
          <Button onClick={handleReset}>Upload More Files</Button>
        </div>
      )}
    </div>
  );
};
