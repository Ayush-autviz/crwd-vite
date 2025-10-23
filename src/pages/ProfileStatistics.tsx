"use client";
import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import MembersList from "@/components/members/MembersList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUserFollowers, getUserFollowing, getFavoriteCauses } from "@/services/api/social";
import { getJoinCollective } from "@/services/api/crwd";
import { useAuthStore } from "@/stores/store";
import { Loader2 } from "lucide-react";

// Static data removed - now using API data

const tabs = [
  { label: "Causes", value: "causes" },
  { label: "Following", value: "following" },
  { label: "Followers", value: "followers" },
  { label: "CRWDs", value: "crwds" },
];


export default function ProfileStatistics() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    queryKey: ['followers', id || user?.id],
    queryFn: () => getUserFollowers(id || user?.id?.toString() || ''),
    enabled: !!(id || user?.id),
  });

  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', id || user?.id],
    queryFn: () => getUserFollowing(id || user?.id?.toString() || ''),
    enabled: !!(id || user?.id),
  });

  const { data: causesData, isLoading: causesLoading } = useQuery({
    queryKey: ['favoriteCauses', id || user?.id],
    queryFn: () => getFavoriteCauses(),
    enabled: !!(id || user?.id),
  });

  const { data: collectivesData, isLoading: collectivesLoading } = useQuery({
    queryKey: ['joinCollective', id || user?.id],
    queryFn: () => getJoinCollective(),
    enabled: !!(id || user?.id),
  });

  // Debug logging
  console.log('ProfileStatistics - followersData:', followersData);
  console.log('ProfileStatistics - followingData:', followingData);
  console.log('ProfileStatistics - causesData:', causesData);
  console.log('ProfileStatistics - collectivesData:', collectivesData);

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

  const following = followingData?.results?.map((user: any) => {
    const userData = user.user || user;
    return {
      name: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.name || 'Unknown User',
      username: userData.username || 'unknown',
      avatar: userData.profile_picture || userData.avatar || '',
      connected: userData.is_following || false,
      id: userData.id,
    };
  }) || [];

  const followers = followersData?.results?.map((user: any) => {
    const userData = user.user || user;
    return {
      name: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}` 
        : userData.first_name || userData.name || 'Unknown User',
      username: userData.username || 'unknown',
      avatar: userData.profile_picture || userData.avatar || '',
      connected: userData.is_following || false,
      id: userData.id,
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
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px]">
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
          <>
            {collectivesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading collectives...</span>
              </div>
            ) : filteredCrwds.length > 0 ? (
              filteredCrwds.map((crwd: any) => (
                <div
                  key={crwd.id || crwd.name}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={crwd.avatar} alt={crwd.name} />
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
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px]">
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
          </>
        )}
      </div>
    </main>
  );
}
