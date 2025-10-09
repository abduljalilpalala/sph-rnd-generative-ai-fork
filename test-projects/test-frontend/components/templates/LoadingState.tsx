import { PageLayout } from "@/components/templates/PageLayout";

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <PageLayout>
      <p className="text-center text-gray-500">{message}</p>
    </PageLayout>
  );
};
