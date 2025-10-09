import { useUpdateUserMutation } from "@/lib/services/userApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useUpdateUser = (userId: number) => {
  const router = useRouter();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState("");

  const handleUpdate = async (email: string, name?: string) => {
    setError("");

    if (!email) {
      setError("Email is required");
      return false;
    }

    try {
      await updateUser({
        id: userId,
        data: { email, name: name || undefined },
      }).unwrap();
      router.push(`/users/${userId}`);
      return true;
    } catch (err) {
      setError("Failed to update user");
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
