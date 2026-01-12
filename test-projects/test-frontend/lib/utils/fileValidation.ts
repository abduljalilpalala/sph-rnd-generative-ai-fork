import { logError, AppError } from "@/lib/utils/errorHandler";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Validate if a file is accessible by making a HEAD request
 * This allows us to check file availability without downloading the entire file
 *
 * @param fileId - The ID of the file to validate
 * @returns Promise<boolean> - true if file is accessible, false otherwise
 */
export const validateFileAvailability = async (fileId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/files/${fileId}/download`, {
      method: "HEAD",
    });

    return response.ok;
  } catch (error) {
    logError(error, `FileValidation - File ${fileId}`);
    return false;
  }
};

/**
 * Batch validate multiple files
 * Returns a Map of fileId -> isValid
 *
 * @param fileIds - Array of file IDs to validate
 * @returns Promise<Map<number, boolean>> - Map of fileId to validation result
 */
export const batchValidateFiles = async (fileIds: number[]): Promise<Map<number, boolean>> => {
  const results = new Map<number, boolean>();

  const validationPromises = fileIds.map(async (fileId) => {
    const isValid = await validateFileAvailability(fileId);
    results.set(fileId, isValid);
  });

  await Promise.all(validationPromises);

  return results;
};

/**
 * Validate file on download and provide user-friendly error
 *
 * @param fileId - The ID of the file
 * @param filename - The name of the file
 * @throws AppError with user-friendly message if validation fails
 */
export const validateBeforeDownload = async (
  fileId: number,
  filename: string
): Promise<void> => {
  const isValid = await validateFileAvailability(fileId);

  if (!isValid) {
    throw new AppError(
      `File "${filename}" is not available. It may be corrupted, deleted, or temporarily unavailable.`,
      "FILE_UNAVAILABLE",
      404,
      "FileValidation"
    );
  }
};
