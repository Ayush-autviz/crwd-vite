"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "@/services/api/social";
import { Loader2 } from "lucide-react";

interface MembersListProps {
  members: any[];
  isLoading: boolean;
}

const MembersList: React.FC<MembersListProps> = ({ members, isLoading }) => {
  const [search, setSearch] = useState("");
  // const [followStatus, setFollowStatus] = useState<{ [key: number]: boolean }>(
  //   {}
  // );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  console.log('MembersList - members:', members);

  // Filter members based on search query
  const filtered = members?.filter(
    (m) => {
      if (!m?.user) return false;
      const searchLower = search.toLowerCase();
      return (
        m.user.first_name?.toLowerCase().includes(searchLower) ||
        m.user.last_name?.toLowerCase().includes(searchLower) ||
        m.user.username?.toLowerCase().includes(searchLower) ||
        m.user.email?.toLowerCase().includes(searchLower)
      );
    }
  ) || members;

  const followUserMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      // setToastMessage("Followed");
      // setShowToast(true);
    },
    onError: (error) => {
      setToastMessage("Error following user");
      setShowToast(true);
      console.error('Error following user:', error);
    },
  });

  const unfollowUserMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      // setToastMessage("Unfollowed");
      // setShowToast(true);
    },
    onError: (error) => {
      setToastMessage("Error unfollowing user");
      setShowToast(true);
      console.error('Error unfollowing user:', error);
    },
  });

  // const handleFollowToggle = (index: number, member: any) => {
  // const isCurrentlyFollowing = followStatus[index] ?? member?.user?.connected;
  // const newFollowStatus = !isCurrentlyFollowing;

  // setFollowStatus((prev) => ({
  //   ...prev,
  //   [index]: newFollowStatus,
  // }));

  // setToastMessage(newFollowStatus ? "Followed" : "Unfollowed");
  // setShowToast(true);
  // };

  const handleFollowToggle = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowUserMutation.mutate(userId);
    } else {
      followUserMutation.mutate(userId);
    }
  };


  return (
    <>
      <div className="relative mb-4 mt-1 px-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full mt-2 p-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground"
        />
        <Search className="absolute mt-1 left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <ScrollArea className="h-[70vh] no-scrollbar px-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No members found</p>
          </div>
        ) : (
          filtered.map((member: any, index: number) => {
            const userData = member?.user;
            const fullName = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim();
            const userName = userData?.username || 'unknown';
            const profilePic = userData?.profile_picture || '';
            const isFollowing = userData?.is_following || false;

            return (
              <div key={member?.id || index} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={profilePic} />
                    <AvatarFallback>
                      {fullName?.charAt(0)?.toUpperCase() || userName?.charAt(0)?.toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {fullName || userName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{userName}
                    </p>
                  </div>
                </div>
                {userData?.id !== user?.id && (
                  <Button
                    variant="outline"
                    onClick={() => handleFollowToggle(userData?.id?.toString(), isFollowing)}
                    className={`border-0 text-sm mr-2 cursor-pointer hover:text-blue-500 ${isFollowing
                      ? "bg-[#4367FF] text-white"
                      : "bg-[#F0F2FB] text-[#4367FF]"
                      }`}
                    size="sm"
                    disabled={followUserMutation.isPending || unfollowUserMutation.isPending}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </ScrollArea>
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </>
  );
};

export default MembersList;
