"use client";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import MembersList from "@/components/members/MembersList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUserFollowers, getUserFollowing, getFavoriteCauses, getFavoriteCausesByUserId } from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { useAuthStore } from "@/stores/store";
import { Loader2 } from "lucide-react";

// Static data removed - now using API data

const tabs = [
  { label: "Causes", value: "causes" },
  { label: "Following", value: "following" },
  { label: "Followers", value: "followers" },
  { label: "Collectives", value: "crwds" },
];


export default function ProfileStatistics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const tab = searchParams.get("tab") || "causes";
  const [activeTab, setActiveTab] = useState(tab);
  const { user } = useAuthStore();

  // Navigation handlers
  const handleCauseClick = (causeId: number) => {
    navigate(`/cause/${causeId}`);
  };

  const handleCollectiveClick = (collectiveId: number) => {
    navigate(`/groupcrwd/${collectiveId}`);
  };

  // API calls for real data
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId || user?.id],
    queryFn: () => getUserFollowers(userId || user?.id?.toString() || ''),
    enabled: !!(userId || user?.id),
  });

  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId || user?.id],
    queryFn: () => getUserFollowing(userId || user?.id?.toString() || ''),
    enabled: !!(userId || user?.id),
  });

  // const { data: causesData, isLoading: causesLoading } = useQuery({
  //   queryKey: ['favoriteCauses', userId || user?.id],
  //   queryFn: () => getFavoriteCauses(),
  //   enabled: !!(userId || user?.id),
  // });

  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['favoriteCausesByUserId', userId || user?.id],
    queryFn: () => getFavoriteCausesByUserId(userId || user?.id?.toString() || ''),
    enabled: !!(userId || user?.id),
  });



  const { data: collectivesData, isLoading: collectivesLoading } = useQuery({
    queryKey: ['joinCollective', userId || user?.id],
    queryFn: () => getJoinCollective(userId || ''),
    enabled: !!(userId || user?.id),
  });

  // Transform API data to match UI requirements
  const causes = causesData?.results?.map((item: any) => {
    const cause = item.cause || item; // Handle nested cause structure
    return {
      name: cause.name || 'Unknown Cause',
      avatar: cause.image || cause.avatar || '',
      impact: cause.mission || 'Supported',
      id: cause.id,
      description: cause.mission || '',
      category: cause.category || '',
      state: cause.state || '',
      city: cause.city || '',
    };
  }) || [];

  const crwds = collectivesData?.data?.map((item: any) => {
    const collective = item.collective || item; // Handle nested collective structure
    return {
      name: collective.name || 'Unknown Collective',
      avatar: collective.avatar || collective.image || '',
      role: item.role || 'Member',
      id: collective.id,
      description: collective.description || '',
      memberCount: collective.member_count || 0,
      createdBy: collective.created_by || null,
    };
  }) || [];

  const following = followingData?.following?.map((item: any) => {
    const userData = item.followee || item.following || item.user || item;
    // is_following is at the item level, not inside followee
    const isFollowing = item.is_following ?? userData.is_following ?? false;
    return {
      user: {
        id: userData.id,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || 'unknown',
        profile_picture: userData.profile_picture || userData.avatar || '',
        is_following: isFollowing,
      },
      id: item.id,
      name: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.full_name || userData.name || 'Unknown User',
      username: userData.username || 'unknown',
      avatar: userData.profile_picture || userData.avatar || '',
      connected: isFollowing,
      is_following: isFollowing,
    };
  }) || [];

  const followers = followersData?.followers?.map((item: any) => {
    const userData = item.follower || item.user || item;
    // is_following is at the item level, not inside follower
    const isFollowing = item.is_following ?? userData.is_following ?? false;
    return {
      user: {
        id: userData.id,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || 'unknown',
        profile_picture: userData.profile_picture || userData.avatar || '',
        is_following: isFollowing,
      },
      id: item.id,
      name: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.full_name || userData.name || 'Unknown User',
      username: userData.username || 'unknown',
      avatar: userData.profile_picture || userData.avatar || '',
      connected: isFollowing,
      is_following: isFollowing,
    };
  }) || [];

  // Filter functions - using all data since search is not implemented yet
  const filteredCauses = causes;
  const filteredCrwds = crwds;


  return (
    <main className="pb-16 md:pb-0">
      <ProfileNavbar title="Statistics" />
      <div className=" mx-auto py-3 md:py-6 px-2  md:px-6">
        {/* Tab Nav */}
        <div className="flex justify-around border-b   mb-6 items-center">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              className={`flex-1 py-6 px-1 text-center rounded-none border-b cursor-pointer hover:text-blue-500 hover:bg-blue-50 ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground "
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "causes" && (
          <div className="">
            {causesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading causes...</span>
              </div>
            ) : filteredCauses.length > 0 ? (
              filteredCauses.map((cause: any, index: number) => (
                <div key={cause.id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={cause.avatar} />
                      <AvatarFallback>
                        {cause.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="bg-blue-100 px-3 py-1 rounded-sm w-fit">
                        <p className="text-blue-600 text-xs font-semibold">
                          Nonprofit
                        </p>
                      </div>
                      <h3 className="font-medium text-sm mb-1">{cause.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[90%]">
                        {cause.description}
                      </p>

                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button 
                      className="text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      onClick={() => handleCauseClick(cause.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground">No causes found</span>
              </div>
            )}
          </div>
        )}
        {activeTab === "following" && (
          followingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading following...</span>
            </div>
          ) : (
            <MembersList members={following} isLoading={followingLoading} />
          )
        )}
        {activeTab === "followers" && (
          followersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading followers...</span>
            </div>
          ) : (
            <MembersList members={followers} isLoading={followersLoading} />
          )
        )}
        {activeTab === "crwds" && (
         <div className="">
         {collectivesLoading ? (
           <div className="flex items-center justify-center py-8">
             <Loader2 className="w-6 h-6 animate-spin mr-2" />
             <span>Loading collectives...</span>
           </div>
         ) : filteredCrwds.length > 0 ? (
           filteredCrwds.map((crwd: any, index: number) => (
             <div key={crwd.id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
               <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                 <Avatar className="w-10 h-10">
                   <AvatarImage src={crwd.avatar} />
                   <AvatarFallback>
                     {crwd.name.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
                 <div className="min-w-0 flex-1">
                   <div className="bg-green-100 px-3 py-1 rounded-sm w-fit">
                     <p className="text-green-600 text-xs font-semibold">
                       Collective
                     </p>
                   </div>
                   <h3 className="font-medium text-sm mb-1">{crwd.name}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[90%]">
                     {crwd.description}
                   </p>

                 </div>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Button 
                   className="text-white text-xs py-2 px-3 rounded-lg transition-colors"
                   onClick={() => handleCollectiveClick(crwd.id)}
                 >
                   View Details
                 </Button>
               </div>
             </div>
           ))
         ) : (
           <div className="flex items-center justify-center py-8">
             <span className="text-muted-foreground">No collectives found</span>
           </div>
         )}
       </div>
        )}
      </div>
    </main>
  );
}
