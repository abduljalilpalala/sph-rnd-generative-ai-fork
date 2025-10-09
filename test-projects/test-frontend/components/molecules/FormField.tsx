import { InputHTMLAttributes } from "react";
import { Input, Label } from "@/components/atoms";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = ({ label, error, required, ...inputProps }: FormFieldProps) => {
  return (
    <div className="mb-4">
      <Label htmlFor={inputProps.id} required={required}>
        {label}
      </Label>
      <Input error={!!error} {...inputProps} />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
