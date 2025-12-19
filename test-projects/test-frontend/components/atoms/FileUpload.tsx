import { ChangeEvent, useRef } from "react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  selectedFileName?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept = ".xlsx,.xls",
  disabled = false,
  selectedFileName,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {selectedFileName ? "Change File" : "Choose File"}
      </button>
      {selectedFileName && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selectedFileName}</span>
        </p>
      )}
    </div>
  );
};
