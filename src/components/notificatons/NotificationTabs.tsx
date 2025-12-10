"use client";

import { useEffect, useState } from "react";
import RegularNotifications from "./RegularNotifications";
import CommunityUpdates from "./CommunityUpdates";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsAsRead } from "@/services/api/notification";
import { useAuthStore } from "@/stores/store";
import { queryClient } from "@/lib/react-query/client";

export default function NotificationTabs() {
  const location = useLocation();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"notifications" | "community">(
    location.state?.tab || "notifications"
  );

  // Fetch notifications from API
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!currentUser?.id,
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Also invalidate unread count to refresh hamburger menu and profile navbar
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Listen for changes in location state to update the active tab
  useEffect(() => {
    if (location.state?.tab === "notifications") {
      setActiveTab("notifications");
    } else if (location.state?.tab === "community") {
      setActiveTab("community");
    }
  }, [location.state?.tab]);

  // Filter notifications by type
  const personalNotifications = (notificationsData?.results || []).filter(
    (notification: any) => notification.type === "personal"
  );

  const communityNotifications = (notificationsData?.results || []).filter(
    (notification: any) => notification.type === "community" || notification.type === "community_post"
  );

  // Check if there are unread personal notifications for the red dot indicator
  const hasUnreadNotifications = personalNotifications.some(
    (notification: any) => !notification.is_read
  ) || false;

  useEffect(() => {
    if (currentUser?.id && notificationsData?.results?.length > 0) {
      markAllNotificationsAsReadMutation.mutate();
    }
  }, [location.pathname]); 

  return (
    <div className="w-full">
      {/* Tab Headers */}
      {/* <div className="flex border-b border-gray-200">
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
          Notifications
        </button>
      </div> */}

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "notifications" && (
          <RegularNotifications 
            notifications={personalNotifications}
            isLoading={isLoadingNotifications}
          />
        )}
        {activeTab === "community" && (
          <CommunityUpdates 
            notifications={communityNotifications}
            isLoading={isLoadingNotifications}
          />
        )}
      </div>
      <div className="h-8 md:h-10" />
    </div>
  );
}
