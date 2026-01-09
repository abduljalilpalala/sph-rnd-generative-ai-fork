import { Readable } from 'stream';

/**
 * Interface for file download response with strict typing
 */
export interface FileDownloadResponse {
  /**
   * Readable stream containing the file data
   */
  stream: Readable;

  /**
   * Original filename for the download
   */
  filename: string;

  /**
   * MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
   */
  contentType: string;

  /**
   * Size of the file in bytes
   */
  contentLength: number;
}
