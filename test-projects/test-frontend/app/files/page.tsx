"use client";

import { useState } from "react";
import { Sidebar, TopNavigation, FileUploader, FileGalleryEnhanced } from "@/components/organisms";
import { Card, Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import { useFiles } from "@/hooks/useFiles";
import { downloadFile, downloadFilesAsZip } from "@/lib/utils/fileDownload";

export default function FilesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [userId] = useState(1);
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState<"IMAGE" | "DOCUMENT" | undefined>();
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { files, isLoading, handleDelete, isDeleting, refetch } = useFiles({
    userId,
    search,
    fileType,
    sortBy,
    sortOrder,
  });

  const [deletingId, setDeletingId] = useState<number | undefined>();

  const handleDeleteFile = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete File",
      message: "Are you sure you want to delete this file? This action cannot be undone.",
      onConfirm: async () => {
        setDeletingId(id);
        try {
          await handleDelete(id, userId);
          setSelectedFiles((prev) => prev.filter((fId) => fId !== id));
        } catch (error) {
          console.error("Failed to delete file:", error);
        } finally {
          setDeletingId(undefined);
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: "Delete Multiple Files",
      message: `Are you sure you want to delete ${selectedFiles.length} file(s)? This action cannot be undone.`,
      onConfirm: async () => {
        for (const fileId of selectedFiles) {
          try {
            await handleDelete(fileId, userId);
          } catch (error) {
            console.error(`Failed to delete file ${fileId}:`, error);
          }
        }
        setSelectedFiles([]);
      },
    });
  };

  const handleDownload = async (id: number) => {
    const file = files?.find((f) => f.id === id);
    if (!file) return;

    try {
      // Download file via backend proxy (with validation)
      await downloadFile(id, file.originalName);
    } catch (error) {
      console.error("Failed to download file:", error);
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download file. The file may be corrupted or unavailable.";
      alert(errorMessage); // Replace with toast notification in production
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Get all selected files with their IDs and filenames
      const filesToDownload = selectedFiles
        .map((fileId) => {
          const file = files?.find((f) => f.id === fileId);
          if (!file) return null;
          return { fileId, filename: file.originalName };
        })
        .filter((f) => f !== null) as Array<{
          fileId: number;
          filename: string;
        }>;

      if (filesToDownload.length === 0) {
        console.error("No valid files to download");
        return;
      }

      // Download as ZIP if multiple files, or single file if only one
      if (filesToDownload.length === 1) {
        await downloadFile(filesToDownload[0].fileId, filesToDownload[0].filename);
      } else {
        const timestamp = new Date().toISOString().split("T")[0];
        await downloadFilesAsZip(filesToDownload, `files-${timestamp}.zip`);
      }
    } catch (error) {
      console.error("Failed to download files:", error);
      // Show user-friendly error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download files. Some files may be corrupted or unavailable.";
      alert(errorMessage); // Replace with toast notification in production
    }
  };

  const toggleFileSelection = (id: number) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!paginatedFiles) return;

    if (selectedFiles.length === paginatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(paginatedFiles.map(f => f.id));
    }
  };

  // Pagination
  const totalItems = files?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = files?.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="File Management"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
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
                  onUploadComplete={() => {
                    setShowUploader(false);
                    refetch();
                  }}
                />
              </Card>
            )}

            {/* Bulk Actions Bar */}
            {selectedFiles.length > 0 && (
              <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFiles.length} file(s) selected
                    </span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkDownload}
                      variant="secondary"
                      className="text-sm"
                    >
                      Download Selected
                    </Button>
                    <Button
                      onClick={handleBulkDelete}
                      variant="danger"
                      className="text-sm"
                    >
                      Delete Selected
                    </Button>
                  </div>
                </div>
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
              <div className="flex items-center gap-3 flex-wrap">
                {paginatedFiles && paginatedFiles.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    {selectedFiles.length === paginatedFiles.length ? "Deselect All" : "Select All"}
                  </button>
                )}
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
              selectedFiles={selectedFiles}
              onToggleSelect={toggleFileSelection}
            />

            {/* Results Info */}
            {!isLoading && files && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} files
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
