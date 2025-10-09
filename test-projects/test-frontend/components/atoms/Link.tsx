import NextLink from "next/link";
import { ReactNode } from "react";

export type LinkVariant = "primary" | "success" | "danger" | "ghost";

interface LinkProps {
  href: string;
  variant?: LinkVariant;
  children: ReactNode;
  className?: string;
}

export const Link = ({ href, variant = "primary", children, className = "" }: LinkProps) => {
  const variantClasses: Record<LinkVariant, string> = {
    primary: "text-blue-600 hover:text-blue-900",
    success: "text-green-600 hover:text-green-900",
    danger: "text-red-600 hover:text-red-900",
    ghost: "text-gray-600 hover:text-gray-900",
  };

  return (
    <NextLink href={href} className={`${variantClasses[variant]} ${className}`}>
      {children}
    </NextLink>
  );
};
