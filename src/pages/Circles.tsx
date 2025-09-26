import { useState } from "react";
import { Plus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Circles = () => {
  const [activeTab, setActiveTab] = useState<"my-crwds" | "discover">(
    "my-crwds"
  );

  // Sample data for discover tab
  const discoverCircles = [
    {
      id: 1,
      name: "The Red Cross",
      description: "An health organization that helps people in need",
      image: "/redcross.png",
      type: "Circle",
      members: 1250,
    },
    {
      id: 2,
      name: "St. Judes",
      description: "The leading children's health organization",
      image: "/grocery.jpg",
      type: "Circle",
      members: 890,
    },
    {
      id: 4,
      name: "Women's Healthcare of At...",
      description: "We are Atlanta's #1 healthcare organization",
      image: "/redcross.png",
      type: "Circle",
      members: 456,
    },
    {
      id: 5,
      name: "St. Judes",
      description: "The leading children's health organization",
      image: "/grocery.jpg",
      type: "Circle",
      members: 890,
    },
    {
      id: 3,
      name: "Women's Healthcare of At...",
      description: "We are Atlanta's #1 healthcare organization",
      image: "/redcross.png",
      type: "Circle",
      members: 456,
    },
  ];

  return (
    <div className="">
      <ProfileNavbar
        title="Circles"
        showMobileMenu={true}
        showDesktopMenu={true}
        showBackButton={true}
        showPostButton={true}
      />

      <div className="md:min-h-screen">
        {/* Header Section */}
        <div className="p-6 text-center flex flex-col items-center">
          {/* <Link to="/create-post" className="w-full flex justify-end">
            <Button variant="outline" className="px-6 py-2 mb-2">
              Post Something
            </Button>
          </Link> */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Giving Circles
          </h1>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Amplify your impact by giving together. Join a giving circle or
            start your own.
          </p>

          {/* Create New Crwd Button */}
          <Link
            to="/create-crwd"
            className=" flex items-center gap-2 justify-center w-fit bg-green-600 hover:bg-green-700 text-white px-4 py-2    rounded-lg text-base font-semibold shadow-lg"
          >
            <Plus className="" strokeWidth={3} />
            <p> Create a New Giving Circle</p>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-6">
          <div className="flex  border-border justify-center">
            <button
              onClick={() => setActiveTab("my-crwds")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "my-crwds"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              My Circles (0)
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "discover"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Discover
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6">
          {activeTab === "my-crwds" ? (
            /* Empty State for My Crwds */
            <div className="text-center pb-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                You haven't joined any giving circles yet.
              </h3>
              <p className="text-muted-foreground ">
                Check out the Discover tab to find a giving circle!
              </p>
            </div>
          ) : (
            /* Discover Tab Content */
            <div className="space-y-4 pb-16">
              {discoverCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 rounded-full flex-shrink-0">
                      <AvatarImage src={circle.image} alt={circle.name} />
                      <AvatarFallback>{circle.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 text-xs px-2 py-1"
                        >
                          {circle.type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {circle.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {circle.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/groupcrwd"
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Learn More
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Circles;
