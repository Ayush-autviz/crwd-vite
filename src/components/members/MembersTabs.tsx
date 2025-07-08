'use client'
import React, { useState } from 'react';
import MembersTabNav from './MembersTabNav';
import MembersList from './MembersList';
import MembersStatsCard from './MembersStatsCard';
import CollectiveDonationsSummary from './CollectiveDonationsSummary';
import RecentDonationsList from './RecentDonationsList';
import { Card, CardContent } from '@/components/ui/card';
import ProfileNavbar from '@/components/profile/ProfileNavbar';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ChevronRight, Search } from 'lucide-react';
import { Avatar } from '../ui/avatar';

const members = [
  { name: 'Chad F.', username: 'chad', connected: true },
  { name: 'Mia Cares', username: 'miacares1', connected: false },
  { name: 'Conrad M.', username: 'conradm1', connected: false },
  { name: 'Morgan Wallace', username: 'moremorgan', connected: false },
  { name: 'Ashton Thomas', username: 'ash_t2001', connected: false },
  { name: 'Marc Paul', username: 'makinmymarc', connected: false },
  { name: 'Cara Cara', username: 'carebear', connected: false },
  { name: 'Raquel Wells', username: 'rawells', connected: false },
  { name: 'Bethany Burke', username: 'bburke', connected: false },
  { name: 'Max Fields', username: 'maxf', connected: false },
];



const MembersTabs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Members');
  const [showRecentDonations, setShowRecentDonations] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Collective Donations') {
      setShowRecentDonations(false);
    }
  };
  const suggestedCauses = [
    {
      name: "The Red Cross",
      description: "An health organization that...",
      image: "/grocery.jpg",
    },
    {
      name: "St. Judes",
      description: "The leading children's hea...",
      image: "/grocery.jpg",
    },
    {
      name: "Women's Healthcare of At...",
      description: "We are Atlanta's #1 healthca...",
      image: "/grocery.jpg",
    },
  ];

  return (
    <main className="pb-16 md:pb-0">
      {/* Mobile */}
      <div className="md:hidden">
        <ProfileNavbar title="Feed the hungry" />
        <MembersTabNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          causesCount={1}
          membersCount={members.length}
          donationsCount={34}
        />
        <div className=" py-2 mt-2">
          {activeTab === 'Causes' && (
            // <div className="text-center text-muted-foreground mt-5 px-4">Cause details go here (1 Cause)</div>
            <div className="px-2 mt-2 md:px-0 md:mt-1">
            {/* <h2 className="text-lg font-semibold mb-4">Suggested causes</h2> */}
            <div className="relative mb-4 mt-1 px-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full py-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground "
              />
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
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
            {/* <div className="flex justify-end mt-4">
              <Link to="/search">
                <Button variant="link" className="text-primary flex items-center">
                  Discover More <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div> */}
          </div>
          )}
          {activeTab === 'Members' && <MembersList members={members} />}
          {activeTab === 'Collective Donations' && (
            showRecentDonations ? (
              <RecentDonationsList onBack={() => setShowRecentDonations(false)} />
            ) : (
              <CollectiveDonationsSummary
                onSeeRecentDonations={() => setShowRecentDonations(true)}
                causesCount={3}
                membersCount={59}
                donationAmount={34}
              />
            )
          )}
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <ProfileNavbar title="Feed the hungry" />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-primary">FH</span>
                    </div>
                    <div>
                      <p className="font-medium">Feed the hungry</p>
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
                  causesCount={1}
                  membersCount={members.length}
                  donationsCount={34}
                />
                {activeTab === 'Causes' && (
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
                    {/* <div className="flex justify-end mt-4">
                      <Link to="/search">
                        <Button variant="link" className="text-primary flex items-center">
                          Discover More <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div> */}
                  </div>
                )}
                {activeTab === 'Members' && <MembersList members={members} />}
                {activeTab === 'Collective Donations' && (
                  <CollectiveDonationsSummary
                    onSeeRecentDonations={() => { }}
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
            <MembersStatsCard activeTab={activeTab} count={activeTab === 'Members' ? members.length : activeTab === 'Cause' ? 1 : 43} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default MembersTabs;