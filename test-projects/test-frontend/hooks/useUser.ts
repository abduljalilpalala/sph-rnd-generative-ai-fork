import { useGetUserQuery } from "@/lib/services/userApi";

export const useUser = (id: number) => {
  const { data: user, isLoading, error } = useGetUserQuery(id);

  return {
    user,
    isLoading,
    error,
  };
};
