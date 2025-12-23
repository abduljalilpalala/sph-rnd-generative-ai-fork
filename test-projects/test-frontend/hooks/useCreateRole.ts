import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateRoleMutation } from "@/lib/services/roleApi";

export const useCreateRole = () => {
  const router = useRouter();
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const [error, setError] = useState("");

  const handleCreate = async (name: string, description?: string) => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      await createRole({ name, description }).unwrap();
      router.push("/roles");
    } catch (err) {
      setError("Failed to create role. Please try again.");
    }
  };

  return {
    handleCreate,
    isLoading,
    error,
    setError,
  };
};
