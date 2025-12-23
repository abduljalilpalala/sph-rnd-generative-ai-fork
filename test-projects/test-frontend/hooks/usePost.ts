import { useGetPostQuery } from "@/lib/services/postApi";

export const usePost = (postId: number) => {
  const { data: post, isLoading, error } = useGetPostQuery(postId);

  return {
    post,
    isLoading,
    error,
  };
};
