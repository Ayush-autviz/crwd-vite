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
import CausesCarousel from "@/components/CausesCarousel";
import { useState } from "react";
import HomeBanner from "@/components/HomeBanner";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [showMobileFooter, setShowMobileFooter] = useState(true);

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
    {
      name: "Animals",
      text: "#E36414", // Orange-Red
      background: "#FFE1CC", // Softer warm orange tint
    },
    {
      name: "Environment",
      text: "#6A994E", // Olive Green
      background: "#DFF0D6", // Fresh leafy green tint
    },
    {
      name: "Food",
      text: "#FF9F1C", // Carrot Orange
      background: "#FFE6CC", // Light orange tint (not too pale)
    },
    {
      name: "Education",
      text: "#FFB84D", // Amber
      background: "#FFEFD1", // Gentle amber tint
    },
    {
      name: "Health",
      text: "#D62828", // Crimson
      background: "#FFD6D6", // Soft rosy red tint
    },
    {
      name: "Rights",
      text: "#780000", // Maroon
      background: "#F2C7C7", // Muted pinkish tint
    },
    {
      name: "Housing",
      text: "#8D6E63", // Brown
      background: "#EADFD9", // Warm earthy beige tint
    },
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

  // Sample data for nearby causes
  const nearbyCauses = [
    {
      name: "The Red Cross",
      type: "Circle",
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
      type: "Circle",
      description: "We are Atlanta's #1 healthcare organization",
      image: "/redcross.png",
    },
  ];

  return (
    <div className="">
      <ProfileNavbar
        title="Home"
        showMobileMenu={true}
        showDesktopMenu={true}
        showBackButton={false}
      />
      <div className="md:grid md:grid-cols-12 md:gap-6 md:pt-6 md:px-6">
        {/* Main Content - Takes full width on mobile, 8 columns on desktop */}
        <div className="md:col-span-12">
          {/* Search Input */}
          <div className="hidden md:block p-4 md:p-0 md:mb-6">
            <div className="relative">
              <Link to="/search">
                <Input
                  type="search"
                  placeholder="Texas flooding"
                  className="bg-muted/50 border-none pl-10"
                  disabled={true}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="overflow-x-auto pb-2 flex mt-5 md:mt-0 px-4 scrollbar-none">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category, index) => (
                  <Link to={`/interests`} key={index}>
                    <Badge
                      variant="secondary"
                      className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                      style={{
                        backgroundColor: category.background,
                        color: category.text,
                      }}
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="p-4 md:p-0 md:mb-6">
            <div className=" p-6 md:p-8 rounded-2xl text-center  relative overflow-hidden">
              {/* Content */}
              <div className="relative ">
                <h1 className="text-black text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight max-w-3xl mx-auto">
                  The easiest way to <i className="text-green-600">give </i>
                  to everything you care about, at once.
                </h1>

                <Link to="/onboarding">
                  <Button className="bg-[#0047FF] text-primary-foreground px-10 py-5 rounded-lg text-base font-semibold ">
                    Start Giving
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Causes Carousel */}
          <div className="p-4 md:p-0 md:mb-6">
            <CausesCarousel />
          </div>

          {/* <div className="p-4 md:p-0">
            <TopicsList topics={topi} />
          </div> */}

          {/* Suggested CRWDs Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Discover giving in action
              </h2>
              <Link to="/create-crwd">
                <Button variant="link" className="text-primary p-0 h-auto">
                  Create a Giving Circle
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 w-max">
                {suggestedCRWDs.map((crwd, index) => (
                  <Link to="/groupcrwd" key={index} className="block">
                    <div className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors bg-gray-50 min-w-[200px]">
                      {/* Image on top */}
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={crwd.image}
                          alt={crwd.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Text content below image */}
                      <div className="text-center">
                        <h3 className="font-medium text-sm mb-1">
                          {crwd.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1">
                          {crwd.members}
                        </p>
                        <p className="text-xs text-muted-foreground w-36 leading-relaxed">
                          {crwd.description.length > 21
                            ? `${crwd.description.slice(0, 21)}..`
                            : crwd.description}
                        </p>
                      </div>

                      {/* <div className="bg-green-100 px-3 py-1 rounded-sm flex items-center justify-center">
                        <p className="text-green-600 text-xs font-semibold">
                          CRWD
                        </p>
                      </div> */}

                      {/* Button at the bottom */}
                      <Button className="bg-green-600 text-white text-xs py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Learn More
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Section */}
          {/* <div className="px-4 mt-8 md:px-0 md:mt-10">
            <h2 className="text-lg font-semibold mb-4">Explore Categories</h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2 min-w-max">
                {categories.map((category, index) => (
                  <Link to={`/interests`} key={index}>
                    <Badge
                      variant="secondary"
                      className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
                      style={{
                        backgroundColor: category.background,
                        color: category.text,
                      }}
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Link to="/search" state={{ discover: true }}>
                <Button
                  variant="link"
                  className="text-primary flex items-center"
                >
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div> */}

          {/* Suggested Causes Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-10">
            <h2 className="text-lg font-semibold mb-4">Find Your Cause</h2>
            <div className="space-y-5">
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
                      <div className="min-w-0 flex-1">
                        <div
                          className={`${
                            cause.type === "Circle"
                              ? "bg-green-100"
                              : "bg-blue-50"
                          } px-3 py-1 rounded-sm w-fit`}
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
                          Learn More
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Link to="/search" state={{ discover: true }}>
                <Button
                  variant="link"
                  className="text-primary flex items-center"
                >
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Why CRWDs Section */}
          <div className="px-4 my-8 md:px-0 md:my-10">
            <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-background p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Why CRWD?
                </h2>
                <h4 className="text-lg md:text-xl font-semibold text-gray-500 mb-4">
                  Giving should be simple
                </h4>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                  On CRWD, one donation supports all the causes you care about.
                  You're not just donating, you're joining others who care about
                  the same things, creating bigger impact together.
                </p>
              </div>

              <HomeBanner />
            </div>
          </div>

          {/* Causes and CRWDs near you Section */}
          <div className="px-4 mt-8 md:px-0 md:mt-8">
            <h2 className="text-lg font-semibold mb-4">Causes near you</h2>
            <div className="space-y-3">
              {nearbyCauses.map((cause, index) => (
                <Link
                  to={cause.type === "Nonprofit" ? "/cause" : "/groupcrwd"}
                  key={index}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-card">
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
                        <div
                          className={`${
                            cause.type === "Circle"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          } px-3 py-1 rounded-sm w-fit`}
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
                        {/* <div className="min-w-0"> */}
                        <h3 className="font-medium text-sm truncate">
                          {cause.name}
                        </h3>
                        {/* <p className="text-xs text-muted-foreground truncate mb-1">
                          {cause.type}
                        </p> */}
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
                          Learn More
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

          <div className="mr-auto  ">
            <PopularPosts />
          </div>
          <div className="md:-mx-6">
            <Footer />
          </div>
        </div>

        {/* Sidebar - Only visible on desktop */}
        <div className="hidden  md:col-span-4">
          {/* <Card className="">
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
          </Card> */}

          <Card className="">
            <CardContent className="">
              <h2 className="text-xl font-bold mb-4">Start a CRWD</h2>
              <p className="text-muted-foreground mb-4">
                Start your own CRWD to support a cause you care about or connect
                with like-minded individuals.
              </p>
              <Button className="w-full">Create a CRWD</Button>
            </CardContent>
          </Card>
        </div>

        {/* mobile app footer */}
        {showMobileFooter && (
          <div className="fixed bottom-5 left-0 right-0 mx-2 md:hidden z-50">
            <div className="bg-white p-4 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                {/* App Icon with glow effect */}
                <div className="relative">
                  <div className="w-18 h-18 rounded-2xl flex items-center justify-center p-2">
                    <img
                      src="/icons/CRWD.png"
                      alt="CRWD app"
                      className="w-12 h-12"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-xs sm:text-lg leading-tight font-semibold w-3/4">
                    Easily manage all your donations at once
                  </p>
                  <Button className="bg-black hover:bg-black/90 text-white text-sm font-bold py-3 px-6 rounded-full border-0 mt-2">
                    Get the App
                  </Button>
                  <button
                    onClick={() => setShowMobileFooter(false)}
                    className="w-10 h-10 cursor-pointer bg-white/20 rounded-full absolute top-0 right-0 hover:bg-white/30 transition-all duration-200 hover:scale-110 border border-white/30"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-black"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
