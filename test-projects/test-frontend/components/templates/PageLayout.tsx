import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
};
