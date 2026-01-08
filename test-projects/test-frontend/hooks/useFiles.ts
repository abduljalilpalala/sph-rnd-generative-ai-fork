import { useGetFilesQuery, useDeleteFileMutation, FileQueryParams } from "@/lib/services/fileApi";

export const useFiles = (params: FileQueryParams) => {
  const { data: files, isLoading, error } = useGetFilesQuery(params);
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  const handleDelete = async (id: number, userId: number) => {
    try {
      await deleteFile({ id, userId }).unwrap();
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  };

  return {
    files,
    isLoading,
    error,
    handleDelete,
    isDeleting,
  };
};
