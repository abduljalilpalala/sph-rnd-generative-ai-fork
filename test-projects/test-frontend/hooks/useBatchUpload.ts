import { useState, useCallback, useEffect } from "react";
import { useUploadBatchMutation, useGetBatchProgressQuery } from "@/lib/services/fileApi";
import { logError, handleError, AppError } from "@/lib/utils/errorHandler";

export const useBatchUpload = () => {
  const [uploadBatch] = useUploadBatchMutation();
  const [batchId, setBatchId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: progress, isLoading: isLoadingProgress } = useGetBatchProgressQuery(
    batchId || "",
    {
      skip: !batchId || !isUploading,
      pollingInterval: 2000,
    }
  );

  const startBatchUpload = useCallback(
    async (files: File[], metadata: { userId: number; projectId?: number; taskId?: number }) => {
      setIsUploading(true);
      setBatchId(null); // Reset previous batch

      const CHUNK_SIZE = 50;
      const chunks: File[][] = [];

      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        chunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      try {
        const formData = new FormData();
        chunks[0].forEach((file) => formData.append("files", file));
        formData.append("userId", metadata.userId.toString());
        if (metadata.projectId) formData.append("projectId", metadata.projectId.toString());
        if (metadata.taskId) formData.append("taskId", metadata.taskId.toString());

        const response = await uploadBatch(formData).unwrap();
        setBatchId(response.batchId);

        for (let i = 1; i < chunks.length; i++) {
          const chunkFormData = new FormData();
          chunks[i].forEach((file) => chunkFormData.append("files", file));
          chunkFormData.append("userId", metadata.userId.toString());
          if (metadata.projectId) chunkFormData.append("projectId", metadata.projectId.toString());
          if (metadata.taskId) chunkFormData.append("taskId", metadata.taskId.toString());

          await uploadBatch(chunkFormData).unwrap();
        }
      } catch (error) {
        logError(error, "BatchUpload");
        setIsUploading(false);
        setBatchId(null);
        const userMessage = handleError(error, "BatchUpload", "Failed to upload files");
        throw new AppError(userMessage, "UPLOAD_ERROR", undefined, "BatchUpload");
      }
    },
    [uploadBatch]
  );

  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.totalFiles) * 100)
    : 0;

  const isComplete = progress
    ? progress.completed + progress.failed === progress.totalFiles
    : false;

  // Properly handle upload completion in useEffect
  useEffect(() => {
    if (isComplete && isUploading) {
      setIsUploading(false);
    }
  }, [isComplete, isUploading]);

  return {
    startBatchUpload,
    isUploading,
    progress,
    progressPercentage,
    isLoadingProgress,
    isComplete,
  };
};
