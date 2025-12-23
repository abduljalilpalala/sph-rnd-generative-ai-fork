"use client";

import { useState } from "react";
import Link from "next/link";
import { useUsers } from "@/hooks/useUsers";
import { UserList, Sidebar, TopNavigation } from "@/components/organisms";
import { ConfirmModal } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const UsersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="User Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage system users and their information
                </p>
              </div>
              <Link
                href="/users/create"
                className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
              >
                Create User
              </Link>
            </div>

            {/* Content */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Error loading users</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            )}

            {!isLoading && !error && <UserList users={users} onDelete={openDeleteModal} />}
          </div>
        </main>
      </div>

      {/* Modals */}
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
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
