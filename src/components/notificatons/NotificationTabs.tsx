"use client";

import { useEffect, useState } from "react";
import RegularNotifications from "./RegularNotifications";
import CommunityUpdates from "./CommunityUpdates";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/services/api/notification";
import { useAuthStore } from "@/stores/store";

export default function NotificationTabs() {
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"notifications" | "community">(
    location.state?.tab || "community"
  );

  // Fetch notifications from API
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!currentUser?.id,
  });

  // Listen for changes in location state to update the active tab
  useEffect(() => {
    if (location.state?.tab === "notifications") {
      setActiveTab("notifications");
    } else if (location.state?.tab === "community") {
      setActiveTab("community");
    }
  }, [location.state?.tab]);

  // Check if there are unread notifications for the red dot indicator
  const hasUnreadNotifications = notificationsData?.results?.some(
    (notification: any) => !notification.is_read
  ) || false;

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
          {/* Red dot notification indicator - show only if there are unread notifications */}
          {hasUnreadNotifications && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
          Notifications
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "notifications" && (
          <RegularNotifications 
            notifications={notificationsData?.results || []}
            isLoading={isLoadingNotifications}
          />
        )}
        {activeTab === "community" && <CommunityUpdates />}
      </div>
      <div className="h-10 md:hidden" />
    </div>
  );
}
