import { useGetFilesQuery, useDeleteFileMutation, FileQueryParams } from "@/lib/services/fileApi";
import { logError, handleError, AppError } from "@/lib/utils/errorHandler";

export const useFiles = (params: FileQueryParams) => {
  const { data: files, isLoading, error, refetch } = useGetFilesQuery(params);
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  const handleDelete = async (id: number, userId: number) => {
    try {
      await deleteFile({ id, userId }).unwrap();
    } catch (error) {
      logError(error, "FileDelete");
      const userMessage = handleError(error, "FileDelete", "Failed to delete file");
      throw new AppError(userMessage, "DELETE_ERROR", undefined, "FileDelete");
    }
  };

  return {
    files,
    isLoading,
    error,
    handleDelete,
    isDeleting,
    refetch,
  };
};
