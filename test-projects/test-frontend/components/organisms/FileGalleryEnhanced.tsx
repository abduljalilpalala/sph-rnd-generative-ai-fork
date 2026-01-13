"use client";

import { useState, useEffect } from "react";
import { FileSize, Icon, FileIcon } from "@/components/atoms";
import { batchValidateFiles } from "@/lib/utils";

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
  const [brokenDocuments, setBrokenDocuments] = useState<Set<number>>(new Set());
  const [validatingFiles, setValidatingFiles] = useState(false);

  /**
   * Handle image load error by marking it as broken
   * Prevents repeated reload attempts and layout shifts
   */
  const handleImageError = (fileId: number) => {
    setBrokenImages((prev) => new Set(prev).add(fileId));
  };

  /**
   * Validate document files on mount and when files change
   * Uses HEAD requests to check availability without downloading
   */
  useEffect(() => {
    const validateDocuments = async () => {
      if (!files || files.length === 0) return;

      // Only validate document files
      const documentFiles = files.filter((file) => file.fileType === "DOCUMENT");
      if (documentFiles.length === 0) return;

      setValidatingFiles(true);

      try {
        const fileIds = documentFiles.map((f) => f.id);
        const validationResults = await batchValidateFiles(fileIds);

        const brokenIds = new Set<number>();
        validationResults.forEach((isValid, fileId) => {
          if (!isValid) {
            brokenIds.add(fileId);
          }
        });

        setBrokenDocuments(brokenIds);
      } catch (error) {
        console.error("Failed to validate documents:", error);
      } finally {
        setValidatingFiles(false);
      }
    };

    validateDocuments();
  }, [files]);

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
          const isBrokenImage = isImage && brokenImages.has(file.id);
          const isBrokenDocument = !isImage && brokenDocuments.has(file.id);
          const isBroken = isBrokenImage || isBrokenDocument;

          return (
            <div
              key={file.id}
              className={`bg-white rounded-lg border-2 hover:shadow-lg transition-all duration-200 overflow-hidden group relative ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : isBroken
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200"
              }`}
              onMouseEnter={() => setHoveredFile(file.id)}
              onMouseLeave={() => setHoveredFile(null)}
              title={
                isBroken
                  ? "This file may be corrupted, deleted, or temporarily unavailable"
                  : undefined
              }
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
                onClick={() => setPreviewFile(file)}
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
                  <div className="flex flex-col items-center justify-center h-full p-4 relative">
                    <div className="mb-3">
                      <FileIcon mimeType={file.mimeType} size="lg" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase text-center">
                      {file.mimeType.split("/")[1] || "file"}
                    </span>
                    {isBrokenDocument && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    {hoveredFile === file.id && !isBrokenDocument && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium text-center px-4">
                          Click to view details
                        </span>
                      </div>
                    )}
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
              ) : brokenDocuments.has(previewFile.id) ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 transform scale-150 opacity-50">
                    <FileIcon mimeType={previewFile.mimeType} size="lg" />
                  </div>
                  <div className="mb-2 bg-red-100 text-red-800 rounded-full p-2">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-semibold mb-2">Document Unavailable</p>
                  <p className="text-gray-600 mb-4 text-center max-w-md">
                    This document could not be loaded. It may be corrupted, deleted, or temporarily unavailable.
                  </p>
                  <button
                    onClick={() => onDownload(previewFile.id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                  >
                    Try Download Anyway
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
