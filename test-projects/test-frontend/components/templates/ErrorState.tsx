import { Link } from "@/components/atoms";
import { PageLayout } from "@/components/templates/PageLayout";

interface ErrorStateProps {
  message: string;
  showBackLink?: boolean;
  backHref?: string;
  backText?: string;
}

export const ErrorState = ({
  message,
  showBackLink = false,
  backHref = "/users",
  backText = "Back to Users",
}: ErrorStateProps) => {
  return (
    <PageLayout>
      <p className="text-center text-red-500">{message}</p>
      {showBackLink && (
        <div className="text-center mt-4">
          <Link href={backHref} variant="primary">
            {backText}
          </Link>
        </div>
      )}
    </PageLayout>
  );
};
