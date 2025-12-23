import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = ({ error = false, className = "", ...props }: TextareaProps) => {
  const baseClasses = "w-full px-3 py-2 border rounded focus:outline-none transition";
  const stateClasses = error
    ? "border-red-500 focus:border-red-600"
    : "border-gray-300 focus:border-blue-500";

  return <textarea className={`${baseClasses} ${stateClasses} ${className}`} {...props} />;
};
