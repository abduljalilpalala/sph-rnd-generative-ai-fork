import { TextareaHTMLAttributes } from "react";
import { Textarea, Label } from "@/components/atoms";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaField = ({ label, error, required, ...textareaProps }: TextareaFieldProps) => {
  return (
    <div className="mb-4">
      <Label htmlFor={textareaProps.id} required={required}>
        {label}
      </Label>
      <Textarea error={!!error} {...textareaProps} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
