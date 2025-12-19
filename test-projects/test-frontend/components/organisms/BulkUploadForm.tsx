import { useState } from "react";
import { Alert, Button, Card, FileUpload } from "@/components/atoms";
import { BulkUploadResponse } from "@/lib/services/userApi";

interface BulkUploadFormProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  uploadResult: BulkUploadResponse | null;
  error: string | null;
  onReset: () => void;
}

export const BulkUploadForm = ({
  onUpload,
  isLoading,
  uploadResult,
  error,
  onReset,
}: BulkUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (uploadResult || error) {
      onReset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bulk User Upload
          </h2>
          <p className="text-gray-600">
            Upload an Excel file (.xlsx or .xls) containing user information.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Expected File Format
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Your Excel file should contain the following columns:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>
              <strong>email</strong> (required): Valid email address
            </li>
            <li>
              <strong>name</strong> (optional): User's full name
            </li>
          </ul>
          <p className="text-sm text-blue-800 mt-2">
            The first row should contain column headers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={isLoading}
              selectedFileName={selectedFile?.name}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload and Create Users"}
          </Button>
        </form>

        {error && (
          <Alert variant="error">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {uploadResult && (
          <div className="space-y-4">
            {uploadResult.success && uploadResult.failed === 0 && (
              <Alert variant="success">
                <strong>Success!</strong> {uploadResult.message}
                <br />
                <span className="text-sm">
                  Redirecting to users list...
                </span>
              </Alert>
            )}

            {uploadResult.success && uploadResult.failed > 0 && (
              <Alert variant="warning">
                <strong>Partial Success:</strong> {uploadResult.message}
                <br />
                <span className="text-sm">
                  Created: {uploadResult.created}, Failed: {uploadResult.failed}
                </span>
              </Alert>
            )}

            {!uploadResult.success && (
              <Alert variant="error">
                <strong>Upload Failed:</strong> {uploadResult.message}
              </Alert>
            )}

            {uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-red-900 mb-2">
                  Errors ({uploadResult.errors.length})
                </h3>
                <div className="space-y-2">
                  {uploadResult.errors.map((err, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-800 border-b border-red-200 pb-2 last:border-b-0"
                    >
                      <div>
                        <strong>Row {err.row}:</strong> {err.error}
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        Email: {err.email || "(empty)"}
                        {err.name && `, Name: ${err.name}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
