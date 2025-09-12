"use client";
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import MembersList from "@/components/members/MembersList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const causes = [
  {
    name: "Red Cross",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    impact: "Donated $500",
  },
  {
    name: "Food for All",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    impact: "Volunteered 20h",
  },
  {
    name: "Hope Foundation",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    impact: "Shared 10 posts",
  },
];
const following = [
  { name: "Jane Doe", username: "janedoe", connected: true },
  { name: "John Smith", username: "johnsmith", connected: false },
  { name: "Alice Blue", username: "aliceblue", connected: false },
];
const followers = [
  { name: "Chris Red", username: "chrisred", connected: false },
  { name: "Mia Green", username: "miagreen", connected: false },
  { name: "Sam Yellow", username: "samyellow", connected: false },
];
const crwds = [
  {
    name: "Feed the Hungry",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Admin",
  },
  {
    name: "Clean Water Project",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    role: "Member",
  },
];

const tabs = [
  { label: "Causes", value: "causes" },
  { label: "Following", value: "following" },
  { label: "Followers", value: "followers" },
  { label: "CRWDs", value: "crwds" },
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

export default function ProfileStatistics() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "causes";
  const [activeTab, setActiveTab] = useState(tab);
  const [causesSearch, setCausesSearch] = useState("");
  const [crwdsSearch, setCrwdsSearch] = useState("");

  // Filter functions
  const filteredCauses = causes.filter(
    (cause) =>
      cause.name.toLowerCase().includes(causesSearch.toLowerCase()) ||
      cause.impact.toLowerCase().includes(causesSearch.toLowerCase())
  );

  const filteredCrwds = crwds.filter(
    (crwd) =>
      crwd.name.toLowerCase().includes(crwdsSearch.toLowerCase()) ||
      crwd.role.toLowerCase().includes(crwdsSearch.toLowerCase())
  );

  return (
    <main className="pb-16 md:pb-0">
      <ProfileNavbar title="Statistics" />
      <div className=" mx-auto py-3 md:py-6 px-2  md:px-6">
        {/* Tab Nav */}
        <div className="flex justify-around border-b   mb-6 items-center">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              className={`flex-1 py-4 px-1 text-center rounded-none border-b py-6 cursor-pointer hover:text-blue-500 hover:bg-blue-50 ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground "
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "causes" && (
          <div className="">
            {suggestedCauses.map((cause, index) => (
              //  <Link to="/cause" key={index} className="block">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
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
                        cause.type === "Circle" ? "bg-green-100" : "bg-blue-100"
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
                    <h3 className="font-medium text-sm mb-1">{cause.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[200px]">
                      {cause.description}
                    </p>
                  </div>
                </div>
                {cause.type === "Nonprofit" && (
                  <div className="flex flex-col items-center gap-2">
                    <Button className=" text-white text-xs py-2 px-3 rounded-lg  transition-colors">
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
              //  </Link>
            ))}
          </div>
        )}
        {activeTab === "following" && <MembersList members={following} />}
        {activeTab === "followers" && <MembersList members={followers} />}
        {activeTab === "crwds" && (
          <>
            {filteredCrwds.map((crwd) => (
              <div
                key={crwd.name}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={crwd.avatar} alt={crwd.name} />
                    <AvatarFallback>{crwd.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{crwd.name}</p>
                    <p className="text-sm text-muted-foreground">{crwd.role}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-0 text-sm mr-2 cursor-pointer hover:text-blue-500 bg-[#F0F2FB] text-[#4367FF]"
                  size="sm"
                >
                  View
                </Button>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
