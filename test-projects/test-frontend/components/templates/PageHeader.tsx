import { Button } from "@/components/atoms";
import NextLink from "next/link";

interface PageHeaderAction {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "success";
}

interface PageHeaderProps {
  title: string;
  actions?: PageHeaderAction[];
}

export const PageHeader = ({ title, actions = [] }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">{title}</h1>
      {actions.length > 0 && (
        <div className="flex gap-4">
          {actions.map((action, index) => (
            <NextLink key={index} href={action.href}>
              <Button variant={action.variant || "secondary"}>{action.label}</Button>
            </NextLink>
          ))}
        </div>
      )}
    </div>
  );
};
