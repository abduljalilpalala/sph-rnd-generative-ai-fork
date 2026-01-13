import { FileIcon, FileSize, Button } from "@/components/atoms";
import { File } from "@/lib/services/fileApi";

interface FileCardProps {
  file: File;
  onDelete?: (id: number) => void;
  onDownload?: (id: number) => void;
  isDeleting?: boolean;
}

export const FileCard = ({ file, onDelete, onDownload, isDeleting }: FileCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <FileIcon mimeType={file.mimeType} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.originalName}</h3>
          <div className="mt-1 flex items-center gap-2">
            <FileSize bytes={file.size} />
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {new Date(file.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {onDownload && (
          <Button variant="secondary" size="sm" onClick={() => onDownload(file.id)}>
            Download
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(file.id)}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
