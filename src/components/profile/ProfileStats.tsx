"use client";
import React from "react";
import { useNavigate } from "react-router-dom";

interface ProfileStatsProps {
  causes: number;
  crwds: number;
  followers: number;
  following: number;
  profileId: string; // Pass the profile id as a prop
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  causes,
  crwds,
  followers,
  following,
  profileId,
}) => {
  const navigate = useNavigate();

  const goToStats = (activeTab: string) => {
    navigate(`/profile/statistics?userId=${profileId}&tab=${activeTab}`);
  };

  return (
    <div className="flex justify-between text-center divide-x-2 divide-gray-200  rounded-md">
      <div
        className="flex-1 cursor-pointer hover:bg-gray-50 py-1 transition-colors rounded-l-md flex flex-col items-center"
        onClick={() => goToStats("causes")}
      >
        <div className="font-bold text-lg">{causes ?? 0}</div>
        <div className="text-xs text-gray-500 flex items-center">Causes</div>
      </div>
      <div
        className="flex-1 cursor-pointer hover:bg-gray-50 py-1 transition-colors flex flex-col items-center"
        onClick={() => goToStats("crwds")}
      >
        <div className="font-bold text-lg">{crwds ?? 0}</div>
        <div className="text-xs text-gray-500 flex items-center">Collectives</div>
      </div>
      <div
        className="flex-1 cursor-pointer hover:bg-gray-50 py-1 transition-colors flex flex-col items-center"
        onClick={() => goToStats("followers")}
      >
        <div className="font-bold text-lg">{followers ?? 0}</div>
        <div className="text-xs text-gray-500 flex items-center">Followers</div>
      </div>
      <div
        className="flex-1 cursor-pointer hover:bg-gray-50 py-1 transition-colors rounded-r-md flex flex-col items-center"
        onClick={() => goToStats("following")}
      >
        <div className="font-bold text-lg">{following ?? 0}</div>
        <div className="text-xs text-gray-500 flex items-center">Following</div>
      </div>
    </div>
  );
};

export default ProfileStats;
