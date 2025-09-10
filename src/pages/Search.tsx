"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Zap,
  X,
  Search,
  TrendingUp,
  History,
  BookOpen,
  Users,
  Heart,
  Globe,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link, useLocation } from "react-router-dom";
import PopularPosts from "@/components/PopularPosts";

const recentSearches = [
  "Atlanta animal shelters",
  "Gaza support efforts",
  "Marine wildlife charities",
];

const popularSearches = [
  "Protests near me",
  "Harvard opens free classes to public",
];

const trendingTopics = [
  "Climate Action",
  "Food Security",
  "Education",
  "Healthcare",
  "Animal Welfare",
];

const searchTips = [
  "Use quotes for exact phrases",
  "Try different keywords",
  "Filter by location",
  "Search by category",
];

const popularCategories = [
  { name: "Education", count: 1240, icon: BookOpen },
  { name: "Healthcare", count: 890, icon: Heart },
  { name: "Environment", count: 756, icon: Globe },
  { name: "Community", count: 623, icon: Users },
];

const featuredOrganizations = [
  { name: "Red Cross", type: "Healthcare", rating: 4.9 },
  { name: "Doctors Without Borders", type: "Healthcare", rating: 4.8 },
  { name: "World Wildlife Fund", type: "Environment", rating: 4.7 },
  { name: "Teach for America", type: "Education", rating: 4.6 },
];

// Sample data for nearby causes
const nearbyCauses = [
  {
    name: "The Red Cross",
    type: "CRWD",
    description: "An health organization that helps people in need",
    image: "/redcross.png",
  },
  {
    name: "St. Judes",
    type: "Nonprofit",
    description: "The leading children's health organization",
    image: "/grocery.jpg",
  },
  {
    name: "Women's Healthcare of At...",
    type: "CRWD",
    description: "We are Atlanta's #1 healthcare organization",
    image: "/redcross.png",
  },
];

// const categories = [
//   "Animal Welfare",
//   "Environment",
//   "Food Insecurity",
//   "Education",
//   "Healthcare",
//   "Social Justice",
//   "Homelessness",
// ];

const categories = [
  { name: "Animal Welfare", text: "#E36414", background: "#FFE9DC" }, // Animals
  { name: "Environment", text: "#6A994E", background: "#E8F4E4" },
  { name: "Food Insecurity", text: "#FF9F1C", background: "#FFF0D9" }, // Food
  { name: "Education", text: "#FFB84D", background: "#FFF3E0" },
  { name: "Healthcare", text: "#D62828", background: "#FFE5E5" }, // Health
  { name: "Social Justice", text: "#780000", background: "#FFDADA" }, // Rights
  { name: "Homelessness", text: "#8D6E63", background: "#F5E9E3" }, // Housing
];




// Sample data for suggested causes
const suggestedCauses = [
  {
    name: "The Red Cross",
    description: "An health organization that helps people in need",
    image: "/redcross.png",
    type: "Nonprofit",
  },
  {
    name: "St. Judes",
    description: "The leading children's health organization",
    image: "/grocery.jpg",
    type: "Nonprofit",
  },
  {
    name: "Women's Healthcare of At...",
    description: "We are Atlanta's #1 healthcare organization",
    image: "/redcross.png",
    type: "Nonprofit",
  },
];

