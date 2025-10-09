"use client";

import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { UserForm } from "@/components/organisms";
import { LoadingState, ErrorState, PageHeader } from "@/components/templates";
import { use } from "react";

const EditUserPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const { user, isLoading: isLoadingUser } = useUser(userId);
  const { handleUpdate, isLoading, error } = useUpdateUser(userId);

  if (isLoadingUser) return <LoadingState message="Loading user..." />;
  if (!user) return <ErrorState message="User not found" showBackLink />;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Edit User"
          actions={[{ href: `/users/${userId}`, label: "Back to User", variant: "secondary" }]}
        />
        <UserForm
          initialEmail={user.email}
          initialName={user.name || ""}
          onSubmit={handleUpdate}
          isLoading={isLoading}
          error={error}
          submitButtonText="Update User"
          cancelHref={`/users/${userId}`}
        />
      </div>
    </main>
  );
};

export default EditUserPage;
