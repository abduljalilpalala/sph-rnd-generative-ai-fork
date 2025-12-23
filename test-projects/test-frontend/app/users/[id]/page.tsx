"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { UserDetail, Sidebar } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  const { user, isLoading, error } = useUser(userId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading user...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {(error || !user) && !isLoading && (
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

            {/* User Details */}
            {!isLoading && !error && user && (
              <>
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
                      <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        View and manage user information
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="bg-green-500 text-white hover:bg-green-600 font-bold rounded transition py-2 px-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href="/users"
                      className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                    >
                      Back to Users
                    </Link>
                  </div>
                </div>
                <UserDetail user={user} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDetailPage;