const discoverCategories = [
  { name: "All", text: "#000000", background: "#f5f5f5" },
  { name: "Animal Welfare", text: "#E36414", background: "#FFE9DC" },
  { name: "Arts", text: "#FF6B6B", background: "#FFECEC" },
  { name: "Community", text: "#06D6A0", background: "#D6FAF0" },
  { name: "Education", text: "#FFB84D", background: "#FFF3E0" },
  { name: "Environment", text: "#6A994E", background: "#E8F4E4" },
  { name: "Food Insecurity", text: "#FF9F1C", background: "#FFF0D9" },
  { name: "General", text: "#ADB5BD", background: "#F3F4F6" },
  { name: "Global", text: "#48CAE4", background: "#D7F0FB" },
  { name: "Healthcare", text: "#D62828", background: "#FFE5E5" },
  { name: "Housing", text: "#8D6E63", background: "#F5E9E3" },
  { name: "Jobs", text: "#6C757D", background: "#ECEFF1" },
  { name: "Legal", text: "#FFBE0B", background: "#FFF7D6" },
  { name: "Membership", text: "#5E6472", background: "#EBEDF1" },
  { name: "Mental", text: "#9D4EDD", background: "#F3E8FA" },
  { name: "Philanthropy", text: "#FF006E", background: "#FFE0ED" },
  { name: "Public", text: "#2A9D8F", background: "#D6F4F1" },
  { name: "Relief", text: "#F94144", background: "#FFE3E3" },
  { name: "Religion", text: "#E9C46A", background: "#FFF7E0" },
  { name: "Research", text: "#3A86FF", background: "#DDE8FF" },
  { name: "Rights", text: "#780000", background: "#FFDADA" },
  { name: "Science", text: "#023E8A", background: "#D7E3FF" },
  { name: "Services", text: "#3F37C9", background: "#E2E0FA" },
  { name: "Society", text: "#577590", background: "#EAF0F5" },
  { name: "Sports", text: "#90BE6D", background: "#EBF6E2" },
  { name: "Wellness", text: "#F28482", background: "#FFEAEA" },
  { name: "Youth", text: "#4CC9F0", background: "#E0F7FF" },
];


