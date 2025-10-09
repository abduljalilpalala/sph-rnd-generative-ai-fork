import { Card } from "@/components/atoms";

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <Card className="p-8">
      <p className="text-center text-gray-500">{message}</p>
    </Card>
  );
};
