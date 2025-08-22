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
import { Link } from "react-router-dom";
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

const suggestedCauses = [
  {
    name: "The Red Cross",
    type: "NonProfit",
    description: "An health organization that helps people in need",
    image: "/redcross.png",
  },
  {
    name: "St. Judes",
    type: "CRWD",
    description: "The leading children's health organization",
    image: "/grocery.jpg",
  },
  // {
  //   name: "Women's Healthcare of At...",
  //   type: "Cause",
  //   description: "We are Atlanta's #1 health care organization",
  //   image: "/redcross.png",
  // },
];

const categories = [
  "Animal Welfare",
  "Environment",
  "Food Insecurity",
  "Education",
  "Healthcare",
  "Social Justice",
  "Homelessness",
];

export default function SearchPage() {
  const [search, setSearch] = useState("");
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
              >
                Animal Welfare
              </Badge>
            </div>

            {/* Suggested Causes Section */}
            <div className="px-4 mx-4 my-4 md:px-0 md:my-5">
              <h2 className="text-lg font-semibold mb-4">Find Your Cause</h2>
              <div className="">
                {suggestedCauses.map((cause, index) => (
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
                              cause.type === "CRWD"
                                ? "bg-green-100"
                                : "bg-blue-100"
                            } px-3 py-1 rounded-sm w-fit mb-1`}
                          >
                            <p
                              className={`${
                                cause.type === "CRWD"
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
                      {cause.type === "NonProfit" && (
                        <div className="flex flex-col items-center gap-2">
                          <Button className="bg-primary text-white text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">
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
                      {cause.type === "CRWD" && (
                        <div className="flex flex-col items-center gap-2">
                          <Button className="bg-green-600 text-white text-xs py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Join CRWD
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
                    {[
                      ...categories,
                      "Education",
                      "Healthcare",
                      "Homelessness",
                    ].map((category, index) => (
                      <Link to="/search" key={index}>
                        <Badge
                          variant="secondary"
                          className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                        >
                          {category}
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

      <div className="h-30 md:hidden" />
    </div>
  );
}
