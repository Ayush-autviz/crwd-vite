"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProfileStatsProps {
  causes: number;
  crwds: number;
  followers: number;
  following: number;
  profileId: string; // Pass the profile id as a prop
  isLoadingCauses?: boolean;
  isLoadingCrwds?: boolean;
  isLoadingFollowers?: boolean;
  isLoadingFollowing?: boolean;
  onStatPress?: (tab: 'causes' | 'following' | 'followers' | 'crwds') => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  causes,
  crwds,
  followers,
  following,
  profileId,
  isLoadingCauses = false,
  isLoadingCrwds = false,
  isLoadingFollowers = false,
  isLoadingFollowing = false,
  onStatPress,
}) => {
  const navigate = useNavigate();

  const handleStatsPress = (tab: 'causes' | 'following' | 'followers' | 'crwds') => {
    if (onStatPress) {
      onStatPress(tab);
    } else {
      navigate(`/profile/statistics?userId=${profileId}&tab=${tab}`);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center py-3 md:py-4 mt-4 md:mt-6">
      <button
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => handleStatsPress("causes")}
      >
        {isLoadingCauses ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <div className="flex flex-row items-center gap-0.5 md:gap-1">
            <span className="text-[10px] md:text-xs lg:text-sm font-semibold text-[#595959] text-center">{causes ?? 0}</span>
            <span className="text-[10px] md:text-xs lg:text-sm text-[#595959] text-center font-semibold">Causes</span>
          </div>
        )}
      </button>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-[#595959] mx-0.5 md:mx-1 lg:mx-2 rounded-full" />
      <button
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => handleStatsPress("crwds")}
      >
        {isLoadingCrwds ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <div className="flex flex-row items-center gap-0.5 md:gap-1">
            <span className="text-[10px] md:text-xs lg:text-sm font-semibold text-[#595959] text-center">{crwds ?? 0}</span>
            <span className="text-[10px] md:text-xs lg:text-sm text-[#595959] text-center font-semibold">Collectives</span>
          </div>
        )}
      </button>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-[#595959] mx-0.5 md:mx-1 lg:mx-2 rounded-full" />
      <button
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => handleStatsPress("followers")}
      >
        {isLoadingFollowers ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <div className="flex flex-row items-center gap-0.5 md:gap-1">
            <span className="text-[10px] md:text-xs lg:text-sm font-semibold text-[#595959] text-center">{followers ?? 0}</span>
            <span className="text-[10px] md:text-xs lg:text-sm text-[#595959] text-center font-semibold">Followers</span>
          </div>
        )}
      </button>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-[#595959] mx-0.5 md:mx-1 lg:mx-2 rounded-full" />
      <button
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => handleStatsPress("following")}
      >
        {isLoadingFollowing ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <div className="flex flex-row items-center gap-0.5 md:gap-1">
            <span className="text-[10px] md:text-xs lg:text-sm font-semibold text-[#595959] text-center">{following ?? 0}</span>
            <span className="text-[10px] md:text-xs lg:text-sm text-[#595959] text-center font-semibold">Following</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ProfileStats;
