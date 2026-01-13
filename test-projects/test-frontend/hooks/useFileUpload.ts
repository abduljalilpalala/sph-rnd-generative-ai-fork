import { useState, useCallback } from "react";
import { useUploadFileMutation } from "@/lib/services/fileApi";

export const useFileUpload = () => {
  const [uploadFile, { isLoading, error }] = useUploadFileMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File, metadata: { userId: number; projectId?: number; taskId?: number }) => {
      try {
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", metadata.userId.toString());
        if (metadata.projectId) formData.append("projectId", metadata.projectId.toString());
        if (metadata.taskId) formData.append("taskId", metadata.taskId.toString());

        setUploadProgress(50);
        const result = await uploadFile(formData).unwrap();
        setUploadProgress(100);

        return result;
      } catch (error) {
        setUploadProgress(0);
        throw error;
      }
    },
    [uploadFile]
  );

  return {
    handleUpload,
    isLoading,
    error,
    uploadProgress,
  };
};
