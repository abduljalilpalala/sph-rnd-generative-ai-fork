"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { UserForm, Sidebar, TopNavigation } from "@/components/organisms";

const EditUserPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const { user, isLoading: isLoadingUser } = useUser(userId);
  const { handleUpdate, isLoading, error } = useUpdateUser(userId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Edit User"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Loading State */}
            {isLoadingUser && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading user...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!user && !isLoadingUser && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">User not found</p>
                <p className="text-red-600 text-sm mt-1">The requested user does not exist</p>
                <Link
                  href="/users"
                  className="inline-block mt-4 bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                >
                  Back to Users
                </Link>
              </div>
            )}

            {/* Edit Form */}
            {!isLoadingUser && user && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Update user information
                    </p>
                  </div>
                  <Link
                    href={`/users/${userId}`}
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                  >
                    Back to User
                  </Link>
                </div>
                <UserForm
                  initialEmail={user.email}
                  initialName={user.name || ""}
                  onSubmit={handleUpdate}
                  isLoading={isLoading}
                  error={error}
                  submitButtonText="Update User"
                  cancelHref={`/users/${userId}`}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUserPage;
