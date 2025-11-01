"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { getCausesBySearch } from "@/services/api/crwd";
import { categories as discoverCategories } from "@/constants/categories";
import {
  Clock,
  Zap,
  X,
  Search,
  TrendingUp,
  History,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentSearches = [
  "Atlanta animal shelters",
  "Gaza support efforts",
  "Marine wildlife charities",
];

const popularSearches = [
  "Protests near me",
  "Harvard opens free classes to public",
];


const searchTips = [
  "Use quotes for exact phrases",
  "Try different keywords",
  "Filter by location",
  "Search by category",
];








export default function SearchPage() {
  const location = useLocation();
  const [discover, setDiscover] = useState(location.state?.discover);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const [popularSearchesList, setPopularSearchesList] =
    useState(popularSearches);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allCauses, setAllCauses] = useState<any[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Get category from navigation state
  const categoryId = location.state?.categoryId;
  const categoryName = location.state?.categoryName;

  // Store initial category name from navigation state
  const [initialCategoryName, setInitialCategoryName] = useState<string | undefined>(categoryName);

  // Set initial category from navigation state and trigger search
  useEffect(() => {
    if (categoryId && categoryName) {
      setSelectedCategory(categoryId);
      setSearchQuery(categoryName);
      setInitialCategoryName(categoryName);
      setSearchTrigger(prev => prev + 1);
    }
  }, [categoryId, categoryName]);

  // Get causes with search and category filtering
  const { data: causesData, isLoading: isCausesLoading, error } = useQuery({
    queryKey: ['causes', selectedCategory, searchQuery, searchTrigger, currentPage],
    queryFn: () => {
      return getCausesBySearch(searchQuery, selectedCategory === "All" || selectedCategory === "" ? '' : selectedCategory, currentPage);
    },
    enabled: searchQuery.trim().length > 0 || (selectedCategory !== "All" && selectedCategory !== ""),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Handle API response and accumulate results
  useEffect(() => {
    if (causesData?.results) {
      if (currentPage === 1) {
        setAllCauses(causesData.results);
      } else {
        setAllCauses(prev => [...prev, ...causesData.results]);
      }
    }
  }, [causesData, currentPage]);

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
    setAllCauses([]);
  }, [searchTrigger, selectedCategory]);

  // Handle search input with Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      setSearchQuery(search.trim());
      setSearchTrigger(prev => prev + 1);
      setDiscover(false);
    }
  };

  const removeRecentSearch = (index: number) => {
    setRecentSearchesList((prev) => prev.filter((_, i) => i !== index));
  };

  const removePopularSearch = (index: number) => {
    setPopularSearchesList((prev) => prev.filter((_, i) => i !== index));
  };



  // Original search page design when no search input
  return (
    <div className={`min-h-screen ${discover ? "bg-gray-50" : "bg-white"}`}>
      <ProfileNavbar title="Search" />
      {!discover ? (
        <div className="md:grid md:grid-cols-12 md:gap-4 md:min-h-screen">
          {/* Main Content */}
          <div className="px-4 py-6 md:pl-4 md:col-span-8 ">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative group w-full">
                <Search className="absolute left-4  top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                <Input
                  placeholder="Find Nonprofits"
                  className="bg-gray-100 rounded-[10px] border-none px-12 py-4 text-base  placeholder:text-gray-400 w-full"
                  style={{ paddingRight: search ? "3rem" : "1rem" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    onClick={() => setSearch("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Chip */}
            <div className="mb-4 flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                style={{ 
                  backgroundColor: selectedCategory === "All" || selectedCategory === "" ? "#f5f5f5" : 
                    discoverCategories.find(cat => cat.id === selectedCategory)?.background || "#FFE9DC", 
                  color: selectedCategory === "All" || selectedCategory === "" ? "#000000" : 
                    discoverCategories.find(cat => cat.id === selectedCategory)?.text || "#E36414" 
                }}
              >
                {selectedCategory === "All" || selectedCategory === "" ? "All" : 
                 discoverCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategorySelector(true)}
                className="h-8 w-8 p-0 md:hidden"
              >
                <ListFilter className="w-4 h-4" />
              </Button>
            </div>

            {/* Causes Results Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 (selectedCategory !== "All" && selectedCategory !== "") ? 
                 `Causes in ${initialCategoryName || discoverCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}` : 
                 "Causes near you"}
              </h2>
              <div className="">
                {isCausesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading causes...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Error loading causes. Please try again.</p>
                  </div>
                ) : allCauses.length > 0 ? (
                  allCauses.map((cause, index) => (
                    <Link to={`/cause/${cause.id}`} key={cause.id || index} className="block">
                      <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                            {/* <img
                              src={cause.image || "/placeholder.svg"}
                              alt={cause.name}
                              className="w-full h-full object-cover"
                            /> */}
                            <Avatar className="h-10 w-10 rounded-full">
                              <AvatarImage src={cause.image} />
                              <AvatarFallback>
                                {cause.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="bg-blue-50 px-3 py-1 rounded-sm w-fit mb-1">
                              <p className="text-blue-600 text-xs font-semibold">
                                Nonprofit
                              </p>
                            </div>
                            <h3 className="font-medium text-sm mb-1">
                              {cause.name}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px]">
                              {cause.description || cause.mission || "No description available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Button className="text-white text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">
                            Donate Now
                          </Button>
                          <Button
                            variant="link"
                            className="text-primary text-xs p-0 h-auto"
                          >
                            Visit Profile
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? `No causes found for "${searchQuery}"` : 
                       (selectedCategory !== "All" && selectedCategory !== "") ? 
                       `No causes found in ${initialCategoryName || discoverCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}` : 
                       "No causes available"}
                    </p>
                  </div>
                )}
              </div>
              {allCauses.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    variant="link"
                    className="text-primary flex items-center"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!causesData?.next}
                  >
                    Load More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Searches */}
            {recentSearchesList.length > 0 && allCauses.length === 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-white" />
                    <h2 className="text-md font-semibold text-gray-500">
                      Recent Searches
                    </h2>
                  </div>
                </div>
                <div className="bg-white rounded-xl  overflow-hidden ">
                  {recentSearchesList.map((searchTerm, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4  transition-colors border-b border-gray-100 last:border-b-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                          <Clock className="w-4 h-4 text-gray-500" />
                        </div>
                        <Link
                          to="/search2"
                          className="text-gray-900 font-medium group-hover:text-gray-700"
                        >
                          {searchTerm}
                        </Link>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(index);
                        }}
                        className=" transition-opacity h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearchesList.length > 0 && allCauses.length === 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-white" />
                  <h2 className="text-md font-semibold text-gray-500">
                    Popular Searches
                  </h2>
                </div>
                <div className="bg-white rounded-xl  overflow-hidden ">
                  {popularSearchesList.map((searchTerm, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-4  transition-colors border-b border-gray-100 last:border-b-0 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                        </div>
                        <Link
                          to="/search2"
                          className="text-gray-900 font-medium group-hover:text-gray-700"
                        >
                          {searchTerm}
                        </Link>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePopularSearch(index);
                        }}
                        className="  transition-opacity h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentSearchesList.length === 0 &&
              popularSearchesList.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No search history
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start searching to see your recent and popular searches here
                  </p>
                </div>
              )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block md:col-span-4  pr-6 py-6 space-y-6">
            {/* Search Tips */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  Search Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {searchTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    {tip}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Popular Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-2">
                {discoverCategories.map((category, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      style={{ backgroundColor: category.background }}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSearchQuery(category.name);
                        setInitialCategoryName(category.name);
                        setSearchTrigger(prev => prev + 1);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div 
                            className="font-medium text-sm"
                            style={{ color: category.text }}
                          >
                            {category.name}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="md:min-h-screen">
          {/* Main Content */}
          <div className="px-4 py-6">
            {/* Title and Description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Your Impact
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Find and support organizations that align with your passions.
                Your next favorite cause is just a click away.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for nonprofits or causes..."
                  className="bg-white border-2 border-gray-200 rounded-full px-12 py-4 text-base placeholder:text-gray-400 w-full focus:border-blue-500 focus:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 w-[80%] mx-auto justify-center">
                {discoverCategories.map((category) => (
                  <button
                    key={category.name}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? category.text
                          : category.background,
                      color:
                        selectedCategory === category.id
                          ? "white"
                          : category.text,
                    }}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery(category.name);
                      setInitialCategoryName(category.name);
                      setSearchTrigger(prev => prev + 1);
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <div className="h-30 md:hidden" /> */}

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-white/20 z-50 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Category</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCategorySelector(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Scrollable Categories */}
            <div className="max-h-80 overflow-y-auto p-4">
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  style={{ backgroundColor: selectedCategory === "All" ? "#f5f5f5" : "#f5f5f5" }}
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                      setInitialCategoryName(undefined);
                      setSearchTrigger(prev => prev + 1);
                      setShowCategorySelector(false);
                    }}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        All Categories
                      </div>
                    </div>
                  </div>
                  {selectedCategory === "All" && <ArrowRight className="w-4 h-4 text-gray-400" />}
                </div>
                {discoverCategories.map((category, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      style={{ backgroundColor: category.background }}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSearchQuery(category.name);
                        setInitialCategoryName(category.name);
                        setSearchTrigger(prev => prev + 1);
                        setShowCategorySelector(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div 
                            className="font-medium"
                            style={{ color: category.text }}
                          >
                            {category.name}
                          </div>
                        </div>
                      </div>
                      {/* {selectedCategory === category.id && <ArrowRight className="w-4 h-4 text-gray-400" />} */}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
