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
        className="flex-1 flex flex-col sm:flex-row items-center justify-center cursor-pointer gap-0 sm:gap-1"
        onClick={() => handleStatsPress("causes")}
      >
        {isLoadingCauses ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <>
            <span className="text-base sm:text-lg font-semibold text-gray-700 text-center">{causes ?? 0}</span>
            <span className="text-sm sm:text-base text-gray-600 text-center">cause{causes !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>
      <div className="w-1 h-1 bg-gray-400 mx-1 sm:mx-2 rounded-full" />
      <button
        className="flex-1 flex flex-col sm:flex-row items-center justify-center cursor-pointer gap-0 sm:gap-1"
        onClick={() => handleStatsPress("crwds")}
      >
        {isLoadingCrwds ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <>
            <span className="text-base sm:text-lg font-semibold text-gray-700 text-center">{crwds ?? 0}</span>
            <span className="text-sm sm:text-base text-gray-600 text-center">collective{crwds !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>
      <div className="w-1 h-1 bg-gray-400 mx-1 sm:mx-2 rounded-full" />
      <button
        className="flex-1 flex flex-col sm:flex-row items-center justify-center cursor-pointer gap-0 sm:gap-1"
        onClick={() => handleStatsPress("followers")}
      >
        {isLoadingFollowers ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <>
            <span className="text-base sm:text-lg font-semibold text-gray-700 text-center">{followers ?? 0}</span>
            <span className="text-sm sm:text-base text-gray-600 text-center">follower{followers !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>
      <div className="w-1 h-1 bg-gray-400 mx-1 sm:mx-2 rounded-full" />
      <button
        className="flex-1 flex flex-col sm:flex-row items-center justify-center cursor-pointer gap-0 sm:gap-1"
        onClick={() => handleStatsPress("following")}
      >
        {isLoadingFollowing ? (
          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-blue-600" />
        ) : (
          <>
            <span className="text-base sm:text-lg font-semibold text-gray-700 text-center">{following ?? 0}</span>
            <span className="text-sm sm:text-base text-gray-600 text-center">following{following !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProfileStats;
