"use client";

import { useUsers } from "@/hooks/useUsers";
import { UserList } from "@/components/organisms";
import { LoadingState, ErrorState, PageHeader, PageLayout } from "@/components/templates";
import { ConfirmModal } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const UsersPage = () => {
  const {
    users,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    deleteError,
    isDeleting,
  } = useUsers();

  if (isLoading) return <LoadingState message="Loading users..." />;
  if (error) return <ErrorState message="Error loading users" />;

  return (
    <PageLayout>
      <PageHeader
        title="Users"
        actions={[
          { href: "/users/create", label: "Create User", variant: "success" },
          { href: "/users/bulk-upload", label: "Bulk Upload", variant: "primary" },
          { href: "/", label: "Home", variant: "secondary" },
        ]}
      />
      <UserList users={users} onDelete={openDeleteModal} />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
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

export default UsersPage;
