"use client";

import React, { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";
import ProfileInterests from "../profile/ProfileInterests";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { SharePost } from "../ui/SharePost";

interface GroupCrwdHeaderProps {
  hasJoined: boolean;
  onJoin: () => void;
  id: string;
}

const orgAvatars = [
  {
    name: "ASPCA",
    image: "/ngo/aspca.jpg",
  },
  {
    name: "CRI",
    image: "/ngo/CRI.jpg",
  },
  {
    name: "CureSearch",
    image: "/ngo/cureSearch.png",
  },
  {
    name: "Paws",
    image: "/ngo/paws.jpeg",
  },
];

const GroupCrwdHeader: React.FC<GroupCrwdHeaderProps> = ({
  hasJoined,
  onJoin,
  id,
}) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  return (
    <div className="bg-white  p-4 mx-2   mb-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 ml-auto">
        {hasJoined && <Button variant="default">Donate</Button>}
        <Button variant="outline" onClick={() => setShowShareModal(true)}>
          <Share2 size={20} />
        </Button>
        <Button variant="outline">
          <Bookmark size={20} />
        </Button>
        <Button
          className="cursor-pointer transition-colors"
          onClick={onJoin}
          variant={hasJoined ? "outline" : "default"}
        >
          {hasJoined ? (
            <>
              <Check size={16} className="mr-1" />
              Joined
            </>
          ) : (
            "Join"
          )}
        </Button>
      </div>
      {/* Top Row */}
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-3">
          {/* <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Feed the hungry" className="w-12 h-12 rounded-lg object-cover" /> */}
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-700">
              Feed the hungry
            </span>
            {/* <span className="text-xs text-gray-500">supports</span> */}
          </div>
        </div>
      </div>
      {/* Bio */}
      <div className="text-xl text-gray-700">
        families experiencing food insecurity in the greater Atlanta area. Join
        us in the cause to solve world hunger.
      </div>
      {/* Founder */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Founder"
          className="w-5 h-5 rounded-full object-cover"
        />
        Founded by{" "}
        <span className="font-semibold text-gray-700">@ChadFofana1</span>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 text-center text-xs text-gray-700 font-semibold divide-x divide-gray-200 rounded-xl py-4">
        <div
          onClick={() => navigate(`/members?tab=Causes`)}
          className="cursor-pointer flex-1 col-span-1"
        >
          <div className="text-base font-bold">10</div>
          <div className="text-xs text-gray-500">Causes Supported</div>
        </div>
        <div
          onClick={() => navigate(`/members`)}
          className="cursor-pointer flex-1 col-span-1  "
        >
          <div className="text-base font-bold">58</div>
          <div className="text-xs text-gray-500">Members</div>
        </div>
        <div
          onClick={() => navigate(`/members?tab=Collective%20Donations`)}
          className="cursor-pointer flex-1 col-span-1"
        >
          <div className="text-base font-bold">12</div>
          <div className="text-xs text-gray-500">Collective Donations</div>
        </div>
      </div>
      {/* Tags */}
      {/* <div className="flex gap-2 overflow-x-auto pb-1">
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Animal Welfare</span>
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Environment</span>
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Food Insecurity</span>
    </div> */}
      <ProfileInterests
        interests={["Animal Welfare", "Environment", "Food Insecurity"]}
        className="border-none"
      />

      <p className="text-sm font-semibold text-gray-700">
        Recently Supported Nonprofits
      </p>
      {/* Orgs Avatars */}
      <div className="flex items-center justify-start md:space-x-5 mt-1 gap-3">
        {orgAvatars.map((src, i) => (
          <div className="flex flex-col items-center">
            <img
              key={i}
              src={src.image}
              alt="org"
              className="w-10 h-10 rounded-md   first:ml-0"
            />
            <p className="text-xs font-semibold  mt-1 text-gray-500">
              {src.name}
            </p>
          </div>
        ))}
      </div>
      {/* Supporting text */}
      <div className="text-xs text-gray-500 mt-1">
        Currently supporting{" "}
        <span className="font-semibold">10 Non Profits</span>: Grocery Spot,
        Food for Thought, Meals on Wheels, American Red Cross, & Pizza Hut…{" "}
        <span
          onClick={() => navigate(`/members`)}
          className="text-blue-600 underline cursor-pointer"
        >
          See All
        </span>
      </div>

      <SharePost
        url={window.location.origin + `/groupcrwd/${id}`}
        title={`Feed the hungry - CRWD`}
        description="Join us in supporting families experiencing food insecurity in the greater Atlanta area."
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
      {/* Donate Button */}
      {/* <button className="w-full bg-blue-600 text-white rounded-md py-4 font-semibold text-base mt-2 shadow-lg hover:bg-blue-700 transition">Donate</button> */}
    </div>
  );
};

export default GroupCrwdHeader;
