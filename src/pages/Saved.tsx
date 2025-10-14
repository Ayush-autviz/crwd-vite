import { useEffect, useState } from "react";
import SavedList from "@/components/saved/SavedList";
import { SavedData } from "@/components/saved/SavedList";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFavoriteCauses, getFavoriteCollectives } from "@/services/api/social";

// Sample data for nonprofits
// const initialNonprofits: SavedData[] = [
//   {
//     avatar: "/redcross.png",
//     title: "The Red Cross",
//     subtitle: "A health organization that provides food to the needy.",
//     type: "nonprofit"
//   },
//   {
//     avatar: "/grocery.jpg",
//     title: "St. Judes",
//     subtitle: "The leading children's health organization that provides food to the needy.",
//     type: "nonprofit"
//   },
//   {
//     avatar: "/redcross.png",
//     title: "Women's Healthcare of Atlanta",
//     subtitle: "We are Atlanta's #1 healthcare organization that provides food to the needy.",
//     type: "nonprofit"
//   },
// ];

// Sample data for collectives
// const initialCollectives: SavedData[] = [
//   {
//     avatar: "/ngo/ngo1.png",
//     title: "Atlanta Food Bank Collective",
//     subtitle: "A collective working together to fight hunger in Atlanta.",
//     type: "collective"
//   },
//   {
//     avatar: "/ngo/ngo2.png",
//     title: "Community Health Initiative",
//     subtitle: "Join our collective effort to improve community health.",
//     type: "collective"
//   },
//   {
//     avatar: "/ngo/ngo3.png",
//     title: "Education for All",
//     subtitle: "A collective dedicated to providing education opportunities.",
//     type: "collective"
//   },
// ];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<'nonprofits' | 'collectives'>('nonprofits');
  const [nonprofits, setNonprofits] = useState<SavedData[]>([]);
  const [collectives, setCollectives] = useState<SavedData[]>([]);
  const [showToast, setShowToast] = useState(false);

  // favorrite nonprofits
  const { data: favoriteNonprofits, isLoading: isLoadingFavoriteNonprofits } = useQuery({
    queryKey: ['favoriteCauses'],
    queryFn: () => getFavoriteCauses(),
    enabled: true,
  });

  // favorrite collectives
  const { data: favoriteCollectives, isLoading: isLoadingFavoriteCollectives } = useQuery({
    queryKey: ['favoriteCollectives'],
    queryFn: () => getFavoriteCollectives(),
    enabled: true,
  });

  console.log(favoriteNonprofits, 'favoriteNonprofits');
  console.log(favoriteCollectives, 'favoriteCollectives');

  const handleRemoveItem = (index: number) => {
    if (activeTab === 'nonprofits') {
      setNonprofits((prevItems) => prevItems.filter((_, i) => i !== index));
    } else {
      setCollectives((prevItems) => prevItems.filter((_, i) => i !== index));
    }
    setShowToast(true);
  };

  const currentItems = activeTab === 'nonprofits' ? nonprofits : collectives;


  useEffect(() => {
    if (activeTab === 'nonprofits') {
      // Map the API response to SavedData format for nonprofits
      const mappedNonprofits = (favoriteNonprofits?.results || []).map((item: any) => {

        return {
          id: item.id,
          avatar: "/redcross.png",
          title: item.cause?.name || "Unknown Cause",
          subtitle: item.cause?.mission || "No description available",
          type: "nonprofit" as const,
          causeId: item.cause?.id,
          createdAt: item.created_at
        };
      });
      setNonprofits(mappedNonprofits);
    } else {
      // Map the API response to SavedData format for collectives
      const mappedCollectives = (favoriteCollectives?.results || []).map((item: any) => ({
        id: item.id,
        avatar: item.collective?.created_by?.profile_picture || "/ngo/ngo1.png",
        title: item.collective?.name || "Unknown Collective",
        subtitle: `${item.collective?.description || "No description available"}`,
        type: "collective" as const,
        collectiveId: item.collective?.id,
        createdAt: item.created_at,
        isJoined: item.collective?.is_joined || false
      }));
      setCollectives(mappedCollectives);
    }
  }, [activeTab, favoriteNonprofits, favoriteCollectives]);


  if (isLoadingFavoriteNonprofits || isLoadingFavoriteCollectives) {
    return <> 
    <ProfileNavbar title="Favorites" />
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
    </>;
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileNavbar title="Favorites" />
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-4 pt-4">
        <Button
          variant={activeTab === 'nonprofits' ? 'default' : 'ghost'}
          className={`flex-1 rounded-none border-b-2 ${
            activeTab === 'nonprofits' 
              ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('nonprofits')}
        >
          Nonprofits
        </Button>
        <Button
          variant={activeTab === 'collectives' ? 'default' : 'ghost'}
          className={`flex-1 rounded-none border-b-2 ${
            activeTab === 'collectives' 
              ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('collectives')}
        >
          Collectives
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        {currentItems.length > 0 ? (
          <SavedList items={currentItems} onRemoveItem={handleRemoveItem} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-2">
              <Heart size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No {activeTab === 'nonprofits' ? 'Nonprofits' : 'Collectives'} Saved
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {activeTab === 'nonprofits' 
                ? "You haven't saved any nonprofits yet. Browse causes to save your favorites!"
                : "You haven't saved any collectives yet. Explore collectives to join and save them!"
              }
            </p>
          </div>
        )}
      </div>

      <Toast
        message="Removed from Favorites"
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
}
