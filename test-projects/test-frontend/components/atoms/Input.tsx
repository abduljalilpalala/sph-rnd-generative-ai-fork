import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = ({ error = false, className = "", ...props }: InputProps) => {
  const baseClasses = "w-full px-3 py-2 border rounded focus:outline-none transition";
  const stateClasses = error
    ? "border-red-500 focus:border-red-600"
    : "border-gray-300 focus:border-blue-500";

  return <input className={`${baseClasses} ${stateClasses} ${className}`} {...props} />;
};
