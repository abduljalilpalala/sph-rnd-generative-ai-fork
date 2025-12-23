"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar, TopNavigation } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="Dashboard"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to <span className="text-orange-500">Sun*</span> HRIS
              </h2>
              <p className="text-gray-600">
                Human Resource Information System - Manage your time, leaves, and profile
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today's Status</p>
                    <p className="text-2xl font-bold text-gray-800">Present</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-full">
                    <Icon name="clock" size={24} className="text-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available Leaves</p>
                    <p className="text-2xl font-bold text-gray-800">12 days</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Icon name="calendar" size={24} className="text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-800">160 hrs</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <Icon name="moonCrescent" size={24} className="text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/time-records"
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Icon name="clock" size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Daily Time Record
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track your attendance and work hours
                      </p>
                    </div>
                  </div>
                </Link>

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

                <div className="block p-6 bg-white rounded-lg shadow-sm border border-gray-100 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Icon name="calendar" size={24} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        My Leaves
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage leave requests (Coming Soon)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
