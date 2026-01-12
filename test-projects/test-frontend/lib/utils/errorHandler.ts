/**
 * Centralized Error Handling Utility
 *
 * Provides a consistent way to handle errors throughout the application.
 * Normalizes different error types into a structured format for logging and debugging.
 * Can be extended for remote logging, analytics, or custom error reporting.
 */

/**
 * Normalized error structure for consistent logging and debugging
 */
export interface NormalizedError {
  message: string;
  name: string;
  stack?: string;
  code?: string | number;
  statusCode?: number;
  originalError: unknown;
  timestamp: string;
  context?: string;
}

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string | number,
    public statusCode?: number,
    public context?: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Type guard to check if error is an Error instance
 */
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error has a status code (e.g., HTTP errors)
 */
const hasStatusCode = (error: unknown): error is { status: number } => {
  return typeof error === "object" && error !== null && "status" in error;
};

/**
 * Type guard to check if error has a response property (e.g., Axios errors)
 */
const hasResponse = (
  error: unknown
): error is { response: { status: number; data?: unknown } } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: unknown }).response === "object"
  );
};

/**
 * Type guard to check if error has a code property
 */
const hasCode = (error: unknown): error is { code: string | number } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (typeof (error as { code: unknown }).code === "string" ||
      typeof (error as { code: unknown }).code === "number")
  );
};

/**
 * Normalize different error types into a consistent structure
 *
 * @param error - The error to normalize (can be Error, string, object, or unknown)
 * @param context - Optional context information (e.g., "FileUpload", "UserAPI")
 * @returns Normalized error object with consistent structure
 */
export const normalizeError = (error: unknown, context?: string): NormalizedError => {
  const timestamp = new Date().toISOString();

  // Handle Error instances
  if (isError(error)) {
    return {
      message: error.message || "An error occurred",
      name: error.name || "Error",
      stack: error.stack,
      code: hasCode(error) ? error.code : undefined,
      statusCode: hasStatusCode(error) ? error.status : undefined,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle errors with response property (e.g., Axios, fetch errors)
  if (hasResponse(error)) {
    const response = error.response;
    return {
      message:
        typeof response.data === "string"
          ? response.data
          : "Request failed with status code " + response.status,
      name: "HTTPError",
      statusCode: response.status,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      name: "StringError",
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle objects with message property
  if (typeof error === "object" && error !== null && "message" in error) {
    return {
      message: String((error as { message: unknown }).message),
      name: "ObjectError",
      code: hasCode(error) ? error.code : undefined,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Fallback for unknown error types
  return {
    message: "An unknown error occurred",
    name: "UnknownError",
    originalError: error,
    timestamp,
    context,
  };
};

/**
 * Log error to console with structured format
 *
 * @param error - The error to log
 * @param context - Optional context information
 */
export const logError = (error: unknown, context?: string): void => {
  const normalized = normalizeError(error, context);

  console.error("Error occurred:", {
    context: normalized.context,
    message: normalized.message,
    name: normalized.name,
    code: normalized.code,
    statusCode: normalized.statusCode,
    timestamp: normalized.timestamp,
    stack: normalized.stack,
  });

  // Log original error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Original error:", normalized.originalError);
  }
};

/**
 * Handle error and return user-friendly message
 *
 * @param error - The error to handle
 * @param context - Optional context information
 * @param fallbackMessage - Optional fallback message for user
 * @returns User-friendly error message
 */
export const handleError = (
  error: unknown,
  context?: string,
  fallbackMessage?: string
): string => {
  const normalized = normalizeError(error, context);
  logError(error, context);

  // Return user-friendly message based on error type
  if (normalized.statusCode === 404) {
    return "The requested resource was not found";
  }

  if (normalized.statusCode === 403) {
    return "You don't have permission to perform this action";
  }

  if (normalized.statusCode === 401) {
    return "Please log in to continue";
  }

  if (normalized.statusCode && normalized.statusCode >= 500) {
    return "Server error. Please try again later";
  }

  // Return error message or fallback
  return normalized.message || fallbackMessage || "An error occurred. Please try again";
};

/**
 * Async wrapper that catches and handles errors
 *
 * @param fn - Async function to wrap
 * @param context - Optional context information
 * @returns Wrapped function that handles errors
 *
 * @example
 * const safeUpload = withErrorHandler(uploadFile, "FileUpload");
 * await safeUpload(file);
 */
export const withErrorHandler = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): ((...args: Parameters<T>) => Promise<ReturnType<T> | null>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return (await fn(...args)) as ReturnType<T>;
    } catch (error) {
      logError(error, context);
      return null;
    }
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (isError(error)) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("Network request failed")
    );
  }
  return false;
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (isError(error)) {
    return error.message.includes("timeout") || error.message.includes("timed out");
  }
  return false;
};
