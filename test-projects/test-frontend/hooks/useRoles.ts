import { useState } from "react";
import { useGetRolesQuery, useDeleteRoleMutation } from "@/lib/services/roleApi";

export const useRoles = () => {
  const { data: roles, isLoading, error } = useGetRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteModal = (id: number) => {
    setRoleToDelete(id);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setRoleToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (roleToDelete === null) return;

    try {
      await deleteRole(roleToDelete).unwrap();
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Failed to delete role. Please try again.");
    }
  };

  return {
    roles,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    roleToDelete,
    deleteError,
    isDeleting,
  };
};
