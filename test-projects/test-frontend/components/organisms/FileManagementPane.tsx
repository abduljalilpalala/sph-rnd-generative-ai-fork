"use client";

import { useState } from "react";
import { Card, Button } from "@/components/atoms";
import { FileUploader, FileGalleryEnhanced } from "@/components/organisms";
import { useFiles } from "@/hooks/useFiles";

export const FileManagementPane = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [userId] = useState(1);
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState<"IMAGE" | "DOCUMENT" | undefined>();
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const { files, isLoading, handleDelete, isDeleting } = useFiles({
    userId,
    search,
    fileType,
    sortBy,
    sortOrder,
  });

  const [deletingId, setDeletingId] = useState<number | undefined>();

  const handleDeleteFile = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await handleDelete(id, userId);
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleDownload = async (id: number) => {
    const file = files?.find((f) => f.id === id);
    if (file) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/files/${id}/download-url`
        );
        const data = await response.json();
        window.open(data.url, "_blank");
      } catch (error) {
        console.error("Failed to download file:", error);
      }
    }
  };

  // Pagination
  const totalItems = files?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = files?.slice(startIndex, endIndex);

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">File Management</h1>
            <p className="text-gray-600 text-sm mt-1">
              Upload and manage your files
            </p>
          </div>
          <Button onClick={() => setShowUploader(!showUploader)}>
            {showUploader ? "Hide Uploader" : "Upload Files"}
          </Button>
        </div>
      </div>

      {/* Uploader */}
      {showUploader && (
        <Card className="mb-6">
          <FileUploader
            userId={userId}
            onUploadComplete={() => setShowUploader(false)}
          />
        </Card>
      )}

      {/* Filters & Search */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Type Filter */}
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <select
              value={fileType || ""}
              onChange={(e) =>
                setFileType(
                  e.target.value ? (e.target.value as "IMAGE" | "DOCUMENT") : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="IMAGE">Images</option>
              <option value="DOCUMENT">Documents</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-auto sm:min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "date" | "size")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-auto sm:min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Items Per Page & Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          {[6, 12, 18].map((value) => (
            <button
              key={value}
              onClick={() => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                itemsPerPage === value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* File Gallery */}
      <FileGalleryEnhanced
        files={paginatedFiles}
        isLoading={isLoading}
        onDelete={handleDeleteFile}
        onDownload={handleDownload}
        deletingId={deletingId}
      />

      {/* Results Info */}
      {!isLoading && files && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} files
        </div>
      )}
    </div>
  );
};
