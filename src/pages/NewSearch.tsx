import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { newSearch } from '@/services/api/social';
import { useQuery } from '@tanstack/react-query';
import SearchResultsHeader from '@/components/newsearch/SearchResultsHeader';
import SearchTabs from '@/components/newsearch/SearchTabs';
import CauseResultCard from '@/components/newsearch/CauseResultCard';
import CollectiveResultCard from '@/components/newsearch/CollectiveResultCard';
import UserResultCard from '@/components/newsearch/UserResultCard';
import PostResultCard from '@/components/newsearch/PostResultCard';
import RequestNonprofitModal from '@/components/newsearch/RequestNonprofitModal';

type TabType = 'Causes' | 'Collectives' | 'Users' | 'Posts';

export default function NewSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('Causes');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Initialize search query from location state if available
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      setHasSearched(true);
    }
  }, [location.state]);

  // Map tab names to API tab values
  const getTabValue = (tab: TabType): 'cause' | 'collective' | 'user' | 'post' => {
    switch (tab) {
      case 'Causes':
        return 'cause';
      case 'Collectives':
        return 'collective';
      case 'Users':
        return 'user';
      case 'Posts':
        return 'post';
      default:
        return 'cause';
    }
  };

  // Fetch search results using the new unified search API
  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['new-search', activeTab, searchQuery],
    queryFn: () => newSearch(getTabValue(activeTab), searchQuery),
    enabled: hasSearched && searchQuery.trim().length > 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
    setActiveTab('Causes');
  };

  const handleSurpriseMe = () => {
    navigate('/surprise-me');
  };

  // Get results based on active tab from the unified search API response
  const getResults = () => {
    if (!searchData) return [];
    
    // The API response structure may vary, but typically it returns results in a results array
    // or directly as an array. Let's handle both cases.
    if (Array.isArray(searchData)) {
      return searchData;
    }
    
    // If it's an object with a results property
    if (searchData.results) {
      return searchData.results;
    }
    
    // If it's an object with tab-specific properties
    switch (activeTab) {
      case 'Causes':
        return searchData.causes || searchData.cause || [];
      case 'Collectives':
        return searchData.collectives || searchData.collective || [];
      case 'Users':
        return searchData.users || searchData.user || [];
      case 'Posts':
        return searchData.posts || searchData.post || [];
      default:
        return [];
    }
  };

  const results = getResults();
  const isLoading = isLoadingSearch;
  const resultsCount = results.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      {hasSearched ? (
        <SearchResultsHeader
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
      ) : (
        <div className="sticky top-0 z-10 w-full flex items-center gap-4 p-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-xl text-foreground flex-1">Search</h1>
        </div>
      )}

      <div className="px-4 py-6">
        {!hasSearched ? (
          <>
            {/* Search Input */}
            <div className="mb-8">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSearch();
                    }
                  }}
                  className="pl-10 pr-4 py-3 rounded-lg border border-blue-500 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Not Sure Where to Start Section */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase mb-4">
                NOT SURE WHERE TO START?
              </h2>
              
              <Card
                onClick={handleSurpriseMe}
                className="bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <CardContent className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    {/* Purple Gradient Icon with Star and Plus */}
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <Plus className="w-2 h-2 text-purple-500" strokeWidth={3} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-foreground mb-1">
                        Surprise Me
                      </h3>
                      <p className="text-sm text-gray-600">
                        We'll pick 5 amazing nonprofits for you
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Results for '{searchQuery}'
              </h2>
            </div>

            {/* Tabs */}
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Results Section */}
            <div className="mt-6">
              {/* Section Header */}
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                {activeTab.toUpperCase()} ({resultsCount})
              </h3>

              {/* Results List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : resultsCount > 0 ? (
                <div className="space-y-4">
                  {activeTab === 'Causes' &&
                    results.map((cause: any) => (
                      <CauseResultCard key={cause.id} cause={cause} />
                    ))}
                  {activeTab === 'Collectives' &&
                    results.map((collective: any) => (
                      <CollectiveResultCard key={collective.id} collective={collective} />
                    ))}
                  {activeTab === 'Users' &&
                    results.map((user: any) => (
                      <UserResultCard key={user.id} user={user} />
                    ))}
                  {activeTab === 'Posts' &&
                    results.map((post: any) => (
                      <PostResultCard key={post.id} post={post} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No {activeTab.toLowerCase()} found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer Link */}
            {activeTab === 'Causes' && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="text-sm text-[#1600ff] hover:underline"
                >
                  Can't find your nonprofit? Request it here
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Nonprofit Modal */}
      <RequestNonprofitModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}

