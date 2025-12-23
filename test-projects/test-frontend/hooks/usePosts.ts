import { useState } from "react";
import {
  useGetPostsQuery,
  useDeletePostMutation,
} from "@/lib/services/postApi";

export const usePosts = () => {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteModal = (id: number) => {
    setPostToDelete(id);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (postToDelete === null) return;

    try {
      await deletePost(postToDelete).unwrap();
      closeDeleteModal();
    } catch (err) {
      setDeleteError("Failed to delete post. Please try again.");
    }
  };

  return {
    posts,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    postToDelete,
    deleteError,
    isDeleting,
  };
};
