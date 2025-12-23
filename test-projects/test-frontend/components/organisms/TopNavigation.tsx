"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/atoms";

interface TopNavigationProps {
  onMenuClick: () => void;
  pageTitle: string;
}

export const TopNavigation = ({ onMenuClick, pageTitle }: TopNavigationProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlay = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    setTime(0);
  };

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
          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-800 hidden sm:inline">
              {formatTime(time)}
            </span>
            <span className="text-sm font-semibold text-gray-800 sm:hidden">
              {formatTime(time)}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePlay}
                className="p-1.5 sm:p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                aria-label="Start timer"
              >
                <Icon name="play" size={16} className="text-white" />
              </button>
              <button
                onClick={handlePause}
                className="p-1.5 sm:p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors"
                aria-label="Pause timer"
              >
                <Icon name="pause" size={16} className="text-white" />
              </button>
              <button
                onClick={handleStop}
                className="p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                aria-label="Stop timer"
              >
                <Icon name="stop" size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Icon name="bell" size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Icon name="user" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
