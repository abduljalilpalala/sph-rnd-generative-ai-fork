export interface BulkUploadError {
  row: number;
  email: string;
  name?: string;
  error: string;
}

export class BulkUploadResponseDto {
  success: boolean;
  message: string;
  created: number;
  failed: number;
  errors: BulkUploadError[];
}
