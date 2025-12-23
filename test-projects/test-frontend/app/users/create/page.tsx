"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreateUser } from "@/hooks/useCreateUser";
import { UserForm, Sidebar, TopNavigation } from "@/components/organisms";

const CreateUserPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { handleCreate, isLoading, error } = useCreateUser();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Create User"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create User</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new user to the system
                </p>
              </div>
              <Link
                href="/users"
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
              >
                Back to Users
              </Link>
            </div>

            {/* Form */}
            <UserForm
              onSubmit={handleCreate}
              isLoading={isLoading}
              error={error}
              submitButtonText="Create User"
              cancelHref="/users"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateUserPage;
