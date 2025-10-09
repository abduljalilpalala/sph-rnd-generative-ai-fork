"use client";

import { useCreateUser } from "@/hooks/useCreateUser";
import { UserForm } from "@/components/organisms";
import { PageHeader } from "@/components/templates";

const CreateUserPage = () => {
  const { handleCreate, isLoading, error } = useCreateUser();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Create User"
          actions={[{ href: "/users", label: "Back to Users", variant: "secondary" }]}
        />
        <UserForm
          onSubmit={handleCreate}
          isLoading={isLoading}
          error={error}
          submitButtonText="Create User"
          cancelHref="/users"
        />
      </div>
    </main>
  );
};

export default CreateUserPage;
