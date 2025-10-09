import { ReactNode } from "react";

export type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

export const Alert = ({ variant = "info", children, className = "" }: AlertProps) => {
  const variantClasses: Record<AlertVariant, string> = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div className={`p-4 border rounded ${variantClasses[variant]} ${className}`}>{children}</div>
  );
};
