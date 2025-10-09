"use client";

import { useUser } from "@/hooks/useUser";
import { UserDetail } from "@/components/organisms";
import { LoadingState, ErrorState, PageHeader } from "@/components/templates";
import { use } from "react";

const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const { user, isLoading, error } = useUser(userId);

  if (isLoading) return <LoadingState message="Loading user..." />;
  if (error || !user) return <ErrorState message="User not found" showBackLink />;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="User Details"
          actions={[
            { href: `/users/${user.id}/edit`, label: "Edit", variant: "success" },
            { href: "/users", label: "Back to Users", variant: "secondary" },
          ]}
        />
        <UserDetail user={user} />
      </div>
    </main>
  );
};

export default UserDetailPage;
