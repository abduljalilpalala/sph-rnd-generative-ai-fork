"use client";

import { useState, useEffect, useRef } from "react";
import { FileUploadInput, FileUploadInputRef } from "@/components/molecules/FileUploadInput";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<FileUploadInputRef>(null);
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
      // Don't clear files here - wait for isComplete to become true
    } catch (err) {
      setError("Upload failed. Please try again.");
      // Keep selected files on error so user can retry
    }
  };

  // Clear selected files and trigger refresh after successful upload
  useEffect(() => {
    if (isComplete && !isRefreshing && selectedFiles.length > 0) {
      const clearAndRefresh = async () => {
        setIsRefreshing(true);

        // Call parent callback first to trigger refetch
        if (onUploadComplete) {
          await onUploadComplete();
        }

        // Then clear local state
        setSelectedFiles([]);

        // Clear the file input element
        if (fileInputRef.current) {
          fileInputRef.current.reset();
        }

        // Show "Updating file list..." for a moment
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      };

      clearAndRefresh();
    }
  }, [isComplete, isRefreshing, selectedFiles.length, onUploadComplete]);

  const handleReset = () => {
    setSelectedFiles([]);
    setError(null);
    setIsRefreshing(false);

    // Clear the file input element
    if (fileInputRef.current) {
      fileInputRef.current.reset();
    }

    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Error Alert */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Refreshing Overlay */}
      {isRefreshing && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-base font-semibold text-blue-900">
              Updating file list...
            </span>
          </div>
        </div>
      )}

      {/* File Selection State */}
      {!isUploading && !isComplete && !isRefreshing && (
        <div className="space-y-4">
          <FileUploadInput
            ref={fileInputRef}
            onFilesSelected={handleFilesSelected}
            multiple
            maxFiles={1000}
            disabled={isUploading}
          />

          {selectedFiles.length > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-700">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleUpload} isLoading={isUploading}>
                  Upload Files
                </Button>
                <Button variant="ghost" onClick={() => setSelectedFiles([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress State */}
      {isUploading && progress && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-semibold text-blue-900">Uploading files...</div>
          <ProgressBar progress={progressPercentage} size="lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
              <span className="font-medium text-gray-700">Total:</span>
              <span className="font-semibold text-gray-900">{progress.totalFiles}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-200">
              <span className="font-medium text-green-700">Completed:</span>
              <span className="font-semibold text-green-900">{progress.completed}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-red-200">
              <span className="font-medium text-red-700">Failed:</span>
              <span className="font-semibold text-red-900">{progress.failed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Complete State */}
      {isComplete && progress && !isRefreshing && (
        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <Alert variant="success">
            Upload complete! {progress.completed} of {progress.totalFiles} files uploaded
            successfully.
          </Alert>
          {progress.failed > 0 && (
            <Alert variant="error">{progress.failed} files failed to upload.</Alert>
          )}
          <div className="pt-2">
            <Button onClick={handleReset}>Upload More Files</Button>
          </div>
        </div>
      )}
    </div>
  );
};