export default function SearchPage() {
  const location = useLocation();
  const [discover, setDiscover] = useState(location.state?.discover);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const [popularSearchesList, setPopularSearchesList] =
    useState(popularSearches);

  const removeRecentSearch = (index: number) => {
    setRecentSearchesList((prev) => prev.filter((_, i) => i !== index));
  };

  const removePopularSearch = (index: number) => {
    setPopularSearchesList((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllRecent = () => {
    setRecentSearchesList([]);
  };

  // Show Search2-like content when there's text in search input
  if (search.trim()) {
    return (
      <div className="min-h-screen bg-background">
        <ProfileNavbar title="Search" showBackButton={false} />

        <div className="md:grid md:grid-cols-12">
          {/* Main Content - Takes full width on mobile, 8 columns on desktop */}
          <div className="md:col-span-8">
            {/* Search Bar */}
            <div className="mb-8 px-4 py-6 md:pl-4">
              <div className="relative group w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors z-10" />
                <Input
                  placeholder="Texas flooding"
                  className="bg-gray-100 rounded-[10px] border-none px-12 py-4 text-base placeholder:text-gray-400 w-full"
                  style={{ paddingRight: search ? "3rem" : "1rem" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full z-20"
                    onClick={() => setSearch("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Chip */}
            <div className=" px-4">
              <Badge
                variant="secondary"
                className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                style={{ backgroundColor: "#FFE9DC", color: "#E36414" }}
              >
                Animal Welfare
              </Badge>
            </div>

            {/* Suggested Causes Section */}
            <div className="px-4 mx-4 my-4 md:px-0 md:my-5">
              <h2 className="text-lg font-semibold mb-4">Causes near you</h2>
              <div className="">
                {nearbyCauses.map((cause, index) => (
                  <Link to="/cause" key={index} className="block">
                    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={cause.image}
                            alt={cause.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0  flex-1">
                          <div
                            className={`${
                              cause.type === "Circle"
                                ? "bg-green-100"
                                : "bg-blue-50"
                            } px-3 py-1 rounded-sm w-fit mb-1`}
                          >
                            <p
                              className={`${
                                cause.type === "Circle"
                                  ? "text-green-600"
                                  : "text-blue-600"
                              } text-xs font-semibold`}
                            >
                              {cause.type}
                            </p>
                          </div>
                          <h3 className="font-medium text-sm mb-1">
                            {cause.name}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px]">
                            {cause.description}
                          </p>
                        </div>
                      </div>
                      {cause.type === "Nonprofit" && (
                        <div className="flex flex-col items-center gap-2">
                          <Button className=" text-white text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">
                            Donate Now
                          </Button>
                          <Button
                            variant="link"
                            className="text-primary text-xs p-0 h-auto"
                          >
                            Visit Profile
                          </Button>
                        </div>
                      )}
                      {cause.type === "Circle" && (
                        <div className="flex flex-col items-center gap-2">
                          <Button className="bg-green-600 text-white text-xs py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Join Circle
                          </Button>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Link to="/search">
                  <Button
                    variant="link"
                    className="text-primary flex items-center"
                  >
                    Discover More <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:p-4">
              <PopularPosts related />
            </div>
          </div>

          {/* Right Sidebar for md+ screens */}
          <div className="hidden md:block md:col-span-4 pr-6 py-6 space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Popular Categories
                </h2>
                <div className="overflow-x-auto pb-2">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <Link to="/search" key={index}>
                        <Badge
                          variant="secondary"
                          className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                          style={{ backgroundColor: category.background, color: category.text }}
                        >
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Start a CRWD
                </h2>
                <p className="text-muted-foreground mb-4">
                  Start your own CRWD to support a cause you care about or
                  connect with like-minded individuals.
                </p>
                <Link to="/create-crwd">
                  <Button className="w-full">Create a CRWD</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="md:h-10 h-24" />
        </div>
      </div>
    );
  }

  // Original search page design when no search input
  return (
    <div className="min-h-screen bg-white">
      <ProfileNavbar title="Search" showBackButton={false} />
      {!discover ? (
        <div className="md:grid md:grid-cols-12 md:gap-4  ">
          {/* Main Content */}
          <div className="px-4 py-6 md:pl-4 md:col-span-8 ">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative group w-full">
                <Search className="absolute left-4  top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                <Input
                  placeholder="Texas flooding"
                  className="bg-gray-100 rounded-[10px] border-none px-12 py-4 text-base  placeholder:text-gray-400 w-full"
                  style={{ paddingRight: search ? "3rem" : "1rem" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

            <div className="mb-8 bg-gray-100 rounded-xl text-center p-4">
              {/* <div className="flex items-center justify-center gap-2 mb-4"> */}
              <p className="text-black  text-sm font-[500] mb-10">
                We couldn't find any result for{" "}
                <i className="text-gray-500 font-normal">
                  Kids for Change Austin
                </i>
              </p>
              <p className="text-black font-[500] text-sm mb-5">
                Can't Find What You're Looking For?
              </p>
              {/* </div> */}
              <p className="text-gray-500 text-[12px] mb-5">
                You can submit causes you're interested in{" "}
                <Link to="/create-cause" className="text-primary underline">
                  here
                </Link>
              </p>
            </div>

            {/* Recent Searches */}
            {recentSearchesList.length > 0 && (
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
            {popularSearchesList.length > 0 && (
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
              <CardContent className="space-y-3">
                {popularCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.count} organizations
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
        
          {/* Main Content */}
          <div className="px-4 py-6">
            {/* Title and Description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Impact</h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Find and support organizations that align with your passions. Your next favorite cause is just a click away.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto" onClick={() => setDiscover(false)}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for nonprofits or causes..."
                  className="bg-white border-2 border-gray-200 rounded-full px-12 py-4 text-base placeholder:text-gray-400 w-full focus:border-blue-500 focus:ring-0"
                  disabled={true}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 w-[60%] mx-auto justify-center">
                {discoverCategories.map((category) => (
                  <button
                    key={category.name}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                      selectedCategory === category.name
                        ? "text-white"
                        : "hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.name 
                        ? category.text 
                        : category.background,
                      color: selectedCategory === category.name 
                        ? "white" 
                        : category.text
                    }}
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? "" : category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

        
          </div>
        </div>
      )}

      <div className="h-30 md:hidden" />
    </div>
  );
}
