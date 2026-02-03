
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { newSearch } from '@/services/api/social';
import { getCausesBySearch } from '@/services/api/crwd';
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchResultsHeader from '@/components/newsearch/SearchResultsHeader';
import SearchTabs from '@/components/newsearch/SearchTabs';
import CauseResultCard from '@/components/newsearch/CauseResultCard';
import CollectiveResultCard from '@/components/newsearch/CollectiveResultCard';
import UserResultCard from '@/components/newsearch/UserResultCard';
import PostResultCard from '@/components/newsearch/PostResultCard';
import RequestNonprofitModal from '@/components/newsearch/RequestNonprofitModal';

type TabType = 'Causes' | 'Collectives' | 'Users' | 'Posts';

export default function SearchResultsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Get state from URL params
    const searchQuery = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const categoryName = searchParams.get('categoryName');

    // Initialize activeTab from URL or default to Causes
    const tabParam = searchParams.get('tab');
    const activeTab: TabType = (tabParam as TabType) || 'Causes';

    // Handle updates to URL params
    const updateSearch = (newQuery: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (newQuery) {
                newParams.set('q', newQuery);
            } else {
                newParams.delete('q');
            }
            return newParams;
        });
    };

    const setActiveTab = (newTab: TabType) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', newTab);
            return newParams;
        });
    };

    const handleClearSearch = () => {
        navigate(-1);
    };

    // Map tab names to API tab values
    const getTabValue = (tab: TabType): 'cause' | 'collective' | 'user' | 'post' => {
        switch (tab) {
            case 'Causes': return 'cause';
            case 'Collectives': return 'collective';
            case 'Users': return 'user';
            case 'Posts': return 'post';
            default: return 'cause';
        }
    };

    // Fetch search results
    const {
        data: searchData,
        isLoading: isLoadingSearch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: categoryId
            ? ['causes-by-category', categoryId, searchQuery, activeTab]
            : ['new-search', activeTab, searchQuery],
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) => {
            if (categoryId && activeTab === 'Causes') {
                const searchTerm = (categoryName && searchQuery === categoryName) ? '' : searchQuery;
                return getCausesBySearch(searchTerm || '', categoryId, pageParam);
            }
            return newSearch(getTabValue(activeTab), searchQuery, pageParam);
        },
        getNextPageParam: (lastPage: any) => {
            if (lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    const page = url.searchParams.get('page');
                    return page ? parseInt(page) : undefined;
                } catch (e) {
                    return undefined;
                }
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: searchQuery.trim().length > 0 || !!categoryId,
    });

    const getResults = () => {
        if (!searchData?.pages) return [];

        return searchData.pages.flatMap((page: any) => {
            if (categoryId && activeTab === 'Causes' && page.results) {
                return page.results;
            }

            switch (activeTab) {
                case 'Causes':
                    if (page.causes || page.cause) return page.causes || page.cause;
                    break;
                case 'Collectives':
                    if (page.collectives || page.collective) return page.collectives || page.collective;
                    break;
                case 'Users':
                    if (page.users || page.user) return page.users || page.user;
                    break;
                case 'Posts':
                    if (page.posts || page.post) return page.posts || page.post;
                    break;
            }

            if (Array.isArray(page)) return page;
            if (page.results) return page.results;
            return [];
        });
    };

    const results = getResults();
    const isLoading = isLoadingSearch;
    const resultsCount = searchData?.pages?.[0]?.count || results.length;

    return (
        <div className="min-h-screen bg-white">
            {/* Search Header */}
            <SearchResultsHeader
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
                onSearchChange={updateSearch}
                onSearch={() => { }} // Search happens automatically via URL params effect
            />

            <div className="px-3 md:px-4 py-4 md:py-6">
                {/* Results Header */}
                <div className="mb-3 md:mb-4">
                    <h2 className="text-base xs:text-lg md:text-xl font-bold text-foreground">
                        Results for '{searchQuery}'
                    </h2>
                </div>

                {/* Tabs */}
                <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Results Section */}
                <div className="mt-4 md:mt-6">
                    {/* Section Header */}
                    <h3 className="text-xs xs:text-sm md:text-base font-bold text-gray-500 uppercase mb-3 md:mb-4">
                        {activeTab.toUpperCase()} ({resultsCount})
                    </h3>

                    {/* Results List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 md:py-12">
                            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="space-y-3 md:space-y-4">
                                {activeTab === 'Causes' &&
                                    results.map((cause: any) => (
                                        <CauseResultCard key={`${cause.id}-${activeTab}`} cause={cause} />
                                    ))}
                                {activeTab === 'Collectives' &&
                                    results.map((collective: any) => (
                                        <CollectiveResultCard key={`${collective.id}-${activeTab}`} collective={collective} />
                                    ))}
                                {activeTab === 'Users' &&
                                    results.map((user: any) => (
                                        <UserResultCard key={`${user.id}-${activeTab}`} user={user} />
                                    ))}
                                {activeTab === 'Posts' &&
                                    results.map((post: any) => (
                                        <PostResultCard key={`${post.id}-${activeTab}`} post={post} />
                                    ))}
                            </div>

                            {/* Load More Button */}
                            {hasNextPage && (
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="min-w-[120px]"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : activeTab === 'Causes' ? (
                        <>
                            {/* Causes Empty State */}
                            <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-300 rounded-lg mb-6 md:mb-8">
                                <p className="text-gray-700 text-sm xs:text-base md:text-lg mb-3 md:mb-4">
                                    No organizations found matching your search.
                                </p>
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="text-xs xs:text-sm md:text-base text-[#1600ff] hover:underline"
                                >
                                    Can't find your nonprofit? Request it here
                                </button>
                            </div>

                            {/* Browse All Nonprofits Button */}
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm xs:text-base md:text-lg"
                                    onClick={handleClearSearch}
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
                                <p className="font-semibold mb-2 text-gray-700 text-sm xs:text-base md:text-lg">
                                    No "{searchQuery}" collective found
                                </p>
                                <p className="text-sm xs:text-base md:text-lg text-gray-500">
                                    Want to start one?
                                </p>
                            </div>

                            {/* Create Collective Button */}
                            <div className="text-center">
                                <Button
                                    className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm xs:text-base md:text-lg bg-[#2c7fff] text-white hover:bg-[#2c7fff]/90"
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
                            <p className="font-semibold mb-2 text-gray-500 text-sm xs:text-base md:text-lg">
                                No {activeTab.toLowerCase()} found for "{searchQuery}"
                            </p>
                            <p className="text-xs xs:text-sm md:text-base text-gray-400">
                                Try another search or switch tabs.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Nonprofit Modal */}
            <RequestNonprofitModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />
        </div>
    );
}
