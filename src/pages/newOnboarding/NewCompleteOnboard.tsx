import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, Search, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSurpriseMe, getCausesBySearch } from "@/services/api/crwd";
import { addCausesToBox } from "@/services/api/donation";
import { toast } from "sonner";
import { categories } from "@/constants/categories";

type ViewType = 'initial' | 'surprise' | 'browse';

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
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function NewCompleteOnboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewType>('initial');
  const [selectedCauses, setSelectedCauses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Fetch surprise me causes
  const { data: surpriseData, isLoading: isLoadingSurprise, refetch: refetchSurprise } = useQuery({
    queryKey: ['surprise-me-onboard'],
    queryFn: () => getSurpriseMe(),
    enabled: view === 'surprise',
  });

  // Fetch causes for browse/search
  const { data: browseData, isLoading: isLoadingBrowse } = useQuery({
    queryKey: ['browse-causes', searchQuery, searchTrigger],
    queryFn: () => getCausesBySearch(searchQuery || '', '', 1),
    enabled: view === 'browse',
    refetchOnMount: true,
  });

  // Add causes to donation box mutation
  const addToBoxMutation = useMutation({
    mutationFn: async (causeIds: number[]) => {
      return await addCausesToBox({ cause_ids: causeIds });
    },
    onSuccess: () => {
      toast.success('Nonprofits added to donation box!');
      queryClient.invalidateQueries({ queryKey: ['donationBox'] });
      navigate('/new-home');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add nonprofits to donation box');
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

  const handleSurpriseMe = () => {
    setView('surprise');
  };

  const handleBrowseSearch = () => {
    setView('browse');
  };

  const handleChangeMethod = () => {
    setView('initial');
    setSelectedCauses([]);
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
      addToBoxMutation.mutate(selectedCauses);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0];
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-xl p-6 md:p-8 shadow-lg">
          {/* Heart Icon with Gradient */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            Set Up Your Donation Box
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 text-center mb-8">
            Choose nonprofits to support. Your donation gets split evenly among them. You can change these anytime!
          </p>

          {/* Two Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Surprise Me Card */}
            <button
              onClick={handleSurpriseMe}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Surprise Me</h3>
              <p className="text-sm text-gray-600">
                We'll pick 5 amazing nonprofits for you
              </p>
            </button>

            {/* Browse & Search Card */}
            <button
              onClick={handleBrowseSearch}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Search className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Browse & Search</h3>
              <p className="text-sm text-gray-600">
                Explore and find nonprofits
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Surprise Me view
  if (view === 'surprise') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mt-8">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            Set Up Your Donation Box
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mb-8">
            Choose nonprofits to support. Your donation gets split evenly among them. You can change these anytime!
          </p>

          {/* Your Random Selection Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your Random Selection</h2>
              <button
                onClick={handleChangeMethod}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                Change Method
              </button>
            </div>

            {isLoadingSurprise ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {surpriseCauses.slice(0, 6).map((cause: any) => {
                    const isSelected = selectedCauses.includes(cause.id);
                    const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                    const initials = getInitials(cause.name);
                    const categoryInfo = getCategoryInfo(cause.category);

                    return (
                      <Card
                        key={cause.id}
                        className={`border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-blue-500' : 'border-blue-100'
                        }`}
                        onClick={() => handleCauseToggle(cause.id)}
                      >
                        <CardContent className="px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: avatarBgColor }}
                            >
                              <span className="text-white font-bold text-sm">
                                {initials}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xs text-gray-900 mb-1 line-clamp-3">
                                {cause.name}
                              </h3>
                              <div
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white inline-block"
                                style={{ backgroundColor: categoryInfo.background }}
                              >
                                {categoryInfo.name}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
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
                    className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Pick Different Nonprofits
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex gap-3">
            <Button
              onClick={handleChangeMethod}
              variant="outline"
              className="flex-1 h-12 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              onClick={handleStartWithNonprofits}
              disabled={selectedCauses.length === 0 || addToBoxMutation.isPending}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addToBoxMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Start with ${selectedCauses.length} Nonprofit${selectedCauses.length !== 1 ? 's' : ''} →`
              )}
            </Button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Browse & Search view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mt-8">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
          Set Up Your Donation Box
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          Choose nonprofits to support. Your donation gets split evenly among them. You can change these anytime!
        </p>

        {/* Browse Nonprofits Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse Nonprofits</h2>
            <button
              onClick={handleChangeMethod}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              Change Method
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for nonprofits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10 h-12"
            />
          </div>

          {/* Select Nonprofits Count */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Select Nonprofits ({selectedCauses.length})
            </h3>
          </div>

          {/* Causes List */}
          {isLoadingBrowse ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {browseCauses.map((cause: any) => {
                const isSelected = selectedCauses.includes(cause.id);
                const avatarBgColor = getConsistentColor(cause.id, avatarColors);
                const initials = getInitials(cause.name);
                const categoryInfo = getCategoryInfo(cause.category);

                return (
                  <Card
                    key={cause.id}
                    className={`border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => handleCauseToggle(cause.id)}
                  >
                    <CardContent className="px-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: avatarBgColor }}
                        >
                          <span className="text-white font-bold text-base">
                            {initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-gray-900 mb-1">
                            {cause.name}
                          </h3>
                          <div
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white inline-block"
                            style={{ backgroundColor: categoryInfo.background }}
                          >
                            {categoryInfo.name}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleChangeMethod}
            variant="outline"
            className="flex-1 h-12 border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button
            onClick={handleStartWithNonprofits}
            disabled={selectedCauses.length === 0 || addToBoxMutation.isPending}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {addToBoxMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Start with ${selectedCauses.length} Nonprofit${selectedCauses.length !== 1 ? 's' : ''} →`
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
