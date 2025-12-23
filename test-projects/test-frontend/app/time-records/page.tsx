"use client";

import { useState } from "react";
import { Sidebar, TimeRecordTable } from "@/components/organisms";
import { Icon } from "@/components/atoms";

const TimeRecordsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sample data matching the image
  const mockRecords = [
    {
      id: 1,
      date: "December 23, 2025",
      status: "Present" as const,
      timeIn: "09:25 PST",
      timeOut: "N/A",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 2,
      date: "December 22, 2025",
      status: "Present" as const,
      timeIn: "09:30 PST",
      timeOut: "18:44 PST",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "9:14",
      late: 0,
      undertime: 0,
      overtime: 0,
      hasAlert: true,
    },
    {
      id: 3,
      date: "December 21, 2025",
      status: "Rest Day" as const,
      timeIn: "N/A",
      timeOut: "N/A",
      startTime: "00:00 PST",
      endTime: "00:00 PST",
      workHours: "",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 4,
      date: "December 20, 2025",
      status: "Rest Day" as const,
      timeIn: "N/A",
      timeOut: "N/A",
      startTime: "00:00 PST",
      endTime: "00:00 PST",
      workHours: "",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 5,
      date: "December 19, 2025",
      status: "Present" as const,
      timeIn: "09:28 PST",
      timeOut: "18:31 PST",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "9:03",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 6,
      date: "December 18, 2025",
      status: "Present" as const,
      timeIn: "10:06 PST",
      timeOut: "18:51 PST",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "8:45",
      late: 36,
      undertime: 0,
      overtime: 0,
      hasAlert: true,
    },
    {
      id: 7,
      date: "December 17, 2025",
      status: "Present" as const,
      timeIn: "09:30 PST",
      timeOut: "18:36 PST",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "9:06",
      late: 0,
      undertime: 0,
      overtime: 0,
      hasAlert: true,
    },
    {
      id: 8,
      date: "December 16, 2025",
      status: "Present" as const,
      timeIn: "09:29 PST",
      timeOut: "19:28 PST",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "9:58",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 9,
      date: "December 15, 2025",
      status: "Absent" as const,
      timeIn: "N/A",
      timeOut: "N/A",
      startTime: "09:30 PST",
      endTime: "18:30 PST",
      workHours: "",
      late: 0,
      undertime: 0,
      overtime: 0,
    },
    {
      id: 10,
      date: "December 14, 2025",
      status: "Rest Day" as const,
      timeIn: "N/A",
      timeOut: "N/A",
      startTime: "00:00 PST",
      endTime: "00:00 PST",
      workHours: "",
      late: 0,
      undertime: 0,
      overtime: 0,
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Icon name="menu" size={24} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Daily Time Record</h1>
            </div>
          </div>
          <TimeRecordTable records={mockRecords} />
        </main>
      </div>
    </div>
  );
};

export default TimeRecordsPage;
