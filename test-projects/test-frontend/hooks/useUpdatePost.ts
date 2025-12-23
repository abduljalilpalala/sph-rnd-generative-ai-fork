import { useUpdatePostMutation } from "@/lib/services/postApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useUpdatePost = (postId: number) => {
  const router = useRouter();
  const [updatePost, { isLoading }] = useUpdatePostMutation();
  const [error, setError] = useState("");

  const handleUpdate = async (title: string, content?: string) => {
    setError("");

    if (!title) {
      setError("Title is required");
      return false;
    }

    try {
      await updatePost({
        id: postId,
        data: { title, content: content || undefined },
      }).unwrap();
      router.push(`/posts/${postId}`);
      return true;
    } catch (err) {
      setError("Failed to update post");
      return false;
    }
  };

  return {
    handleUpdate,
    isLoading,
    error,
    setError,
  };
};
