"use client";

import React, { useState } from "react";
import RegularNotifications from "./RegularNotifications";
import CommunityUpdates from "./CommunityUpdates";
import { useLocation } from "react-router-dom";

export default function NotificationTabs() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab);
  const [activeTab, setActiveTab] = useState<"notifications" | "community">(
    tab ? tab : "community"
  );

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("community")}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === "community"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Community Updates
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`relative flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === "notifications"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {/* Red dot notification indicator */}
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Notifications
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "notifications" && <RegularNotifications />}
        {activeTab === "community" && <CommunityUpdates />}
      </div>
      <div className="h-10 md:hidden" />
    </div>
  );
}
