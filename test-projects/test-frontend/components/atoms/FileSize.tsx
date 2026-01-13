interface FileSizeProps {
  bytes: number;
  className?: string;
}

export const FileSize = ({ bytes, className = "" }: FileSizeProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return <span className={`text-sm text-gray-600 ${className}`}>{formatFileSize(bytes)}</span>;
};
