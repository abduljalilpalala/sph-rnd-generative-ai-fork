"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/atoms";
import { useAuth } from "@/hooks/useAuth";

interface TopNavigationProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export const TopNavigation = ({ onMenuClick, pageTitle }: TopNavigationProps) => {
  const { handleLogout, user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Icon name="menu" size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Info */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span>{user.email}</span>
            </div>
          )}
          {/* User Actions */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Icon name="bell" size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Icon name="user" size={20} className="text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <Icon name="logout" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
