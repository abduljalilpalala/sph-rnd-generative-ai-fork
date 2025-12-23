import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateRoleMutation } from "@/lib/services/roleApi";

export const useUpdateRole = (roleId: number) => {
  const router = useRouter();
  const [updateRole, { isLoading }] = useUpdateRoleMutation();
  const [error, setError] = useState("");

  const handleUpdate = async (name: string, description?: string) => {
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      await updateRole({ id: roleId, data: { name, description } }).unwrap();
      router.push(`/roles/${roleId}`);
    } catch (err) {
      setError("Failed to update role. Please try again.");
    }
  };

  return {
    handleUpdate,
    isLoading,
    error,
    setError,
  };
};
