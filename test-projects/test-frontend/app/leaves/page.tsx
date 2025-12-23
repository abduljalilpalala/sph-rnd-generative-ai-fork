"use client";

import { useState } from "react";
import { Sidebar, LeaveTable } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const LeavesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for leave records
  const mockLeaveRecords = [
    {
      id: 1,
      leaveType: "Vacation Leave",
      startDate: "January 15, 2026",
      endDate: "January 19, 2026",
      duration: "5 days",
      status: "Approved" as const,
      reason: "Family vacation trip to Japan",
      appliedDate: "December 20, 2025",
    },
    {
      id: 2,
      leaveType: "Sick Leave",
      startDate: "December 18, 2025",
      endDate: "December 19, 2025",
      duration: "2 days",
      status: "Approved" as const,
      reason: "Medical checkup and recovery",
      appliedDate: "December 17, 2025",
    },
    {
      id: 3,
      leaveType: "Emergency Leave",
      startDate: "December 28, 2025",
      endDate: "December 28, 2025",
      duration: "1 day",
      status: "Pending" as const,
      reason: "Family emergency",
      appliedDate: "December 23, 2025",
    },
    {
      id: 4,
      leaveType: "Vacation Leave",
      startDate: "December 24, 2025",
      endDate: "December 27, 2025",
      duration: "4 days",
      status: "Cancelled" as const,
      reason: "Christmas holiday plans cancelled",
      appliedDate: "December 10, 2025",
    },
    {
      id: 5,
      leaveType: "Sick Leave",
      startDate: "November 28, 2025",
      endDate: "November 29, 2025",
      duration: "2 days",
      status: "Approved" as const,
      reason: "Flu and fever",
      appliedDate: "November 27, 2025",
    },
    {
      id: 6,
      leaveType: "Paternity Leave",
      startDate: "November 15, 2025",
      endDate: "November 21, 2025",
      duration: "7 days",
      status: "Approved" as const,
      reason: "Birth of child",
      appliedDate: "October 20, 2025",
    },
    {
      id: 7,
      leaveType: "Vacation Leave",
      startDate: "October 30, 2025",
      endDate: "October 31, 2025",
      duration: "2 days",
      status: "Rejected" as const,
      reason: "Personal matters - insufficient leave balance",
      appliedDate: "October 25, 2025",
    },
    {
      id: 8,
      leaveType: "Bereavement Leave",
      startDate: "October 10, 2025",
      endDate: "October 12, 2025",
      duration: "3 days",
      status: "Approved" as const,
      reason: "Death in the family",
      appliedDate: "October 9, 2025",
    },
    {
      id: 9,
      leaveType: "Vacation Leave",
      startDate: "September 22, 2025",
      endDate: "September 26, 2025",
      duration: "5 days",
      status: "Approved" as const,
      reason: "Extended weekend trip to Bali",
      appliedDate: "August 15, 2025",
    },
    {
      id: 10,
      leaveType: "Sick Leave",
      startDate: "September 8, 2025",
      endDate: "September 8, 2025",
      duration: "1 day",
      status: "Approved" as const,
      reason: "Dental procedure",
      appliedDate: "September 5, 2025",
    },
    {
      id: 11,
      leaveType: "Vacation Leave",
      startDate: "August 12, 2025",
      endDate: "August 16, 2025",
      duration: "5 days",
      status: "Approved" as const,
      reason: "Summer vacation with family",
      appliedDate: "July 10, 2025",
    },
    {
      id: 12,
      leaveType: "Study Leave",
      startDate: "July 20, 2025",
      endDate: "July 20, 2025",
      duration: "1 day",
      status: "Approved" as const,
      reason: "Professional certification exam",
      appliedDate: "July 1, 2025",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Icon name="menu" size={24} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1 ml-14">
              Track and manage your leave requests
            </p>
          </div>

          {/* Leave Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Leave Balance</div>
              <div className="text-2xl font-bold text-gray-900">15 days</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Used This Year</div>
              <div className="text-2xl font-bold text-blue-600">28 days</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
              <div className="text-2xl font-bold text-orange-600">1</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Upcoming Leaves</div>
              <div className="text-2xl font-bold text-green-600">5 days</div>
            </div>
          </div>

          <LeaveTable records={mockLeaveRecords} />
        </main>
      </div>
    </div>
  );
};

export default LeavesPage;
