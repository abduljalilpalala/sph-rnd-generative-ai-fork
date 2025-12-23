"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreateUser } from "@/hooks/useCreateUser";
import { UserForm, Sidebar } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const CreateUserPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { handleCreate, isLoading, error } = useCreateUser();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Icon name="menu" size={24} className="text-gray-600" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Create User</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add a new user to the system
                  </p>
                </div>
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
