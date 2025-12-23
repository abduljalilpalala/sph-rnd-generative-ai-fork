import { useCreatePostMutation } from "@/lib/services/postApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useCreatePost = () => {
  const router = useRouter();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [error, setError] = useState("");

  const handleCreate = async (title: string, content?: string) => {
    setError("");

    if (!title) {
      setError("Title is required");
      return false;
    }

    try {
      await createPost({ title, content: content || undefined }).unwrap();
      router.push("/posts");
      return true;
    } catch (err) {
      setError("Failed to create post");
      return false;
    }
  };

  return {
    handleCreate,
    isLoading,
    error,
    setError,
  };
};
