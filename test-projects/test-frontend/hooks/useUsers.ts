import { useState } from "react";
import { useGetUsersQuery, useDeleteUserMutation } from "@/lib/services/userApi";

export const useUsers = () => {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteModal = (id: number) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (userToDelete === null) return;

    try {
      await deleteUser(userToDelete).unwrap();
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Failed to delete user. Please try again.");
    }
  };

  return {
    users,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    userToDelete,
    deleteError,
    isDeleting,
  };
};
