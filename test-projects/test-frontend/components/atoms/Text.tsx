import { ReactNode } from "react";

export type TextVariant = "body" | "caption" | "label";
export type TextColor = "primary" | "secondary" | "muted";

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: ReactNode;
  className?: string;
}

export const Text = ({
  variant = "body",
  color = "primary",
  children,
  className = "",
}: TextProps) => {
  const variantClasses: Record<TextVariant, string> = {
    body: "text-base",
    caption: "text-sm",
    label: "text-xs font-medium uppercase tracking-wider",
  };

  const colorClasses: Record<TextColor, string> = {
    primary: "text-gray-900",
    secondary: "text-gray-700",
    muted: "text-gray-500",
  };

  return <p className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}>{children}</p>;
};
