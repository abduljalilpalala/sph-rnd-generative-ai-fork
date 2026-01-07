import { ReactNode } from "react";
import { Button } from "@/components/atoms";
import NextLink from "next/link";

interface PageHeaderAction {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "success";
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageHeaderAction[] | ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  const renderActions = () => {
    if (!actions) return null;

    if (Array.isArray(actions)) {
      return (
        <div className="flex gap-4">
          {actions.map((action, index) => (
            <NextLink key={index} href={action.href}>
              <Button variant={action.variant || "secondary"}>{action.label}</Button>
            </NextLink>
          ))}
        </div>
      );
    }

    return actions;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {renderActions()}
      </div>
    </div>
  );
};
