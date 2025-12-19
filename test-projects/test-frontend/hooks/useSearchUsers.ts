import { useState } from "react";
import { useSearchUsersQuery } from "@/lib/services/userApi";

export const useSearchUsers = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useSearchUsersQuery({
    name: name || undefined,
    email: email || undefined,
    page,
    limit,
  });

  const handleSearch = (searchName: string, searchEmail: string) => {
    setName(searchName);
    setEmail(searchEmail);
    setPage(1); // Reset to first page on new search
  };

  const handleNextPage = () => {
    if (data && page < Math.ceil(data.total / limit)) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const hasNextPage = data ? page < totalPages : false;
  const hasPreviousPage = page > 1;

  return {
    users: data?.data || [],
    total: data?.total || 0,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleSearch,
    handleNextPage,
    handlePreviousPage,
  };
};
