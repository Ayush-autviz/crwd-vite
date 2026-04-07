import { useState, useEffect } from "react";
import { Plus, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { getCollectives, getJoinCollective } from "@/services/api/crwd";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Circles = () => {
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"my-crwds" | "discover">("my-crwds");

  const { data: collectiveData } = useQuery({
    queryKey: ['circles'],
    queryFn: () => getCollectives(),
    enabled: true,
  });

  const { data: joinCollectiveData, isLoading: isLoadingJoinCollective } = useQuery({
    queryKey: ['join-collective'],
    queryFn: () => getJoinCollective(currentUser?.id),
    enabled: !!token?.access_token && !!currentUser?.id,
  });

  useEffect(() => {
    if (joinCollectiveData?.data && joinCollectiveData.data.length === 0) {
      setActiveTab("discover");
    }
  }, [joinCollectiveData]);

  const joinedCollectiveIds = new Set(
    joinCollectiveData?.data?.map((item: any) => (item.collective || item).id) || []
  );

  // Single component to render items
  const GroupItem = ({
    circle,
    isStartAction = false
  }: {
    circle?: any;
    isStartAction?: boolean;
  }) => {
    if (isStartAction) {
      return (
        <Link
          to="/create-crwd"
          className="flex items-center gap-4 py-4 px-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
        >
          <Avatar className="w-12 h-12 rounded-lg">
            <AvatarImage src={currentUser?.profile_picture} />
            <AvatarFallback className="text-white text-lg rounded-lg font-bold" style={{ backgroundColor: currentUser?.color }}>{currentUser?.first_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">Start a Giving Group</h3>
            <p className="text-sm text-gray-500 font-medium truncate">Bring people together around causes you care about</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </Link>
      );
    }

    const name = circle.name || "Unnamed Group";
    const initials = name.split(" ").map((w: any) => w[0]).join("").substring(0, 1).toUpperCase();

    // Mock data for demo UI matching the image
    const nonprofitCount = circle.causes_count || circle.supported_causes_count || 0;
    const memberCount = circle.member_count || circle.members_count || 0;

    return (
      <Link
        to={`/g/${circle.sort_name}`}
        className="flex items-center gap-4 py-4 px-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-none"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-lg">
              <AvatarImage src={circle.logo} />
              <AvatarFallback className="text-white text-lg rounded-lg font-bold" style={{ backgroundColor: circle.color }}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-tight truncate">{name}</h3>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-base sm:text-base text-gray-600 font-medium">
                  {nonprofitCount} nonprofit{nonprofitCount !== 1 ? 's' : ''} · {memberCount} member{memberCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      </Link>
    );
  };

  const myGroups = joinCollectiveData?.data?.map((item: any) => item.collective || item) || [];
  const discoverGroups = collectiveData?.results?.filter((c: any) => !joinedCollectiveIds.has(c.id)) || [];

  const CircleSkeleton = () => (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-200 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-5 h-5 bg-gray-100 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-xl text-foreground flex-1">


            Groups</h1>
        </div>
        <Link
          to="/create-crwd"
          className="w-9 h-9 rounded-full border-2 border-[#2222EE] flex items-center justify-center text-[#2222EE] hover:bg-[#2222EE] hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-0">
          <button
            onClick={() => setActiveTab("my-crwds")}
            className={cn(
              "flex-1 py-4 text-lg font-medium transition-all relative",
              activeTab === "my-crwds" ? "text-[#2222EE]" : "text-gray-500"
            )}
          >
            My Groups {myGroups.length > 0 && <span>{myGroups.length}</span>}
            {activeTab === "my-crwds" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2222EE]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={cn(
              "flex-1 py-4 text-lg font-medium transition-all relative",
              activeTab === "discover" ? "text-[#2222EE]" : "text-gray-500"
            )}
          >
            Discover
            {activeTab === "discover" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2222EE] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Groups List */}
        <div className="pb-24">
          {activeTab === "my-crwds" ? (
            <>
              <GroupItem isStartAction />
              {isLoadingJoinCollective ? (
                Array(5).fill(0).map((_, i) => <CircleSkeleton key={i} />)
              ) : (
                <>
                  {myGroups.map((group: any) => (
                    <GroupItem key={group.id} circle={group} />
                  ))}
                  {myGroups.length === 0 && (
                    <div className="text-center py-20 px-6">
                      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h3>
                      <p className="text-gray-500 font-medium">Join a group from the discover tab or start your own!</p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="divide-y divide-gray-100">
              <GroupItem isStartAction />
              {isLoadingJoinCollective || (activeTab === 'discover' && !collectiveData) ? (
                Array(5).fill(0).map((_, i) => <CircleSkeleton key={i} />)
              ) : (
                discoverGroups.map((group: any) => (
                  <GroupItem key={group.id} circle={group} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Circles; 