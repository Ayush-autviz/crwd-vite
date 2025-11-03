import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSuggestedCrwds } from "@/services/api/crwd";


interface GroupCrwdSuggestedProps {
  collectiveId?: string;
}

const GroupCrwdSuggested: React.FC<GroupCrwdSuggestedProps> = ({ collectiveId }) => {
  // Fetch suggested CRWDs
  const { data: suggestedData, isLoading, error } = useQuery({
    queryKey: ['suggestedCrwds', collectiveId],
    queryFn: () => getSuggestedCrwds(collectiveId || ''),
    enabled: !!collectiveId,
  });

  // Transform API data to match UI requirements
  // Handle both array and object with results property
  const suggestedCRWDs = Array.isArray(suggestedData) 
    ? suggestedData.map((collective: any) => ({
        id: collective.id,
        name: collective.name || 'Unknown Collective',
        members: collective.member_count || 0,
        description: collective.description || '',
        image: collective.image || collective.avatar || '',
      }))
    : (suggestedData?.results || suggestedData?.data || []).map((collective: any) => ({
        id: collective.id,
        name: collective.name || 'Unknown Collective',
        members: collective.member_count || 0,
        description: collective.description || '',
        image: collective.image || collective.avatar || '',
      }));

  if (isLoading) {
    return (
      <div className="mt-4 px-4">
        <h2 className="text-lg font-semibold mb-4">Suggested CRWDS</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading suggested collectives...</span>
        </div>
      </div>
    );
  }

  if (error || !suggestedCRWDs || suggestedCRWDs.length === 0) {
    return null; // Don't show the section if there's an error or no data
  }

  return (
  <div className="mt-4 px-4">
    <h2 className="text-lg font-semibold mb-4">Suggested CRWDS</h2>
    {/* <div className="space-y-3">
    {suggestedCauses.map((cause, index) => (
      <Link to="/groupcrwd" key={index} className="block">
        <div
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card"
        >
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
              {cause.image && (
                <img
                  src={cause.image}
                  alt={cause.name}
                  className="object-cover"
                />
              )}
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">
                {cause.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {cause.description}
              </p>
            </div>
          </div>
          <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
            Visit
          </Button>
        </div>
      </Link>
    ))}
  </div> */}

    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 w-max">
        {suggestedCRWDs.map((crwd, index) => (
          <Link to={`/groupcrwd/${crwd.id}`} key={crwd.id || index} className="block">
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors bg-gray-50 min-w-[200px]">
              {/* Image on top */}
              <Avatar className="w-16 h-16">
                <AvatarImage src={crwd.image} alt={crwd.name} />
                <AvatarFallback className="bg-green-100 text-green-600">
                  {crwd.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Text content below image */}
              <div className="text-center">
                <h3 className="font-medium text-sm mb-1">{crwd.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {crwd.members} {crwd.members === 1 ? 'Member' : 'Members'}
                </p>
                <p className="text-xs text-muted-foreground w-36 leading-relaxed">
                  {crwd.description.length > 21
                    ? `${crwd.description.slice(0, 21)}..`
                    : crwd.description}
                </p>
              </div>

              {/* Button at the bottom */}
              <Button className="bg-green-600 text-white text-xs py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Learn More
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* <div className="flex justify-end mt-4">
      <Link to="/search" state={{ discover: true }}>
        <Button variant="link" className="text-primary flex items-center">
          Discover More <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div> */}
  </div>
  );
};

export default GroupCrwdSuggested;
