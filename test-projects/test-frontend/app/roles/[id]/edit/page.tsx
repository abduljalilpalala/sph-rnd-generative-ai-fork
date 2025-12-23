"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";
import { useUpdateRole } from "@/hooks/useUpdateRole";
import { RoleForm, Sidebar, TopNavigation } from "@/components/organisms";

const EditRolePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const resolvedParams = use(params);
  const roleId = parseInt(resolvedParams.id);
  const { role, isLoading: isLoadingRole } = useRole(roleId);
  const { handleUpdate, isLoading, error } = useUpdateRole(roleId);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Edit Role"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Loading State */}
            {isLoadingRole && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading role...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!role && !isLoadingRole && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium">Role not found</p>
                <p className="text-red-600 text-sm mt-1">The requested role does not exist</p>
                <Link
                  href="/roles"
                  className="inline-block mt-4 bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                >
                  Back to Roles
                </Link>
              </div>
            )}

            {/* Edit Form */}
            {!isLoadingRole && role && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Edit Role</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Update role information
                    </p>
                  </div>
                  <Link
                    href={`/roles/${roleId}`}
                    className="bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold rounded transition py-2 px-4"
                  >
                    Back to Role
                  </Link>
                </div>
                <RoleForm
                  initialName={role.name || ""}
                  initialDescription={role.description || ""}
                  onSubmit={handleUpdate}
                  isLoading={isLoading}
                  error={error}
                  submitButtonText="Update Role"
                  cancelHref={`/roles/${roleId}`}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditRolePage;
