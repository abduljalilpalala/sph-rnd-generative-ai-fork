import { useCreateUserMutation } from "@/lib/services/userApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useCreateUser = () => {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [error, setError] = useState("");

  const handleCreate = async (email: string, name?: string) => {
    setError("");

    if (!email) {
      setError("Email is required");
      return false;
    }

    try {
      await createUser({ email, name: name || undefined }).unwrap();
      router.push("/users");
      return true;
    } catch (err) {
      setError("Failed to create user");
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
