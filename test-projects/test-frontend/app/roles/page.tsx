"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/organisms";
import { Icon, Badge } from "@/components/atoms";

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: "active" | "inactive";
  createdDate: string;
}

const RolesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data
  const roles: Role[] = [
    {
      id: 1,
      name: "Administrator",
      description: "Full system access with all permissions",
      userCount: 5,
      permissions: ["user.create", "user.edit", "user.delete", "post.create", "post.edit", "post.delete", "role.manage"],
      status: "active",
      createdDate: "2023-01-15",
    },
    {
      id: 2,
      name: "Editor",
      description: "Can create and edit posts",
      userCount: 12,
      permissions: ["post.create", "post.edit", "post.view"],
      status: "active",
      createdDate: "2023-02-20",
    },
    {
      id: 3,
      name: "Moderator",
      description: "Can review and moderate content",
      userCount: 8,
      permissions: ["post.view", "post.moderate", "user.view"],
      status: "active",
      createdDate: "2023-03-10",
    },
    {
      id: 4,
      name: "User Manager",
      description: "Can manage user accounts",
      userCount: 3,
      permissions: ["user.create", "user.edit", "user.view"],
      status: "active",
      createdDate: "2023-04-05",
    },
    {
      id: 5,
      name: "Viewer",
      description: "Read-only access to content",
      userCount: 45,
      permissions: ["post.view", "user.view"],
      status: "active",
      createdDate: "2023-05-12",
    },
    {
      id: 6,
      name: "Content Creator",
      description: "Can create posts only",
      userCount: 18,
      permissions: ["post.create", "post.view"],
      status: "active",
      createdDate: "2023-06-18",
    },
    {
      id: 7,
      name: "Support Agent",
      description: "Can assist users with issues",
      userCount: 10,
      permissions: ["user.view", "post.view", "support.access"],
      status: "active",
      createdDate: "2023-07-22",
    },
    {
      id: 8,
      name: "Guest",
      description: "Limited access for external users",
      userCount: 65,
      permissions: ["post.view"],
      status: "inactive",
      createdDate: "2023-08-30",
    },
  ];

  // Pagination logic
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return roles.slice(startIndex, endIndex);
  }, [roles, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(roles.length / itemsPerPage);
  }, [roles, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  const getStatusColor = (status: Role["status"]) => {
    return status === "active" ? "green" : "gray";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Icon name="menu" size={24} className="text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
              </div>
              <p className="text-gray-600 ml-14">Manage user roles and permissions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Total Roles</p>
                <p className="text-2xl font-bold text-gray-800">{roles.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Active Roles</p>
                <p className="text-2xl font-bold text-gray-800">
                  {roles.filter((r) => r.status === "active").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {roles.reduce((sum, r) => sum + r.userCount, 0)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600 mb-1">Permissions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {[...new Set(roles.flatMap((r) => r.permissions))].length}
                </p>
              </div>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">All Roles</h2>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                  <Icon name="shield" size={18} />
                  Create Role
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Icon name="shield" size={18} className="text-purple-500" />
                            <span className="text-sm font-medium text-gray-900">{role.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{role.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{role.userCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{role.permissions.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={getStatusColor(role.status)}>
                            {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{role.createdDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-4 p-4 flex justify-between items-center border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    entries (Total: {roles.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RolesPage;
