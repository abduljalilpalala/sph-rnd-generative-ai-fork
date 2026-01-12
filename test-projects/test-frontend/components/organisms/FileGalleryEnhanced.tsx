"use client";

import { useState } from "react";
import { FileSize, Icon, FileIcon } from "@/components/atoms";

// Placeholder image data URL (1x1 gray pixel)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='12' fill='%239ca3af'%3EImage%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='12' fill='%239ca3af'%3EUnavailable%3C/text%3E%3C/svg%3E";

interface FileData {
  id: number;
  originalName: string;
  mimeType: string;
  fileType: "IMAGE" | "DOCUMENT";
  size: number;
  url?: string;
  createdAt: string;
}

interface FileGalleryEnhancedProps {
  files?: FileData[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
  deletingId?: number;
  selectedFiles?: number[];
  onToggleSelect?: (id: number) => void;
}

export const FileGalleryEnhanced = ({
  files,
  isLoading,
  onDelete,
  onDownload,
  deletingId,
  selectedFiles = [],
  onToggleSelect,
}: FileGalleryEnhancedProps) => {
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  /**
   * Handle image load error by marking it as broken
   * Prevents repeated reload attempts and layout shifts
   */
  const handleImageError = (fileId: number) => {
    setBrokenImages((prev) => new Set(prev).add(fileId));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 animate-pulse"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon name="document" size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">No files found</p>
            <p className="text-sm text-gray-600 mt-1">
              Upload some files to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isImageFile = (mimeType: string) => {
    return (
      mimeType.startsWith("image/") &&
      ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(
        mimeType.toLowerCase()
      )
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => {
          const isImage = isImageFile(file.mimeType);
          const isDeleting = deletingId === file.id;
          const isSelected = selectedFiles.includes(file.id);

          return (
            <div
              key={file.id}
              className={`bg-white rounded-lg border-2 hover:shadow-lg transition-all duration-200 overflow-hidden group relative ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onMouseEnter={() => setHoveredFile(file.id)}
              onMouseLeave={() => setHoveredFile(null)}
            >
              {/* Checkbox */}
              {onToggleSelect && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Thumbnail/Preview */}
              <div
                className="aspect-square bg-gray-50 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => isImage && !brokenImages.has(file.id) ? setPreviewFile(file) : null}
              >
                {isImage && file.url && !brokenImages.has(file.id) ? (
                  <>
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => handleImageError(file.id)}
                      loading="lazy"
                    />
                    {hoveredFile === file.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          Click to preview
                        </span>
                      </div>
                    )}
                  </>
                ) : isImage && file.url && brokenImages.has(file.id) ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <img
                      src={PLACEHOLDER_IMAGE}
                      alt="Image unavailable"
                      className="w-full h-full object-contain opacity-50"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="mb-3">
                      <FileIcon mimeType={file.mimeType} size="lg" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase text-center">
                      {file.mimeType.split("/")[1] || "file"}
                    </span>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-4">
                <h3
                  className="text-sm font-semibold text-gray-800 truncate"
                  title={file.originalName}
                >
                  {file.originalName}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    <FileSize bytes={file.size} />
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {file.fileType.toLowerCase()}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onDownload(file.id)}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(file.id)}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {previewFile.originalName}
                </h3>
                <p className="text-sm text-gray-600">
                  <FileSize bytes={previewFile.size} /> •{" "}
                  {new Date(previewFile.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>
            <div className="p-4">
              {isImageFile(previewFile.mimeType) && previewFile.url && !brokenImages.has(previewFile.id) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.originalName}
                  className="w-full h-auto rounded-lg"
                  onError={() => handleImageError(previewFile.id)}
                />
              ) : isImageFile(previewFile.mimeType) && brokenImages.has(previewFile.id) ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <img
                    src={PLACEHOLDER_IMAGE}
                    alt="Image unavailable"
                    className="w-64 h-64 object-contain opacity-50 mb-4"
                  />
                  <p className="text-gray-600 mb-4">
                    This image could not be loaded
                  </p>
                  <button
                    onClick={() => onDownload(previewFile.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                  >
                    Download File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 transform scale-150">
                    <FileIcon mimeType={previewFile.mimeType} size="lg" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <button
                    onClick={() => onDownload(previewFile.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
