import { useState, useEffect } from "react";
import { Plus, Users, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { getCollectives, getJoinCollective } from "@/services/api/crwd";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/store";

const Circles = () => {
  const { user: currentUser, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"my-crwds" | "discover">(
    "my-crwds"
  );


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

  // Auto-switch to discover tab if no joined collectives
  useEffect(() => {
    console.log('Circles - joinCollectiveData:', joinCollectiveData);
    if (!joinCollectiveData?.data) {
      setActiveTab("discover");
    }
  }, [joinCollectiveData]);

  


  return (
    <div className="">
      <ProfileNavbar
        title="CRWD Collectives"
        showMobileMenu={true}
        showDesktopMenu={true}
        showBackButton={true}
        showPostButton={false}
      />

      <div className="md:min-h-screen">
        {/* Header Section */}
        <div className="p-4 md:p-6 text-center flex flex-col items-center">
          {/* <Link to="/create-post" className="w-full flex justify-end">
            <Button variant="outline" className="px-6 py-2 mb-2">
              Post Something
            </Button>
          </Link> */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5 md:mb-2">
            Discover Collectives
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 max-w-lg mx-auto px-4">
            Join communities of people supporting causes together or start your
            own.
          </p>

          {/* Create New Crwd Button */}
          <Link
            to={`/create-crwd`}
            className="flex items-center gap-1.5 md:gap-2 justify-center w-fit bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
            <p> Start a Collective</p>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 md:px-6 lg:px-[20%] mb-4 md:mb-6">
          <div className="flex bg-gray-100 rounded-full p-1 md:p-1.5 gap-0.5">
            <button
              onClick={() => setActiveTab("my-crwds")}
              className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                activeTab === "my-crwds"
                  ? "bg-white text-gray-900"
                  : "text-gray-600"
              }`}
            >
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">My Collectives</span>
              <span className="sm:hidden" style={{ fontSize: '10px' }}>My Collectives</span>
              <span className="ml-0.5">({joinCollectiveData?.data?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                activeTab === "discover"
                  ? "bg-white text-gray-900"
                  : "text-gray-600"
              }`}
            >
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Discover
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 md:px-6">
            {activeTab === "my-crwds" ? (
              <div className="space-y-3 md:space-y-4 pb-12 md:pb-16">
                {/* Loading State */}
                {isLoadingJoinCollective ? (
                  <div className="flex justify-center items-center mt-8 md:mt-10">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {joinCollectiveData?.data?.length > 0 ? (
                      <div className="space-y-3 md:space-y-4">
                        {joinCollectiveData.data.map((collective: any) => {
                          const circle = collective.collective || collective;
                          // Generate consistent color based on collective name
                          const colors = [
                            '#f97316', // orange
                            '#ec4899', // pink
                            '#3b82f6', // blue
                            '#10b981', // green
                            '#f59e0b', // amber
                            '#8b5cf6', // purple
                            '#ef4444', // red
                          ];
                          const colorIndex = (circle.name?.charCodeAt(0) || 0) % colors.length;
                          const circleBgColor = colors[colorIndex];
                          const founderName = circle.created_by 
                            ? `${circle.created_by.first_name || ''} ${circle.created_by.last_name || ''}`.trim() || circle.created_by.username
                            : 'Unknown';
                          
                          return (
                            <Link
                              to={`/groupcrwd/${circle.id}`}
                              key={collective.id}
                              className="flex flex-col p-3 md:p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                            >
                              {/* Collective Icon */}
                              <div
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3"
                                style={{ backgroundColor: circleBgColor }}
                              >
                                <span className="text-lg md:text-xl font-bold text-white">
                                  {circle.name?.charAt(0)?.toUpperCase() || 'C'}
                                </span>
                              </div>

                              <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-1.5">
                                {circle.name}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
                                {circle.description}
                              </p>
                              
                              {/* Founder Info */}
                              {circle.created_by && (
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                                  <Avatar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0">
                                    <AvatarImage src={circle.created_by.profile_picture} alt={founderName} />
                                    <AvatarFallback className="text-[9px] md:text-[10px]">
                                      {founderName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-[10px] md:text-xs text-gray-500">
                                    Founded by {founderName}
                                  </p>
                                </div>
                              )}
                              
                              {/* Supporting nonprofits count */}
                              <p className="text-[10px] md:text-xs text-gray-500">
                                Supporting {circle.causes_count || circle.supported_causes_count || 0} nonprofits
                              </p>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 md:py-8 rounded-lg">
                        <div className="bg-gray-100 p-3 md:p-4 w-fit rounded-full mx-auto">
                          <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                        </div>
                        <p className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4">You haven't joined any collectives yet</p>
                        <p className="text-sm md:text-base text-gray-500 mt-1">Check out the discover tab to join a collective</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
            /* Discover Tab Content */
            <div className="space-y-3 md:space-y-4 pb-12 md:pb-16">
              {collectiveData?.results?.map((circle: any) => {
                // Generate consistent color based on collective name
                const colors = [
                  '#f97316', // orange
                  '#ec4899', // pink
                  '#3b82f6', // blue
                  '#10b981', // green
                  '#f59e0b', // amber
                  '#8b5cf6', // purple
                  '#ef4444', // red
                ];
                const colorIndex = (circle.name?.charCodeAt(0) || 0) % colors.length;
                const circleBgColor = colors[colorIndex];
                const founderName = circle.created_by 
                  ? `${circle.created_by.first_name || ''} ${circle.created_by.last_name || ''}`.trim() || circle.created_by.username
                  : 'Unknown';
                
                return (
                  <Link
                    to={`/groupcrwd/${circle.id}`}
                    key={circle.id}
                    className="flex flex-col p-3 md:p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* Collective Icon */}
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3"
                      style={{ backgroundColor: circleBgColor }}
                    >
                      <span className="text-lg md:text-xl font-bold text-white">
                        {circle.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-1.5">
                      {circle.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
                      {circle.description}
                    </p>
                    
                    {/* Founder Info */}
                    {circle.created_by && (
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                        <Avatar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0">
                          <AvatarImage src={circle.created_by.profile_picture} alt={founderName} />
                          <AvatarFallback className="text-[9px] md:text-[10px]">
                            {founderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-[10px] md:text-xs text-gray-500">
                          Founded by {founderName}
                        </p>
                      </div>
                    )}
                    
                    {/* Supporting nonprofits count */}
                    <p className="text-[10px] md:text-xs text-gray-500">
                      Supporting {circle.causes_count || circle.supported_causes_count || 0} nonprofits
                    </p>
                  </Link>
                );
              })}
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
