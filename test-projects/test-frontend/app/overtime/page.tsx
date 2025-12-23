"use client";

import { useState } from "react";
import { Sidebar, TopNavigation, OvertimeTable } from "@/components/organisms";

const OvertimePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for overtime records
  const mockOvertimeRecords = [
    {
      id: 1,
      date: "December 22, 2025",
      requestedHours: "3 hours",
      approvedHours: "3 hours",
      reason: "Critical production deployment and monitoring",
      status: "Completed" as const,
      requestedDate: "December 22, 2025",
      supervisor: "John Smith",
    },
    {
      id: 2,
      date: "December 23, 2025",
      requestedHours: "2 hours",
      approvedHours: "Pending",
      reason: "Year-end project deadline completion",
      status: "Pending" as const,
      requestedDate: "December 23, 2025",
      supervisor: "Jane Doe",
    },
    {
      id: 3,
      date: "December 18, 2025",
      requestedHours: "4 hours",
      approvedHours: "4 hours",
      reason: "Emergency bug fixes for client issue",
      status: "Approved" as const,
      requestedDate: "December 18, 2025",
      supervisor: "John Smith",
    },
    {
      id: 4,
      date: "December 15, 2025",
      requestedHours: "3 hours",
      approvedHours: "2 hours",
      reason: "Database migration and testing - approved for 2 hours only",
      status: "Approved" as const,
      requestedDate: "December 14, 2025",
      supervisor: "Sarah Johnson",
    },
    {
      id: 5,
      date: "December 10, 2025",
      requestedHours: "5 hours",
      approvedHours: "N/A",
      reason: "Additional work not urgent - rejected",
      status: "Rejected" as const,
      requestedDate: "December 9, 2025",
      supervisor: "Jane Doe",
    },
    {
      id: 6,
      date: "December 5, 2025",
      requestedHours: "2.5 hours",
      approvedHours: "2.5 hours",
      reason: "Security patch implementation",
      status: "Completed" as const,
      requestedDate: "December 5, 2025",
      supervisor: "John Smith",
    },
    {
      id: 7,
      date: "November 28, 2025",
      requestedHours: "4 hours",
      approvedHours: "4 hours",
      reason: "End of month reports and system updates",
      status: "Completed" as const,
      requestedDate: "November 28, 2025",
      supervisor: "Sarah Johnson",
    },
    {
      id: 8,
      date: "November 20, 2025",
      requestedHours: "3 hours",
      approvedHours: "3 hours",
      reason: "Client presentation preparation and rehearsal",
      status: "Completed" as const,
      requestedDate: "November 19, 2025",
      supervisor: "Jane Doe",
    },
    {
      id: 9,
      date: "November 15, 2025",
      requestedHours: "6 hours",
      approvedHours: "5 hours",
      reason: "Major feature release deployment - approved for 5 hours",
      status: "Completed" as const,
      requestedDate: "November 14, 2025",
      supervisor: "John Smith",
    },
    {
      id: 10,
      date: "November 8, 2025",
      requestedHours: "2 hours",
      approvedHours: "2 hours",
      reason: "Performance optimization tasks",
      status: "Completed" as const,
      requestedDate: "November 8, 2025",
      supervisor: "Sarah Johnson",
    },
    {
      id: 11,
      date: "October 30, 2025",
      requestedHours: "3.5 hours",
      approvedHours: "3.5 hours",
      reason: "Code review and technical documentation",
      status: "Completed" as const,
      requestedDate: "October 30, 2025",
      supervisor: "Jane Doe",
    },
    {
      id: 12,
      date: "October 22, 2025",
      requestedHours: "4 hours",
      approvedHours: "4 hours",
      reason: "Sprint planning and backlog refinement",
      status: "Completed" as const,
      requestedDate: "October 21, 2025",
      supervisor: "John Smith",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle="My Overtime"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Overtime Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage your overtime requests
            </p>
          </div>

          {/* Overtime Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total This Month</div>
              <div className="text-2xl font-bold text-gray-900">5 hours</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total This Year</div>
              <div className="text-2xl font-bold text-blue-600">38 hours</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
              <div className="text-2xl font-bold text-orange-600">2 hours</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Approved Rate</div>
              <div className="text-2xl font-bold text-green-600">91%</div>
            </div>
          </div>

          <OvertimeTable records={mockOvertimeRecords} />
        </main>
      </div>
    </div>
  );
};

export default OvertimePage;
