import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TopicsList from "@/components/TopicsList";
import PopularPosts from "@/components/PopularPosts";
import ProfileNavbar from "@/components/profile/ProfileNavbar";

export default function HomePage() {
  const topi: any = [
    {
      id: "1",
      name: "NFT Funding",
      posts: 34,
      avatars: ["1", "2", "3"],
    },
    {
      id: "2",
      name: "Harvard",
      posts: 126,
      avatars: ["4", "5", "6", "7"],
    },
    {
      id: "3",
      name: "#givingtuesday",
      posts: 156,
      avatars: ["8", "9", "10", "11"],
    },
  ];
  
  // Sample data for suggested CRWDs
  const suggestedCRWDs = [
    {
      name: "Grocery Spot",
      members: "303 Members",
      description: "Community lunches every Saturday",
      image: "/grocery.jpg",
    },
    {
      name: "Food for Thought",
      members: "78 Members",
      description: "Solving world hunger. One meal at a time.",
      image: "/grocery.jpg",
    },
    {
      name: "Food for Thought",
      members: "78 Members",
      description: "Solving world hunger. One meal at a time.",
      image: "/grocery.jpg",
    },
    {
      name: "Grocery Spot",
      members: "303 Members",
      description: "Community lunches every Saturday",
      image: "/grocery.jpg",
    },
    {
      name: "Food for Thought",
      members: "78 Members",
      description: "Solving world hunger. One meal at a time.",
      image: "/grocery.jpg",
    },
    {
      name: "Food for Thought",
      members: "78 Members",
      description: "Solving world hunger. One meal at a time.",
      image: "/grocery.jpg",
    },
  ];

  // Sample data for categories
  const categories = [
    "Animal Welfare",
    "Environment",
    "Food Insecurity",
    "Food Insecurity",
    "Environment",
    "Education",
    "Healthcare",
    "Social Justice",
    "Homelessness",
  ];

  // Sample data for suggested causes
  const suggestedCauses = [
    {
      name: "The Red Cross",
      description: "An health organization that...",
      image: "/redcross.png",
    },
    {
      name: "St. Judes",
      description: "The leading children's hea...",
      image: "/grocery.jpg",
    },
    {
      name: "Women's Healthcare of At...",
      description: "We are Atlanta's #1 healthca...",
      image: "/redcross.png",
    },
  ];

  // Sample data for nearby causes
  const nearbyCauses = [
    {
      name: "The Red Cross",
      type: "Cause",
      description: "An health organization that...",
      image: "/redcross.png",
    },
    {
      name: "St. Judes",
      type: "CRWD",
      description: "The leading children's hea...",
      image: "/grocery.jpg",
    },
    {
      name: "Women's Healthcare of At...",
      type: "Cause",
      description: "We are Atlanta's #1 healthca...",
      image: "/redcross.png",
    },
  ];

  return (
    <div className="pb-16 md:pb-0">
      <ProfileNavbar title="Home" showMobileMenu={true} showDesktopMenu={true} />
      <div className="md:grid md:grid-cols-12 md:gap-6 md:p-6">
        {/* Main Content - Takes full width on mobile, 8 columns on desktop */}
        <div className="md:col-span-8">
          {/* Search Input */}
          <div className="p-4 md:p-0 md:mb-6">
            <Input
              type="search"
              placeholder="Search"
              className="bg-muted/50 border-none"
              //@ts-ignore
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
            />
          </div>

          <div className="p-4 md:p-0">
            <TopicsList topics={topi} />
          </div>

          {/* Causes and CRWDs near you Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-8">
            <h2 className="text-lg font-semibold mb-4">
            Local Causes and CRWDs
            </h2>
            <div className="space-y-3">
              {nearbyCauses.map((cause, index) => (
                <Link to={cause.type === "Cause" ? "/cause" : "/groupcrwd"} key={index} className="block">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card"
                  >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
                        {cause.image && (
                          <img
                            src={cause.image}
                            alt={cause.name}
                            className="object-cover"
                          />
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {cause.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {cause.type}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cause.description}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
                      Visit
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Link to="/search">
                <Button variant="link" className="text-primary flex items-center">
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-10">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category, index) => (
                  <Link to={`/search`} key={index}>
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
          </div>

          {/* Suggested CRWDs Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Suggested CRWD's</h2>
              <Link to="/create-crwd">
                <Button variant="link" className="text-primary p-0 h-auto">
                  Create a CRWD
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-2 grid-flow-col gap-4 w-max">
                {suggestedCRWDs.map((crwd, index) => (
                  <Link to="/groupcrwd" key={index} className="block w-[340px]">
                    <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/100 cursor-pointer transition-colors bg-muted/50"
                    >
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
                          {crwd.image && (
                            <img
                              src={crwd.image}
                              alt={crwd.name}
                              className="object-cover"
                            />
                          )}
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {crwd.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {crwd.members}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {crwd.description}
                          </p>
                        </div>
                      </div>
                      <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
                        Visit
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Causes Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-10">
            <h2 className="text-lg font-semibold mb-4">Suggested causes</h2>
            <div className="space-y-3">
              {suggestedCauses.map((cause, index) => (
                <Link to="/cause" key={index} className="block">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card"
                  >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0">
                        {cause.image && (
                          <img
                            src={cause.image}
                            alt={cause.name}
                            className="object-cover"
                          />
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {cause.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {cause.description}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-primary text-white text-xs h-8 px-4 md:px-6 flex-shrink-0 cursor-pointer">
                      Visit
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Link to="/search">
                <Button variant="link" className="text-primary flex items-center">
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mr-auto  ">
            <PopularPosts />
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden md:block md:col-span-4">
          <Card className="">
            <CardContent className="">
              <h2 className="text-xl font-bold mb-4">Popular Categories</h2>
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

          <Card className="mt-6">
            <CardContent className="">
              <h2 className="text-xl font-bold mb-4">Start a CRWD</h2>
              <p className="text-muted-foreground mb-4">
                Start your own CRWD to support a cause you care about or connect
                with like-minded individuals.
              </p>
              <Button className="w-full">
                Create a CRWD
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
