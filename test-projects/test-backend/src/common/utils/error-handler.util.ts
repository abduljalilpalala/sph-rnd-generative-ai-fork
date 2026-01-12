/**
 * Centralized Error Handling Utility (Backend)
 *
 * Provides a consistent way to handle errors throughout the NestJS backend.
 * Normalizes different error types into a structured format for logging and debugging.
 * Compatible with NestJS exception filters and Logger.
 */

import { Logger } from '@nestjs/common';

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
 * Type guard to check if error is an Error instance
 */
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error has a status property (e.g., HTTP errors)
 */
const hasStatus = (error: unknown): error is { status: number } => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

/**
 * Type guard to check if error has a response property (e.g., Axios errors)
 */
const hasResponse = (
  error: unknown,
): error is { response: { status: number; data?: unknown } } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object'
  );
};

/**
 * Type guard to check if error has a code property
 */
const hasCode = (error: unknown): error is { code: string | number } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof (error as { code: unknown }).code === 'string' ||
      typeof (error as { code: unknown }).code === 'number')
  );
};

/**
 * Normalize different error types into a consistent structure
 *
 * @param error - The error to normalize (can be Error, string, object, or unknown)
 * @param context - Optional context information (e.g., "FileService", "UserController")
 * @returns Normalized error object with consistent structure
 */
export const normalizeError = (
  error: unknown,
  context?: string,
): NormalizedError => {
  const timestamp = new Date().toISOString();

  // Handle Error instances
  if (isError(error)) {
    return {
      message: error.message || 'An error occurred',
      name: error.name || 'Error',
      stack: error.stack,
      code: hasCode(error) ? error.code : undefined,
      statusCode: hasStatus(error) ? error.status : undefined,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle errors with response property (e.g., Axios, HTTP errors)
  if (hasResponse(error)) {
    const response = error.response;
    return {
      message:
        typeof response.data === 'string'
          ? response.data
          : 'Request failed with status code ' + response.status,
      name: 'HTTPError',
      statusCode: response.status,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      name: 'StringError',
      originalError: error,
      timestamp,
      context,
    };
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message: String((error as { message: unknown }).message),
      name: 'ObjectError',
      code: hasCode(error) ? error.code : undefined,
      originalError: error,
      timestamp,
      context,
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unknown error occurred',
    name: 'UnknownError',
    originalError: error,
    timestamp,
    context,
  };
};

/**
 * Log error using NestJS Logger with structured format
 *
 * @param error - The error to log
 * @param context - Optional context information (e.g., service or controller name)
 * @param logger - Optional Logger instance (creates new one if not provided)
 */
export const logError = (
  error: unknown,
  context?: string,
  logger?: Logger,
): void => {
  const normalized = normalizeError(error, context);
  const loggerInstance = logger || new Logger(context || 'ErrorHandler');

  // Use NestJS Logger.error which includes context automatically
  loggerInstance.error(
    normalized.message,
    normalized.stack || JSON.stringify({
      name: normalized.name,
      code: normalized.code,
      statusCode: normalized.statusCode,
      timestamp: normalized.timestamp,
    }),
  );

  // Log original error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Original error:', normalized.originalError);
  }
};

/**
 * Handle error in catch blocks - logs and re-throws
 *
 * @param error - The error to handle
 * @param context - Context information (e.g., "FileService.uploadFile")
 * @param logger - Optional Logger instance
 * @throws Re-throws the error after logging
 *
 * @example
 * try {
 *   await this.uploadToS3(file);
 * } catch (error) {
 *   handleError(error, 'FileService.uploadFile', this.logger);
 *   throw error; // or throw a different error
 * }
 */
export const handleError = (
  error: unknown,
  context?: string,
  logger?: Logger,
): never => {
  logError(error, context, logger);
  throw error;
};

/**
 * Check if error is a Prisma error
 */
export const isPrismaError = (error: unknown): boolean => {
  if (isError(error)) {
    return (
      error.name.includes('Prisma') ||
      (hasCode(error) &&
        typeof error.code === 'string' &&
        error.code.startsWith('P'))
    );
  }
  return false;
};

/**
 * Check if error is an S3/storage error
 */
export const isStorageError = (error: unknown): boolean => {
  if (isError(error)) {
    return (
      error.message.includes('S3') ||
      error.message.includes('storage') ||
      error.message.includes('bucket')
    );
  }
  return false;
};
