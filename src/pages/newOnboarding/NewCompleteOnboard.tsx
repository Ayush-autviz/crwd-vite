
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Heart, Sparkles, Search, Check, Loader2, ArrowRight, Users, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSurpriseMe, getCausesBySearch, getCollectiveById, joinCollective, leaveCollective } from "@/services/api/crwd";
import { getCollectivesByCauseCategory } from "@/services/api/social";
import { createDonationBox } from "@/services/api/donation";
import { toast } from "sonner";
import { categories } from "@/constants/categories";
import { truncateAtFirstPeriod } from "@/lib/utils";

type ViewType = 'initial' | 'surprise' | 'browse' | 'collective' | 'success';

// Get consistent color for avatar
const avatarColors = [
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return 'N';
  return name.charAt(0).toUpperCase();
};

export default function NewCompleteOnboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('initial');
  const [previousView, setPreviousView] = useState<ViewType>('initial');
  const [selectedCauses, setSelectedCauses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectiveIds, setSelectedCollectiveIds] = useState<string[]>([]);
  const [expandedCollectiveIds, setExpandedCollectiveIds] = useState<string[]>([]);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isProcessingCollectives, setIsProcessingCollectives] = useState(false);
  const [addedNonprofitsCount, setAddedNonprofitsCount] = useState(0);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
  const [collectivePreparedCauses, setCollectivePreparedCauses] = useState<any[]>([]);

  // Get selected categories from navigation state
  const selectedCategoryIds = (location.state?.selectedCategories as string[]) || [];
  const selectedCategoryObjects = selectedCategoryIds
    .map((id) => categories.find((cat) => cat.id === id))
    .filter((cat) => cat !== undefined);

  // Fetch surprise me causes
  const { data: surpriseData, isLoading: isLoadingSurprise, refetch: refetchSurprise } = useQuery({
    queryKey: ['surprise-me-onboard', selectedCategoryIds],
    queryFn: () => getSurpriseMe(selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined),
    enabled: view === 'surprise',
  });

  // Fetch causes for browse/search
  const { data: browseData, isLoading: isLoadingBrowse } = useQuery({
    queryKey: ['browse-causes', searchQuery, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: view === 'browse',
    refetchOnMount: true,
  });

  // Fetch collectives
  const { data: collectivesData, isLoading: isLoadingCollectives } = useQuery({
    queryKey: ['collectives', selectedCategoryIds],
    queryFn: () => getCollectivesByCauseCategory(selectedCategoryIds),
    enabled: view === 'collective',
  });

  // Create donation box mutation
  const createBoxMutation = useMutation({
    mutationFn: async (data: any) => {
      return await createDonationBox(data);
    },
    onSuccess: () => {
      // toast.success('Donation box created!');
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      // navigate('/'); // Navigation is now handled in specific functions
    },
    onError: (error: any) => {
      console.error("Mutation Error:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create donation box';
      toast.error(errorMessage);
    },
  });

  // Join collective mutation
  const joinCollectiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await joinCollective(id);
    },
    onSuccess: () => {
      // toast.success('Joined collective successfully!');
      queryClient.invalidateQueries({ queryKey: ['collectives'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to join collective');
    },
  });

  // Leave collective mutation
  const leaveCollectiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await leaveCollective(id);
    },
    onSuccess: () => {
      // toast.success('Left collective successfully');
      queryClient.invalidateQueries({ queryKey: ['collectives'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to leave collective');
    },
  });

  // Handle surprise causes data
  useEffect(() => {
    if (surpriseData && view === 'surprise') {
      let causes: any[] = [];
      if (Array.isArray(surpriseData)) {
        causes = surpriseData;
      } else if (surpriseData.data && Array.isArray(surpriseData.data)) {
        causes = surpriseData.data;
      } else if (surpriseData.results && Array.isArray(surpriseData.results)) {
        causes = surpriseData.results;
      }
      // Auto-select all 5 causes
      setSelectedCauses(causes.slice(0, 5).map((cause: any) => cause.id));
    }
  }, [surpriseData, view]);

  // Handle collectives data initialization
  useEffect(() => {
    if (collectivesData) {
      const results = collectivesData.results || collectivesData || [];
      if (Array.isArray(results)) {
        const joinedIds = results
          .filter((c: any) => c.is_joined === true)
          .map((c: any) => String(c.id || c.pk || c.uuid));

        if (joinedIds.length > 0) {
          setSelectedCollectiveIds(prev => {
            // Merge new joined IDs with existing ones, avoiding duplicates
            const uniqueIds = new Set([...prev, ...joinedIds]);
            return Array.from(uniqueIds);
          });
        }
      }
    }
  }, [collectivesData]);

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);
    try {
      await queryClient.fetchQuery({
        queryKey: ['surprise-me-onboard', selectedCategoryIds],
        queryFn: () => getSurpriseMe(selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined),
      });
      setView('surprise');
    } catch (error) {
      toast.error("Failed to load suggestions");
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  const handleJoinCollective = async () => {
    setIsJoinLoading(true);
    try {
      await queryClient.fetchQuery({
        queryKey: ['collectives', selectedCategoryIds],
        queryFn: () => getCollectivesByCauseCategory(selectedCategoryIds),
      });
      setView('collective');
    } catch (error) {
      toast.error("Failed to load collectives");
    } finally {
      setIsJoinLoading(false);
    }
  };

  const handleBrowseSearch = async () => {
    setIsBrowseLoading(true);
    try {
      await queryClient.fetchQuery({
        queryKey: ['browse-causes', searchQuery, searchTrigger],
        queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
      });
      setView('browse');
    } catch (error) {
      toast.error("Failed to load causes");
    } finally {
      setIsBrowseLoading(false);
    }
  };

  const handleChangeMethod = () => {
    setView('initial');
    setSelectedCauses([]);
    setSelectedCollectiveIds([]);
  };

  const handlePickDifferent = () => {
    refetchSurprise();
  };

  const handleCauseToggle = (causeId: number) => {
    setSelectedCauses((prev) => {
      if (prev.includes(causeId)) {
        return prev.filter((id) => id !== causeId);
      } else {
        return [...prev, causeId];
      }
    });
  };

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  const handleStartWithNonprofits = () => {
    if (selectedCauses.length > 0) {
      setAddedNonprofitsCount(selectedCauses.length);
      setPreviousView(view);
      setView('success');
    } else {
      navigate(redirectTo);
    }
  };

  const handleJoinCollectiveAction = (collective: any) => {
    // Robustly get the ID, handling potential variations
    const rawId = collective.id || collective.pk || collective.uuid;
    if (!rawId) {
      console.error("Collective has no ID:", collective);
      return;
    }
    const collectiveId = String(rawId);

    const isJoined = selectedCollectiveIds.includes(collectiveId);

    if (isJoined) {
      leaveCollectiveMutation.mutate(collectiveId);
    } else {
      joinCollectiveMutation.mutate(collectiveId);
    }

    setSelectedCollectiveIds((prev) => {
      if (prev.includes(collectiveId)) {
        return prev.filter((id) => id !== collectiveId);
      } else {
        return [...prev, collectiveId];
      }
    });
  };

  const toggleCollectiveExpansion = (collectiveId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCollectiveIds((prev) => {
      if (prev.includes(collectiveId)) {
        return prev.filter((id) => id !== collectiveId);
      } else {
        return [...prev, collectiveId];
      }
    });
  };

  const handleContinueWithCollective = async () => {
    // Logic to proceed with selected collectives
    if (selectedCollectiveIds.length === 0) return;

    setIsProcessingCollectives(true);
    try {
      const allCauses: any[] = [];

      // Fetch details for each selected collective to get their causes
      for (const collectiveId of selectedCollectiveIds) {
        try {
          const collectiveDetails = await getCollectiveById(collectiveId.toString());
          if (collectiveDetails && collectiveDetails.causes) {
            // collectiveDetails.causes might be array of objects with { cause: { id, ... } } or just { id, ... }
            collectiveDetails.causes.forEach((c: any) => {
              const causeId = c.cause?.id || c.id;
              if (causeId) {
                // Check if cause is already added to avoid duplicates
                if (!allCauses.some(existing => existing.cause_id === causeId)) {
                  allCauses.push({
                    cause_id: causeId,
                    attributed_collective: collectiveId
                  });
                }
              }
            });
          }
        } catch (err) {
          console.error(`Failed to fetch details for collective ${collectiveId}`, err);
        }
      }

      if (allCauses.length > 0) {
        setAddedNonprofitsCount(allCauses.length);
        setCollectivePreparedCauses(allCauses);
        setIsProcessingCollectives(false);
        setPreviousView(view);
        setView('success');
      } else {
        // toast.error("No nonprofits found in selected collectives.");
        setIsProcessingCollectives(false);
      }
    } catch (error) {
      console.error("Error processing collectives", error);
      toast.error("Failed to process selected collectives");
      setIsProcessingCollectives(false);
    }
  };

  const handleEditCategories = () => {
    navigate('/non-profit-interests');
  };

  const handleSkip = () => {
    setAddedNonprofitsCount(0);
    setPreviousView(view);
    setView('success');
  };

  const handleFinalContinue = () => {
    if (addedNonprofitsCount === 0) {
      navigate(redirectTo);
      return;
    }

    const causesBody = previousView === 'collective'
      ? collectivePreparedCauses
      : selectedCauses.map(id => ({ cause_id: id }));

    console.log("causesBody", causesBody);

    createBoxMutation.mutate({
      monthly_amount: "10",
      causes: causesBody
    }, {
      onSuccess: () => {
        navigate(redirectTo);
      }
    });
  };

  const getCategoryById = (categoryId: string | undefined) => {
    return categories.find(cat => cat.id === categoryId) || null;
  };

  const getCategoryIds = (categoryId: string | undefined): string[] => {
    if (!categoryId) return [];
    if (categoryId.length > 1) {
      return categoryId.split('');
    }
    return [categoryId];
  };

  // Get surprise causes
  const surpriseCauses = surpriseData
    ? (Array.isArray(surpriseData)
      ? surpriseData
      : surpriseData.data || surpriseData.results || [])
    : [];

  // Get browse causes
  const browseCauses = browseData?.results || [];

  // Initial view - Two cards
  if (view === 'initial') {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-2xl bg-white rounded-xl max-h-full flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 pb-0 flex-shrink-0">
            {/* Progress Indicator - Step 4 */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-4">
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
            </div>

            {/* Heart Icon with Gradient */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-white fill-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-1">
              Start Supporting Causes
            </h1>

            {/* Description */}
            <p className="text-xs md:text-sm text-gray-600 text-center mb-3">
              Choose how you'd like to select nonprofits
            </p>

            {/* Selected Categories Tags */}
            {selectedCategoryObjects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {selectedCategoryObjects.map((category) => (
                  <div
                    key={category.id}
                    className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-white border border-gray-200"
                    style={{ backgroundColor: category.background }}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Content Section */}
          <div className="px-6 md:px-8 pt-0 overflow-y-auto flex-1 scrollbar-hide">
            {/* Three Option Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Join a Collective Card */}
              <button
                onClick={handleJoinCollective}
                disabled={isJoinLoading}
                className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-sm transition-all group disabled:opacity-70 disabled:cursor-not-allowed flex flex-col items-center"
              >
                <div className="mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#d946ef] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {isJoinLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Users className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-gray-900">Join a Collective</h3>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    Join curated giving communities
                  </p>
                </div>
              </button>

              {/* I'll Choose My Own Card */}
              <button
                onClick={handleBrowseSearch}
                disabled={isBrowseLoading}
                className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-sm transition-all group disabled:opacity-70 disabled:cursor-not-allowed flex flex-col items-center"
              >
                <div className="mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {isBrowseLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-gray-900">I'll Choose My Own</h3>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    Select nonprofits to add to your box
                  </p>
                </div>
              </button>

              {/* Surprise Me Card */}
              <button
                onClick={handleSurpriseMe}
                disabled={isSurpriseLoading}
                className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-sm transition-all group disabled:opacity-70 disabled:cursor-not-allowed flex flex-col items-center"
              >
                <div className="mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#ec4899] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {isSurpriseLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-gray-900">Surprise Me</h3>
                  <p className="text-gray-400 text-[10px] md:text-xs">
                    We'll pick nonprofits based on interests
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 md:p-6 flex-shrink-0 bg-white border-t border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4 w-full">
                <Button
                  onClick={handleEditCategories}
                  variant="outline"
                  className="flex-1 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 text-base"
                >
                  Back
                </Button>
                {/* <Button
                  disabled={true}
                  className="flex-1 py-6 rounded-full bg-[#1600ff] opacity-50 text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-100"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button> */}
                <button
                  onClick={handleSkip}
                  className="flex-1 text-gray-500 font-semibold text-sm hover:text-gray-900 transition-all"
                >
                  Skip for now
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Surprise Me view
  if (view === 'surprise') {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-2xl bg-white rounded-xl max-h-full flex flex-col overflow-hidden">
          <div className="p-6 md:p-8 pb-0 flex-shrink-0">
            {/* Progress Indicator - Step 4 */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-4">
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
            </div>

            {/* Heart Icon with Gradient */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
              Start Supporting Causes
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-600 text-center mb-4">
              We've curated a selection for you
            </p>

            {/* Selected Categories Tags */}
            {selectedCategoryObjects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {selectedCategoryObjects.map((category) => (
                  <div
                    key={category.id}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white border border-gray-200"
                    style={{ backgroundColor: category.background }}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Content Section */}
          <div className="px-6 md:px-8 pt-0 overflow-y-auto flex-1 scrollbar-hide">
            {/* Your Random Selection Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Random Selection</h2>
                <button
                  onClick={handleChangeMethod}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
                >
                  Change Method
                </button>
              </div>

              {isLoadingSurprise ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : surpriseCauses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {surpriseCauses.slice(0, 6).map((cause: any) => {
                      const isSelected = selectedCauses.includes(cause.id);
                      const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                      const initials = getInitials(cause.name);

                      return (
                        <Card
                          key={cause.id}
                          className={`py-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500' : 'border-blue-100'
                            }`}
                          onClick={() => handleCauseToggle(cause.id)}
                        >
                          <CardContent className="px-3 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 border border-gray-200">
                                <AvatarImage src={cause.image} />
                                <AvatarFallback
                                  style={{ backgroundColor: avatarBgColor }}
                                  className="font-bold text-white text-xs sm:text-sm"
                                >
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-2 sm:line-clamp-3">
                                  {cause.name}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  {getCategoryIds(cause.category).map((catId, idx) => {
                                    const catInfo = getCategoryById(catId) || categories[0];
                                    return (
                                      <div
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium text-white inline-block"
                                        style={{ backgroundColor: catInfo.background }}
                                      >
                                        {catInfo.name}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="text-center mb-6">
                    <button
                      onClick={handlePickDifferent}
                      className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium mx-auto text-sm sm:text-base"
                    >
                      <Sparkles className="w-4 h-4" />
                      Pick Different Nonprofits
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-[#1600ff]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No suggestions found</h3>
                  <p className="text-sm text-gray-600 text-center max-w-md px-4">
                    We couldn't find any nonprofits for your selected interests. Try changing your interests or browsing manually.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Navigation */}
          <div className="p-3 md:p-6 flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4 w-full">
                <Button
                  onClick={handleChangeMethod}
                  variant="outline"
                  className="flex-1 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 text-base"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStartWithNonprofits}
                  disabled={selectedCauses.length === 0 || createBoxMutation.isPending}
                  className="flex-1 py-5 rounded-full bg-[#1600ff] hover:bg-[#1100cc] text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-100"
                >
                  {createBoxMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <button
                onClick={handleSkip}
                className="text-gray-500 font-bold text-sm hover:text-gray-900 transition-all"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collective view
  if (view === 'collective') {
    const displayCollectives = collectivesData?.results || collectivesData || [];

    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-2xl bg-white rounded-xl max-h-full flex flex-col overflow-hidden">
          {/* Header Section - Fixed */}
          <div className="p-6 md:p-8 pb-0 flex-shrink-0">
            {/* Progress Indicator - Step 4 */}
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-4">
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
              <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
            </div>

            {/* Heart Icon with Gradient */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
              Start Supporting Causes
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-600 text-center mb-4">
              Join a community supporting causes together
            </p>

            {/* Selected Categories Tags */}
            {selectedCategoryObjects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {selectedCategoryObjects.map((category) => (
                  <div
                    key={category.id}
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white border border-gray-200"
                    style={{ backgroundColor: category.background }}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Content Section */}
          <div className="p-4 md:p-6 pt-0 overflow-y-auto flex-1">
            {/* What's a Collective Card */}
            <div className="bg-purple-100 rounded-xl p-2 mb-8 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d946ef] flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">What's a Collective?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    A giving community around shared causes where you can discover nonprofits, join discussions, and connect with others. Collectives are free to start or join.
                  </p>
                </div>
              </div>
            </div>

            {/* Join a Collective Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Join a Collective</h2>
              <button
                onClick={handleChangeMethod}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
              >
                Change Method
              </button>
            </div>

            {/* Collectives List */}
            <div className="space-y-4">
              {isLoadingCollectives ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : displayCollectives.length > 0 ? (
                displayCollectives.slice(0, 10).map((collective: any, index: number) => {
                  const collectiveId = String(collective.id || collective.pk || collective.uuid || index);
                  const isSelected = selectedCollectiveIds.includes(collectiveId);
                  const isExpanded = expandedCollectiveIds.includes(collectiveId);
                  const causes = collective.causes || [];

                  return (
                    <div
                      key={collectiveId}
                      className="bg-white border border-gray-200 rounded-xl p-2 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Avatar className="w-12 h-12 rounded-xl border border-gray-200 flex-shrink-0">
                          <AvatarImage src={collective.logo || collective.image} className="rounded-xl" />
                          <AvatarFallback
                            style={{ backgroundColor: collective.color || '#f3f4f6' }}
                            className={`font-bold rounded-xl ${collective.color ? 'text-white' : 'text-gray-600'}`}
                          >
                            {getInitials(collective.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg text-gray-900 ">{collective.name}</h3>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinCollectiveAction(collective);
                              }}
                              size="sm"
                              className={`font-bold rounded-full px-4 h-8 text-xs sm:h-9 sm:px-6 sm:text-sm transition-all duration-200 flex-shrink-0 ${isSelected
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                              {isSelected ? 'Joined' : 'Join'}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            Created by {collective.created_by?.full_name || collective.creator?.name || collective.creator || "Unknown"}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">
                            {truncateAtFirstPeriod(collective.description || "")}
                          </p>
                          <button
                            onClick={(e) => toggleCollectiveExpansion(collectiveId, e)}
                            className="text-blue-600 font-bold text-sm text-left flex items-center hover:underline"
                          >
                            Supporting {collective.causes?.length || collective.cause_count || 0} nonprofits
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && causes.length > 0 && (
                        <div className="mt-4 bg-[#f8f9fa] rounded-xl p-4 space-y-3">
                          {causes.map((causeItem: any) => {
                            const cause = causeItem.cause || causeItem;
                            const causeInitials = getInitials(cause.name);
                            const causeAvatarBgColor = getConsistentColor(cause.id, avatarColors);
                            return (
                              <div key={cause.id} className="flex items-center gap-3">
                                <Avatar className="w-6 h-6 rounded-full border border-gray-100 flex-shrink-0 bg-white">
                                  <AvatarImage src={cause.image} />
                                  <AvatarFallback
                                    style={{ backgroundColor: causeAvatarBgColor }}
                                    className="text-[10px] text-white"
                                  >
                                    {causeInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-700 font-medium leading-tight">{cause.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-[#1600ff]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No collectives found</h3>
                  <p className="text-sm text-gray-600 text-center max-w-md px-4">
                    There are no collectives available for your selected interests right now. Try searching or picking individual nonprofits.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 md:p-6 flex-shrink-0 border-t border-gray-200">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4 w-full">
                <Button
                  onClick={handleChangeMethod}
                  variant="outline"
                  className="flex-1 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 text-base"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinueWithCollective}
                  disabled={selectedCollectiveIds.length === 0 || isProcessingCollectives || createBoxMutation.isPending}
                  className="flex-1 py-5 rounded-full bg-[#1600ff] hover:bg-[#1100cc] text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-100"
                >
                  {isProcessingCollectives || createBoxMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <button
                onClick={handleSkip}
                className="text-gray-500 font-bold text-sm hover:text-gray-900 transition-all"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success view
  if (view === 'success') {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-xl flex flex-col items-center text-center">

          <div className="relative mb-8 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center relative z-10 shadow-sm">
              <Check className="w-10 h-10 text-white stroke-[4px]" />
            </div>
            <div className="absolute w-22 h-22 bg-[#D1FAE5] rounded-full"></div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {addedNonprofitsCount} nonprofit{addedNonprofitsCount != 1 ? 's' : ''} {addedNonprofitsCount != 1 ? 'have' : 'has'} been added to<br className="hidden sm:block" /> your donation box.
          </h1>

          <p className="text-gray-600 mb-10 text-base md:text-lg leading-relaxed max-w-[460px]">
            {addedNonprofitsCount > 0
              ? "When you're ready, choose an amount. We split it evenly across what you support. Add or remove causes anytime without changing your amount."
              : "You haven't selected any nonprofits yet. You can always browse and add causes to your donation box later from your profile."}
          </p>

          <Button
            onClick={handleFinalContinue}
            disabled={createBoxMutation.isPending}
            className="w-full sm:w-auto min-w-[280px] h-14 bg-[#1600ff] hover:bg-[#0039CC] text-white text-lg font-bold rounded-xl mb-8 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {createBoxMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up Box...
              </>
            ) : (
              'Continue to CRWD'
            )}
          </Button>

          <button
            onClick={() => setView(previousView)}
            disabled={createBoxMutation.isPending}
            className="text-gray-500 hover:text-gray-800 text-base font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" /> {addedNonprofitsCount > 0 ? "Change My Selection" : "Go Back and Choose"}
          </button>

        </div>

        {/* Help Button */}
        <div className="absolute bottom-8 right-8 hidden md:block">
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
            <span className="text-lg font-medium">?</span>
          </button>
        </div>
      </div>
    );
  }

  // Browse & Search view
  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl max-h-full flex flex-col overflow-hidden">
        <div className="p-6 md:p-8 pb-0 flex-shrink-0">
          {/* Progress Indicator - Step 4 */}
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-4">
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
          </div>

          {/* Heart Icon with Gradient */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
            Start Supporting Causes
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 text-center mb-4">
            Browse and select your own causes
          </p>

          {/* Selected Categories Tags */}
          {selectedCategoryObjects.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedCategoryObjects.map((category) => (
                <div
                  key={category.id}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white border border-gray-200"
                  style={{ backgroundColor: category.background }}
                >
                  {category.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content Section */}
        <div className="px-6 md:px-8 pt-0 overflow-y-auto flex-1 scrollbar-hide">
          {/* Browse Nonprofits Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Browse Nonprofits</h2>
              <button
                onClick={handleChangeMethod}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-all"
              >
                Change Method
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search nonprofits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-12 h-12 text-base rounded-xl bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Causes List */}
            {isLoadingBrowse ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : browseCauses.length > 0 ? (
              <div className="space-y-3">
                {browseCauses.slice(0, 10).map((cause: any) => {
                  const isSelected = selectedCauses.includes(cause.id);
                  const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                  const initials = getInitials(cause.name);

                  return (
                    <div
                      key={cause.id}
                      onClick={() => handleCauseToggle(cause.id)}
                      className={`bg-white border-2 rounded-2xl p-3 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500' : 'border-blue-100'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 rounded-xl border border-gray-100">
                            <AvatarImage src={cause.image} />
                            <AvatarFallback
                              style={{ backgroundColor: avatarBgColor }}
                              className="font-bold text-white text-sm"
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">
                              {cause.name}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {getCategoryIds(cause.category).map((catId, idx) => {
                                const catInfo = getCategoryById(catId) || categories[0];
                                return (
                                  <div
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide inline-block"
                                    style={{ backgroundColor: catInfo.background }}
                                  >
                                    {catInfo.name}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Selection Circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-200'
                          }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#1600ff]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No nonprofits found</h3>
                <p className="text-sm text-gray-600 text-center max-w-md px-4">
                  We couldn't find any nonprofits matching your search or interests. Try different keywords or categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer Navigation */}
        <div className="p-3 md:p-6 flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4 w-full">
              <Button
                onClick={handleChangeMethod}
                variant="outline"
                className="flex-1 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 text-base"
              >
                Back
              </Button>
              <Button
                onClick={handleStartWithNonprofits}
                disabled={selectedCauses.length === 0 || createBoxMutation.isPending}
                className="flex-1 py-5 rounded-full bg-[#1600ff] hover:bg-[#1100cc] text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-100"
              >
                {createBoxMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <button
              onClick={handleSkip}
              className="text-gray-500 font-bold text-sm hover:text-gray-900 transition-all"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
