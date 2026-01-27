import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Sparkles, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function NewSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle category filtering from location state
  useEffect(() => {
    if (location.state?.searchQuery) {
      navigate(`/search-results?q=${encodeURIComponent(location.state.searchQuery)}`, { replace: true });
    } else if (location.state?.categoryId) {
      const params = new URLSearchParams();
      params.set('categoryId', location.state.categoryId);
      if (location.state.categoryName) {
        params.set('categoryName', location.state.categoryName);
        params.set('q', location.state.categoryName);
      }
      navigate(`/search-results?${params.toString()}`, { replace: true });
    }
  }, [location.state, navigate]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-base xs:text-lg md:text-xl text-foreground flex-1">Search</h1>
      </div>

      <div className="px-3 md:px-4 py-4 md:py-6">
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
              className="pl-9 md:pl-11 pr-3 md:pr-4 py-2.5 md:py-3 rounded-lg border border-blue-500 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm xs:text-base md:text-lg"
            />
          </div>
        </div>

        {/* Not Sure Where to Start Section */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xs xs:text-sm md:text-base font-bold text-gray-900 uppercase mb-3 md:mb-4">
            NOT SURE WHERE TO START?
          </h2>

          <Card
            onClick={handleSurpriseMe}
            className="shadow-none border py-4 border-gray-200 rounded-lg cursor-pointer hover:border-1 hover:border-purple-500 transition-colors"
          >
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center gap-2.5 md:gap-4">
                {/* Purple Gradient Icon with Star and Plus */}
                <div className="relative w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full flex items-center justify-center">
                    <Plus className="w-1.5 h-1.5 md:w-2 md:h-2 text-purple-500" strokeWidth={3} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-sm xs:text-base md:text-lg text-foreground mb-0.5 md:mb-1">
                    Surprise Me
                  </h3>
                  <p className="text-xs xs:text-sm md:text-base text-gray-600">
                    We'll pick 5 amazing nonprofits for you
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

