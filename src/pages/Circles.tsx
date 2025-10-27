import { useState, useEffect } from "react";
import { Plus, Users, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { getCollectives, getJoinCollective } from "@/services/api/crwd";
import { useQuery } from "@tanstack/react-query";

const Circles = () => {
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
    queryFn: () => getJoinCollective(),
    enabled: true,
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
        <div className="p-6 text-center flex flex-col items-center">
          {/* <Link to="/create-post" className="w-full flex justify-end">
            <Button variant="outline" className="px-6 py-2 mb-2">
              Post Something
            </Button>
          </Link> */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Discover Collectives
          </h1>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Join communities of people supporting causes together or start your
            own.
          </p>

          {/* Create New Crwd Button */}
          <Link
            to={`/create-crwd`}
            className=" flex items-center gap-2 justify-center w-fit bg-green-600 hover:bg-green-700 text-white px-4 py-2    rounded-lg text-base font-semibold shadow-lg"
          >
            <Plus className="" strokeWidth={3} />
            <p> Start a Collective</p>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-6">
          <div className="flex  border-border justify-center">
            <button
              onClick={() => setActiveTab("my-crwds")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "my-crwds"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              My Collectives ({joinCollectiveData?.results?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "discover"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Discover
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6">
            {activeTab === "my-crwds" ? (
              <div className="space-y-6 pb-16">
                {/* Loading State */}
                {isLoadingJoinCollective ? (
                  <div className="flex justify-center items-center mt-10">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <>
                    {joinCollectiveData?.data?.length > 0 ? (
                      <div className="space-y-3">
                        {joinCollectiveData.data.map((collective: any) => (
                          <Link
                            to={`/groupcrwd/${collective.collective?.id}`}
                            
                            key={collective.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-12 w-12 rounded-full flex-shrink-0">
                                <AvatarImage src={collective?.collective?.created_by?.profile_picture} alt={collective.name} />
                                <AvatarFallback>{collective?.collective?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-600 text-xs px-2 py-1"
                                  >
                                    Collective
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 truncate">
                                  {collective?.collective?.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {collective?.collective?.description}
                                </p>
                                {/* <p className="text-xs text-muted-foreground mt-1">
                                  {collective?.collective?.member_count || 0} members
                                </p> */}
                              </div>
                            </div>
                            <Link
                              to={`/groupcrwd/${collective.collective?.id}`}
                              state={{ collectiveData: collective }}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
                            >
                              Learn More
                            </Link>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8  rounded-lg">
                        <div className="bg-muted p-4 w-fit  rounded-full mx-auto">
                          <Users className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold">you haven't joined any collectives yet</p>
                        <p className="text-muted-foreground">Check out the discover tab to join a collective</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
            /* Discover Tab Content */
            <div className="space-y-4 pb-16">
              {collectiveData?.results?.map((circle: any) => (
                <Link
                  to={`/groupcrwd/${circle.id}`}
                  
                  key={circle.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 rounded-full flex-shrink-0">
                      <AvatarImage src={circle.created_by.profile_picture} alt={circle.name} />
                      <AvatarFallback>{circle.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 text-xs px-2 py-1"
                        >
                          collective
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {circle.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {circle.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/groupcrwd/${circle.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Learn More
                  </Link>
                </Link>
              ))}
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
