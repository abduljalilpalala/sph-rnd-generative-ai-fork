"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePosts } from "@/hooks/usePosts";
import { PostList, Sidebar, TopNavigation } from "@/components/organisms";
import { ConfirmModal } from "@/components/molecules";
import { Alert } from "@/components/atoms";

const PostsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Pagination logic
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return posts?.slice(startIndex, endIndex);
  }, [posts, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil((posts?.length || 0) / itemsPerPage);
  }, [posts, itemsPerPage]);

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
          pageTitle="Post Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Posts</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage posts and their content
                </p>
              </div>
              <Link
                href="/posts/create"
                className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
              >
                Create Post
              </Link>
            </div>

            {/* Content */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Error loading posts</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <PostList posts={paginatedPosts} onDelete={openDeleteModal} />

                {/* Pagination Controls */}
                {posts && posts.length > 0 && (
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
                        entries (Total: {posts.length})
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
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
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

export default PostsPage;
