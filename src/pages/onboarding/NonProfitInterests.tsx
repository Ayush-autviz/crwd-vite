import React, { useState } from "react";
import { Check, Search, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/constants/categories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCausesBySearch } from "@/services/api/crwd";
import { bulkAddCauseFavorites, getFavoriteCauses } from "@/services/api/social";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


export default function NonProfitInterests() {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allCauses, setAllCauses] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Get favorite causes to exclude from results
  const { data: favoriteCauses } = useQuery({
    queryKey: ['favoriteCauses'],
    queryFn: () => getFavoriteCauses(),
    enabled: true,
  });

  // Get causes with search and category filtering
  const { data: causesData, isLoading: isCausesLoading } = useQuery({
    queryKey: ['causes', selectedCategory, searchTrigger, currentPage, searchQuery],
    queryFn: () => {
      return getCausesBySearch(searchQuery, selectedCategory, currentPage);
    },
    enabled: true,
    // Always fetch on mount to load initial causes
    staleTime: 0,
  });

  const { mutate: bulkAddCauseFavoritesMutation } = useMutation({
    mutationFn: (causeIds: string[]) => bulkAddCauseFavorites(causeIds),
    onSuccess: () => {
      // Invalidate favorite causes query so CreateCrwd shows updated favorites
      queryClient.invalidateQueries({ queryKey: ['favoriteCauses'] });
      navigate("/create-crwd");
      setShowToast(true);
      setToastMessage("Causes added to favorites");
    },
    onError: () => {
      setShowToast(true);
      setToastMessage("Failed to add causes to favorites");
    },
  });

  // Handle API response and accumulate results, filtering out favorite causes
  React.useEffect(() => {
    if (causesData?.results) {
      // Get favorite cause IDs to exclude from results
      const favoriteCauseIds = new Set(
        (favoriteCauses?.results || [])
          .map((fav: any) => {
            const id = fav.cause?.id;
            return id ? String(id) : null;
          })
          .filter((id: any) => id !== null)
      );

      // Filter out favorite causes from search results
      const filteredCauses = causesData.results.filter((cause: any) => {
        const causeId = cause?.id ? String(cause.id) : null;
        return causeId && !favoriteCauseIds.has(causeId);
      });

      if (currentPage === 1) {
        // Reset causes for new search/category
        setAllCauses(filteredCauses);
      } else {
        // Append new results for load more
        setAllCauses(prev => [...prev, ...filteredCauses]);
      }
    }
  }, [causesData, currentPage, favoriteCauses]);

  // Reset page when search or category changes
  React.useEffect(() => {
    setCurrentPage(1);
    setAllCauses([]);
  }, [searchTrigger]);

  // Ensure causes load on initial mount
  React.useEffect(() => {
    // Trigger initial load if we haven't triggered a search yet
    // This ensures causes are loaded when navigating from CreateCrwd
    if (searchTrigger === 0) {
      setSearchTrigger(1);
    }
  }, []); // Run only on mount

  const handleInterestSelect = (interestId: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };



  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Trigger API call with search query
      setSelectedInterests([]);
      setSearchTrigger(prev => prev + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Don't trigger API call on every keystroke
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleContinue = () => {

    bulkAddCauseFavoritesMutation(selectedInterests.map(id => id.toString()));
  };

  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to find causes that fit you
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sign in to view your profile, manage your causes, and connect with your community.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to="/onboarding" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Don't have an account? 
            <Link to="/claim-profile" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const InterestCard = ({
    interest,
  }: {
    interest: { id: number, image?: string, logo?: string, name: string };
  }) => {
    const isSelected = selectedInterests.includes(interest.id);

    return (
      <button
        className={`p-2 md:p-3 w-full aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${isSelected
            ? "border-blue-500 shadow-lg"
            : "border-gray-200 shadow-md hover:shadow-lg"
          }`}
        onClick={() => handleInterestSelect(interest.id)}
      >
        <div className="w-4/5 h-12 md:h-16 mx-auto mb-2 md:mb-3 flex items-center justify-center">
          <Avatar className="w-full h-full rounded-lg">
            <AvatarImage src={interest.image || interest.logo} alt={interest.name} className="object-contain rounded-lg" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg md:text-xl font-semibold w-full h-full flex items-center justify-center rounded-lg">
              {interest.name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="p-1 md:p-2">
          <h3 className="text-xs md:text-sm font-medium text-gray-800 text-center leading-tight">
            {interest.name}
          </h3>
        </div>

        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute top-1 md:top-2 left-1 md:left-2">
            <div className="w-4 md:w-5 h-4 md:h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Check size={12} className="text-white md:w-3.5 md:h-3.5" />
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-lg">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4 md:p-8 space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-black rounded-full"></div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Find causes that fit you
                </h1>
                <p className="text-gray-600 text-sm">
                  Choose at least 1 to start. You can add more anytime.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search causes or nonprofits (press Enter to search)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchSubmit}
                  className="w-full h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setSelectedInterests([]);
                      setSelectedCategory(
                        selectedCategory === category.id ? "" : category.id
                      )
                    }}
                    className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${selectedCategory === category.name
                        ? "text-white"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                    style={{
                      backgroundColor: selectedCategory === category.name
                        ? category.text
                        : category.background,
                      color: selectedCategory === category.name
                        ? "white"
                        : category.text
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Interests Grid */}

              <div>
                {isCausesLoading ? (
                  <div className="h-10 text-center flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : allCauses.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {allCauses.map((interest: any, index: number) => (
                      <div key={index} className="relative">
                        <InterestCard interest={interest} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-10 text-center">No causes found</div>
                )}
              </div>

              {/* Load More Button */}
              {causesData?.next && (
                <div className="text-center">
                  <button onClick={handleLoadMore} className="text-blue-500">Load More</button>
                </div>
              )}



              {/* Selection Summary */}
              {selectedInterests.length > 0 && (
                <div className="text-center min-h-[24px]">
                  <p className="text-sm text-gray-600">
                    You've chosen {selectedInterests.length} cause
                    {selectedInterests.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <div className="pt-2 md:pt-4">
                <button
                  className={`w-full h-10 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${selectedInterests.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  onClick={handleContinue}
                  disabled={selectedInterests.length === 0}
                >
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />

    </div>
  );
}
