"use client";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import MembersList from "@/components/members/MembersList";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const causes = [
  { name: "Red Cross", avatar: "https://randomuser.me/api/portraits/men/32.jpg", impact: "Donated $500" },
  { name: "Food for All", avatar: "https://randomuser.me/api/portraits/women/44.jpg", impact: "Volunteered 20h" },
  { name: "Hope Foundation", avatar: "https://randomuser.me/api/portraits/men/65.jpg", impact: "Shared 10 posts" },
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
  { name: "Feed the Hungry", avatar: "https://randomuser.me/api/portraits/men/32.jpg", role: "Admin" },
  { name: "Clean Water Project", avatar: "https://randomuser.me/api/portraits/women/28.jpg", role: "Member" },
];

const tabs = [
  { label: "Causes", value: "causes" },
  { label: "Following", value: "following" },
  { label: "Followers", value: "followers" },
  { label: "CRWDs", value: "crwds" },
];

export default function ProfileStatistics() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("causes");
  const [causesSearch, setCausesSearch] = useState("");
  const [crwdsSearch, setCrwdsSearch] = useState("");

  // Filter functions
  const filteredCauses = causes.filter(cause =>
    cause.name.toLowerCase().includes(causesSearch.toLowerCase()) ||
    cause.impact.toLowerCase().includes(causesSearch.toLowerCase())
  );

  const filteredCrwds = crwds.filter(crwd =>
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
              className={`flex-1 py-4 px-1 text-center rounded-none border-b py-6 cursor-pointer hover:text-blue-500 hover:bg-blue-50 ${activeTab === tab.value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground '}`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === "causes" && (
          <>
              {filteredCauses.map((cause) => (
                <div key={cause.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={cause.avatar} alt={cause.name} />
                      <AvatarFallback>{cause.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{cause.name}</p>
                      {/* <p className="text-sm text-muted-foreground">{cause.impact}</p> */}
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
        {activeTab === "following" && (
          <MembersList members={following} />
        )}
        {activeTab === "followers" && (
          <MembersList members={followers} />
        )}
        {activeTab === "crwds" && (
          <>
              {filteredCrwds.map((crwd) => (
                <div key={crwd.name} className="flex items-center justify-between py-3">
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