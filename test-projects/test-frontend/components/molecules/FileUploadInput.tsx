"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/atoms";

interface FileUploadInputProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}

export const FileUploadInput = ({
  onFilesSelected,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  multiple = true,
  maxFiles = 1000,
  disabled = false,
}: FileUploadInputProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const limitedFiles = droppedFiles.slice(0, maxFiles);
    onFilesSelected(limitedFiles);
  }, [disabled, maxFiles, onFilesSelected]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const limitedFiles = selectedFiles.slice(0, maxFiles);
      onFilesSelected(limitedFiles);
    }
  }, [maxFiles, onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : disabled
          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      <div className="space-y-4">
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <label htmlFor="file-upload" className="cursor-pointer inline-block">
            <span className={`font-bold rounded transition py-2 px-4 inline-block ${
              disabled
                ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}>
              Choose files
            </span>
          </label>
          <p className="mt-2 text-sm text-gray-600">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          Images and documents up to 10MB each (max {maxFiles} files)
        </p>
      </div>
    </div>
  );
};
