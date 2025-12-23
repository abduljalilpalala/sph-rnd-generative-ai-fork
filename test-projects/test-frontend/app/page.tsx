"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <Icon name="menu" size={24} className="text-gray-600" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800">
                  Welcome to <span className="text-orange-500">Sun*</span> Management System
                </h2>
              </div>
              <p className="text-gray-600 ml-14">
                Manage users, posts, roles, and system settings
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">156</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Icon name="user" size={24} className="text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-800">342</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-full">
                    <Icon name="document" size={24} className="text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Roles</p>
                    <p className="text-2xl font-bold text-gray-800">8</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <Icon name="shield" size={24} className="text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/users"
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Icon name="user" size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        User Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage all system users
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/posts"
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <Icon name="document" size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Post Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create, edit, and manage posts
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/roles"
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Icon name="shield" size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Role Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage user roles and permissions
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
