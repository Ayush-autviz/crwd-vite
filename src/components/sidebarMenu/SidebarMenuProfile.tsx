import React from "react";

const SidebarMenuProfile: React.FC = () => (
  <div className="flex items-center gap-3 px-4 py-4">
    <img
      src="https://randomuser.me/api/portraits/women/44.jpg"
      alt="Profile"
      className="w-12 h-12 rounded-full object-cover"
    />
    <div className="flex flex-col">
      <span className="font-semibold text-sm text-gray-900">
        My Name is Mya
      </span>
      <span className="text-xs text-gray-500">Go to your profile</span>
    </div>
  </div>
);

export default SidebarMenuProfile;
