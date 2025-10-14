"use client";
import React, { useState } from "react";
import MembersTabNav from "./MembersTabNav";
import MembersList from "./MembersList";
import MembersStatsCard from "./MembersStatsCard";
import CollectiveDonationsSummary from "./CollectiveDonationsSummary";
import RecentDonationsList from "./RecentDonationsList";
import { Card, CardContent } from "@/components/ui/card";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronRight, Search } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { getCollectiveMembers } from "@/services/api/crwd";
import { useQuery } from "@tanstack/react-query";

const members = [
  { name: "Chad F.", username: "chad", connected: true },
  { name: "Mia Cares", username: "miacares1", connected: false },
  { name: "Conrad M.", username: "conradm1", connected: false },
  { name: "Morgan Wallace", username: "moremorgan", connected: false },
  { name: "Ashton Thomas", username: "ash_t2001", connected: false },
  { name: "Marc Paul", username: "makinmymarc", connected: false },
  { name: "Cara Cara", username: "carebear", connected: false },
  { name: "Raquel Wells", username: "rawells", connected: false },
  { name: "Bethany Burke", username: "bburke", connected: false },
  { name: "Max Fields", username: "maxf", connected: false },
];

const MembersTabs: React.FC<{ tab?: string, collectiveData?: any }> = ({ tab = "Members", collectiveData }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(tab);
  const [showRecentDonations, setShowRecentDonations] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Collective Donations") {
      setShowRecentDonations(false);
    }
  };

  // get members from collectiveData
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['members', collectiveData?.id],
    queryFn: () => getCollectiveMembers(collectiveData?.id),
    enabled: !!collectiveData?.id,
  });

  console.log(membersData);

  
  const suggestedCauses = [
    {
      name: "The Red Cross",
      description: "An health organization that...",
      image: "/grocery.jpg",
      type: "Nonprofit",
    },
    {
      name: "St. Judes",
      description: "The leading children's hea...",
      image: "/grocery.jpg",
      type: "Nonprofit",
    },
    {
      name: "Women's Healthcare of At...",
      description: "We are Atlanta's #1 healthca...",
      image: "/grocery.jpg",
      type: "Nonprofit",
    },
  ];

  console.log(collectiveData);

  return (
    <main className="pb-16 md:pb-0">
      {/* Mobile */}
      <div className="md:hidden">
        <ProfileNavbar title="Members" />
        <MembersTabNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          causesCount={collectiveData?.causes?.length ?? 0}
          membersCount={collectiveData?.member_count ?? 0}
          donationsCount={34}
        />
        <div className=" py-2 mt-2">
          {activeTab === "Causes" && (
            // <div className="text-center text-muted-foreground mt-5 px-4">Cause details go here (1 Cause)</div>
            <div className="px-2 mt-2 md:px-0 md:mt-1">
              {/* <h2 className="text-lg font-semibold mb-4">Suggested causes</h2> */}
              <div className="relative mb-4 mt-1 px-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full py-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground "
                />
                <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {collectiveData?.causes?.map((cause: any, index: number) => (
                  <Link to="/cause" key={index} className="block">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={cause.cause.image}
                            alt={cause.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`${
                              
                              
                                "bg-blue-50"
                            } px-3 py-1 rounded-sm w-fit`}
                          >
                            <p
                              className={`${
                             
                                  "text-blue-600"
                              } text-xs font-semibold`}
                            >
                              Nonprofit
                            </p>
                          </div>
                          <h3 className="font-medium text-sm mb-1">
                            {cause.cause.name}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[80%]">
                            {cause.cause.description}
                          </p>
                        </div>
                      </div>
                    
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
                      
                    </div>
                  </Link>
                ))}
              </div>
              {/* <div className="flex justify-end mt-4">
              <Link to="/search">
                <Button variant="link" className="text-primary flex items-center">
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div> */}
            </div>
          )}
          {activeTab === "Members" && <MembersList members={membersData?.results ?? []} isLoading={isMembersLoading} />}
          {activeTab === "Collective Donations" &&
            (showRecentDonations ? (
              <RecentDonationsList
                onBack={() => setShowRecentDonations(false)}
              />
            ) : (
              <CollectiveDonationsSummary
                onSeeRecentDonations={() => setShowRecentDonations(true)}
                causesCount={3}
                membersCount={59}
                donationAmount={34}
              />
            ))}
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <ProfileNavbar title={'Members'} />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */} 
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-primary">{collectiveData?.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{collectiveData?.name}</p>
                      <p className="text-primary">Members</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* Add share/save buttons here if needed */}
                  </div>
                </div>
                <MembersTabNav
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                  causesCount={collectiveData?.causes?.length ?? 0}
                  membersCount={collectiveData?.member_count ?? 0}
                  donationsCount={34}
                />
                {activeTab === "Causes" && (
                  // <div className="text-center text-muted-foreground mt-10">Cause details go here (1 Cause)</div>

                  <div className="px-4 mt-8 md:px-0 md:mt-1">
                    {/* <h2 className="text-lg font-semibold mb-4">Suggested causes</h2> */}
                    {/* <div className="relative mb-4 mt-1 px-4">
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search members..."
                        className="w-full p-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground"
                      />
                      <Search className="absolute left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div> */}
                    <div className="space-y-3">
                      {collectiveData?.causes?.map((cause: any, index: number) => (
                        <Link to="/cause" key={index} className="block">
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
                              
                              
                                "bg-blue-50"
                            } px-3 py-1 rounded-sm w-fit`}
                          >
                            <p
                              className={`${
                             
                                  "text-blue-600"
                              } text-xs font-semibold`}
                            >
                              Nonprofit
                            </p>
                          </div>
                                <h3 className="font-medium text-sm mb-1">
                                  {cause.cause.name}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-[80%]">
                                  {cause.cause.description}
                                </p>
                              </div>
                            </div>
                            
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
                           
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* <div className="flex justify-end mt-4">
                      <Link to="/search">
                        <Button variant="link" className="text-primary flex items-center">
                          Discover More <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div> */}
                  </div>
                )}
                {activeTab === "Members" && <MembersList members={membersData?.results ?? []} isLoading={isMembersLoading} />}
                {activeTab === "Collective Donations" && (
                  <CollectiveDonationsSummary
                    onSeeRecentDonations={() => {}}
                    causesCount={3}
                    membersCount={59}
                    donationAmount={34}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <MembersStatsCard
              activeTab={activeTab}
              count={
                activeTab === "Members"
                  ? collectiveData?.member_count ?? 0
                  : activeTab === "Causes"
                  ? collectiveData?.causes?.length ?? 0
                  : 43
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MembersTabs;
