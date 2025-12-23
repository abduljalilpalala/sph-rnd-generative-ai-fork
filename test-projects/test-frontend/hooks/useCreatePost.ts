import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePostMutation } from "@/lib/services/postApi";

export const useCreatePost = () => {
  const router = useRouter();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [error, setError] = useState("");

  const handleCreate = async (title: string, content: string, published?: boolean) => {
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
      await createPost({ title, content, published }).unwrap();
      router.push("/posts");
    } catch (err) {
      setError("Failed to create post. Please try again.");
    }
  };

  return {
    handleCreate,
    isLoading,
    error,
    setError,
  };
};
