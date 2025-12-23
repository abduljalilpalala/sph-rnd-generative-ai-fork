import { useGetPostQuery } from "@/lib/services/postApi";

export const usePost = (id: number) => {
  const { data: post, isLoading, error } = useGetPostQuery(id);

  return {
    post,
    isLoading,
    error,
  };
};
