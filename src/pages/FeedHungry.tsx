"use client";

import React, { useState } from "react";
import {
  Share,
  Bookmark,
  Plus,
  Users,
  Calendar,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

import HamburgerMenu from "@/components/hamburgerMenu/HamburgerMenu";
import PopularPosts from "@/components/PopularPosts";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";

export default function FeedHungry() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Content */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <HamburgerMenu />
            </div>
            <h1 className="text-lg font-semibold">Feed the hungry</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        <main className="pb-16">
          {/* Change 1: Adjusted layout to keep "Feed the hungry" and "supports" on one line, moved buttons to top-right */}
          <div className="flex justify-between items-start p-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/grocery.jpg" alt="CRWD Logo" />
                <AvatarFallback>FH</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex flex-col ">
                  {/* Reduced font size to fit on one line */}
                  <h1 className="text-sm font-bold mr-1">Feed the hungry</h1>
                  <span className="text-muted-foreground text-sm">
                    supports
                  </span>
                </div>
              </div>
            </div>
            {/* Moved Share, Bookmark, Join buttons to top-right */}
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                {/* <Bookmark className="h-4 w-4 mr-1" /> */}
                <Heart className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                className="bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
              >
                Join
              </Button>
            </div>
          </div>

          {/* Change 2: Added "Featuring the Non Profits" section */}
          <div className="px-4 mb-4">
            <h3 className="font-medium mb-2">Featuring the Non Profits:</h3>
            <p className="text-muted-foreground text-sm">
              Grocery Spot, Food for Thought, Meals on Wheels, American Red
              Cross, & Pizza Hut...{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                See More
              </Button>
            </p>
          </div>

          {/* Change 3: Added member count and location */}
          <div className="px-4 mb-4 flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>1.2k members</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Atlanta, GA</span>
            </div>
          </div>

          {/* Change 4: Added upcoming events section */}
          <div className="px-4 mb-6">
            <h3 className="font-medium mb-3">Upcoming Events</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-[#4367FF] text-white rounded-lg p-2 text-center min-w-[50px]">
                    <div className="text-xs font-medium">DEC</div>
                    <div className="text-lg font-bold">15</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Community Food Drive</h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saturday, 10:00 AM</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Community Center</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 py-4">
            <Button
              className="w-full py-6 text-lg bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
              size="lg"
            >
              Donate
            </Button>
          </div>

          <div className="border-t">
            <div className="px-4 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-medium">4 Updates</h2>
              <Link to="/create-post">
                <Button
                  size="icon"
                  className="rounded-xl bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="">
            <PopularPosts />
          </div>
        </main>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block">
        {/* Desktop Header */}
        <ProfileNavbar title="Feed the hungry" />

        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Content */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:flex-wrap md:justify-between md:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src="/grocery.jpg" alt="Founder" />
                      <AvatarFallback>CF</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Founded by</p>
                      <p className="text-primary">@ChadFofana1</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Share className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {/* <Bookmark className="h-4 w-4" /> */}
                      <Heart className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
                    >
                      Join CRWD
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    A community dedicated to fighting hunger in our local area.
                    We organize food drives, volunteer at soup kitchens, and
                    support families in need. Join us in making a difference one
                    meal at a time.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1.2k</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">$12.5k</div>
                    <div className="text-sm text-muted-foreground">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-muted-foreground">Events</div>
                  </div>
                </div>

                {/* Non-Profits */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">
                    Featuring the Non Profits:
                  </h3>
                  <p className="text-muted-foreground">
                    Grocery Spot, Food for Thought, Meals on Wheels, American
                    Red Cross, & Pizza Hut...
                    <Button variant="link" className="p-0 h-auto">
                      See More
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Updates Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-medium">Updates</h2>
                <Link to="/create-post">
                  <Button
                    size="icon"
                    className="rounded-xl bg-[#4367FF] hover:bg-[#4367FF] hover:opacity-85"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
              </CardHeader>

              {/* Posts */}
              <Separator />
              <CardContent className="p-4">
                <PopularPosts />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">Upcoming Events</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-[#4367FF] text-white rounded-lg p-2 text-center min-w-[50px]">
                    <div className="text-xs font-medium">DEC</div>
                    <div className="text-lg font-bold">15</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Community Food Drive</h4>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saturday, 10:00 AM</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Community Center</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Join Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/grocery.jpg" alt="User" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Sarah J.</span> donated{" "}
                        <span className="font-medium">$50</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/grocery.jpg" alt="User" />
                      <AvatarFallback>MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Mike T.</span> joined the
                        CRWD
                      </p>
                      <p className="text-xs text-muted-foreground">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/grocery.jpg" alt="User" />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Anna L.</span> shared an
                        update
                      </p>
                      <p className="text-xs text-muted-foreground">
                        6 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
