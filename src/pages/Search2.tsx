"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import PopularPosts from "@/components/PopularPosts";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";

const orgs = [
  {
    name: "PAWS Atlanta",
    desc: "Leading pet organization that…",
    image: "/redcross.png",
  },
  {
    name: "Humane Society",
    desc: "Family's first choice fo…",
    image: "/grocery.jpg",
  },
  {
    name: "Vegans R Us",
    desc: "We love animals and st…",
    image: "/redcross.png",
  },
];

const suggestedCauses = [
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

const posts = [
  {
    user: {
      name: "mynameismya",
      avatar: "/grocery.jpg",
      crwd: "feedthehungry",
      time: "17h",
    },
    content:
      "The quick, brown fox jumps over a lazy dog. DJs flock by <b>animal welfare</b> quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!",
    likes: 258,
    comments: 15,
    shares: 3,
    image: null,
  },
  {
    user: null,
    content:
      "The quick, brown fox jumps over a lazy dog. DJs flock by <b>animal welfare</b> quiz prog. Junk",
    likes: 1000,
    comments: 170,
    shares: 23,
    image: "/nature.jpg",
  },
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

export default function Search2Page() {
  const [search, setSearch] = useState("");
  return (
    <div className="min-h-screen bg-background ">
      <ProfileNavbar title="Discover" />


      <div className="md:grid md:grid-cols-12  ">
        {/* Main Content - Takes full width on mobile, 8 columns on desktop */}
        <div className="md:col-span-8 ">
          {/* Search Bar */}
          <div className="mb-6  md:mb-6 mt-4 px-4">
            <Input
              placeholder="Texas flooding"
              className="bg-muted/50 rounded-lg px-4 py-2 text-base border-none focus-visible:ring-1 focus-visible:ring-primary/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Chip */}
          <div className="mb-6 px-4">
            <Badge
              variant="secondary"
              className="bg-muted/50 hover:bg-muted text-foreground rounded-md px-4 py-2 whitespace-nowrap"
            >
              Animal Welfare
            </Badge>
          </div>

          {/* Suggested Causes Section */}
          <div className="mt-4 px-4">
            {/* <h2 className="text-lg font-semibold mb-4">Suggested causes</h2> */}
            <div className="space-y-3">
              {suggestedCauses.map((cause, index) => (
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
          <div className="md:p-4 ">
            <PopularPosts />
          </div>
        </div>
        {/* Right Sidebar for md+ screens */}
        <div className="hidden md:block md:col-span-4 p-4">
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
              <Link to="/create-crwd">
                <Button className="w-full">
                  Create a CRWD
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div className="md:h-10 h-24" />
      </div>

    </div>
  );
}
