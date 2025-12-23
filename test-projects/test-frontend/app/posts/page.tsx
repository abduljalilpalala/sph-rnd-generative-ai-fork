"use client";

import { usePosts } from "@/hooks/usePosts";
import { PostList } from "@/components/organisms";
import {
  LoadingState,
  ErrorState,
  PageHeader,
  PageLayout,
} from "@/components/templates";
import { ConfirmModal } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const PostsPage = () => {
  const {
    posts,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    deleteError,
    isDeleting,
  } = usePosts();

  if (isLoading) return <LoadingState message="Loading posts..." />;
  if (error) return <ErrorState message="Error loading posts" />;

  return (
    <PageLayout>
      <PageHeader
        title="Posts"
        actions={[
          { href: "/posts/create", label: "Create Post", variant: "success" },
          { href: "/", label: "Home", variant: "secondary" },
        ]}
      />
      <PostList posts={posts} onDelete={openDeleteModal} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isLoading={isDeleting}
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </PageLayout>
  );
};

export default PostsPage;
