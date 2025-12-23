import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdatePostMutation } from "@/lib/services/postApi";

export const useUpdatePost = (postId: number) => {
  const router = useRouter();
  const [updatePost, { isLoading }] = useUpdatePostMutation();
  const [error, setError] = useState("");

  const handleUpdate = async (title: string, content: string, published?: boolean) => {
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    try {
      await updatePost({ id: postId, data: { title, content, published } }).unwrap();
      router.push(`/posts/${postId}`);
    } catch (err) {
      setError("Failed to update post. Please try again.");
    }
  };

  return {
    handleUpdate,
    isLoading,
    error,
    setError,
  };
};
