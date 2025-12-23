"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRoles } from "@/hooks/useRoles";
import { RoleList, Sidebar, TopNavigation } from "@/components/organisms";
import { ConfirmModal } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const RolesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const {
    roles,
    isLoading,
    error,
    openDeleteModal,
    confirmDelete,
    closeDeleteModal,
    deleteModalOpen,
    deleteError,
    isDeleting,
  } = useRoles();

  // Pagination logic
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return roles?.slice(startIndex, endIndex);
  }, [roles, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil((roles?.length || 0) / itemsPerPage);
  }, [roles, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Role Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Roles</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage roles and permissions
                </p>
              </div>
              <Link
                href="/roles/create"
                className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
              >
                Create Role
              </Link>
            </div>

            {/* Content */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading roles...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Error loading roles</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <RoleList roles={paginatedRoles} onDelete={openDeleteModal} />

                {/* Pagination Controls */}
                {roles && roles.length > 0 && (
                  <div className="mt-4 flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">
                        entries (Total: {roles.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
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

export default RolesPage;
