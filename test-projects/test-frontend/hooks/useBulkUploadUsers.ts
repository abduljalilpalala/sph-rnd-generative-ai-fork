import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBulkUploadUsersMutation,
  BulkUploadResponse,
} from "@/lib/services/userApi";

export const useBulkUploadUsers = () => {
  const router = useRouter();
  const [bulkUpload, { isLoading }] = useBulkUploadUsersMutation();
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await bulkUpload(formData).unwrap();
      setUploadResult(result);

      // If all users were created successfully, redirect after a delay
      if (result.success && result.failed === 0) {
        setTimeout(() => {
          router.push("/users");
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.data?.message || "Failed to upload file. Please try again.");
    }
  };

  const reset = () => {
    setUploadResult(null);
    setError(null);
  };

  return {
    handleUpload,
    isLoading,
    uploadResult,
    error,
    reset,
  };
};
