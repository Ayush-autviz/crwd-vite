import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    // Get categories from URL params if available
    const categoriesParam = new URLSearchParams(window.location.search).get('categories');
    const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : undefined;
    
    if (categories && categories.length > 0) {
      navigate(`/surprise-me?categories=${categories.join(',')}`);
    } else {
      navigate('/surprise-me');
    }
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
        <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-foreground flex-1">Search</h1>
        </div>
      )}

      <div className="px-3 md:px-4 py-4 md:py-6">
        {!hasSearched ? (
          <>
            {/* Search Input */}
            <div className="mb-6 md:mb-8">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
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
                  className="pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3 rounded-lg border border-blue-500 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Not Sure Where to Start Section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xs md:text-sm font-bold text-gray-900 uppercase mb-3 md:mb-4">
                NOT SURE WHERE TO START?
              </h2>
              
              <Card
                onClick={handleSurpriseMe}
                className="shadow-none border py-4 border-gray-200 rounded-lg cursor-pointer hover:border-1 hover:border-purple-500 transition-colors"
              >
                <CardContent className="px-3 md:px-4 py-3 md:py-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Purple Gradient Icon with Star and Plus */}
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full flex items-center justify-center">
                        <Plus className="w-1.5 h-1.5 md:w-2 md:h-2 text-purple-500" strokeWidth={3} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-sm md:text-base text-foreground mb-0.5 md:mb-1">
                        Surprise Me
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
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
            <div className="mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Results for '{searchQuery}'
              </h2>
            </div>

            {/* Tabs */}
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Results Section */}
            <div className="mt-4 md:mt-6">
              {/* Section Header */}
              <h3 className="text-xs md:text-sm font-bold text-gray-500 uppercase mb-3 md:mb-4">
                {activeTab.toUpperCase()} ({resultsCount})
              </h3>

              {/* Results List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                </div>
              ) : resultsCount > 0 ? (
                <div className="space-y-3 md:space-y-4">
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
              ) : activeTab === 'Causes' ? (
                <>
                  {/* Causes Empty State */}
                  <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-8">
                    <p className="text-gray-700 text-sm md:text-base mb-3 md:mb-4">
                      No organizations found matching your search.
                    </p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="text-xs md:text-sm text-[#1600ff] hover:underline"
                    >
                      Can't find your nonprofit? Request it here
                    </button>
                  </div>

                  {/* Try searching for section */}
                  <div className="mb-6 md:mb-8">
                    <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">
                      Try searching for:
                    </h4>
                    <ul className="space-y-2 md:space-y-3 text-left">
                      {['Animals', 'Homelessness', 'Mental Health', 'Health & Medical', 'Education', 'Environment'].map((category) => (
                        <li key={category} className="text-sm md:text-base text-gray-700">
                          • {category}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Browse All Nonprofits Button */}
                  <div className="text-center">
                    <Button
                      variant="outline"
                      className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base"
                      onClick={() => {
                        setSearchQuery('');
                        setHasSearched(false);
                      }}
                    >
                      Browse All Nonprofits
                    </Button>
                  </div>
                </>
              ) : activeTab === 'Collectives' ? (
                <>
                  {/* Collectives Empty State */}
                  <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-8">
                    <SearchIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold mb-2 text-gray-700 text-sm md:text-base">
                      No "{searchQuery}" collective found
                    </p>
                    <p className="text-sm md:text-base text-gray-500">
                      Want to start one?
                    </p>
                  </div>

                  {/* Create Collective Button */}
                  <div className="text-center">
                    <Button
                      className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-[#2c7fff] text-white hover:bg-[#2c7fff]/90"
                      onClick={() => {
                        localStorage.setItem('createCrwd_name', searchQuery);
                        navigate('/create-crwd');
                      }}
                    >
                      Create "{searchQuery}" Collective
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <SearchIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-semibold mb-2 text-gray-500 text-sm md:text-base">
                    No {activeTab.toLowerCase()} found for "{searchQuery}"
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">
                    Try another search or switch tabs.
                  </p>
                </div>
              )}
            </div>
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

