import { useGetRoleQuery } from "@/lib/services/roleApi";

export const useRole = (roleId: number) => {
  const { data: role, isLoading, error } = useGetRoleQuery(roleId);

  return {
    role,
    isLoading,
    error,
  };
};
