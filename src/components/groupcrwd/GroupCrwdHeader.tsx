"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SharePost } from "../ui/SharePost";
import { Badge } from "../ui/badge";
import { useFavorites } from "../../contexts/FavoritesContext";
import { Toast } from "../ui/toast";

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

const categories = [
  {
    name: "Animals",
    text: "#E36414", // Orange-Red
    background: "#FFE1CC", // Soft warm orange tint
  },
  {
    name: "Environment",
    text: "#6A994E", // Olive Green
    background: "#DFF0D6", // Fresh leafy green tint
  },
  {
    name: "Food",
    text: "#FF9F1C", // Carrot Orange
    background: "#FFE6CC", // Gentle light orange tint
  },
];

const GroupCrwdHeader: React.FC<GroupCrwdHeaderProps> = ({
  hasJoined,
  onJoin,
  id,
}) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();
  const groupId = `group-${id}`; // Create unique ID for this group

  const handleFavoriteClick = () => {
    const wasAdded = toggleFavorite(groupId);
    if (wasAdded) {
      setToastMessage("Added to favorites");
    } else {
      setToastMessage("Removed from favorites");
    }
    setShowToast(true);
  };
  return (
    <div className="bg-white  p-4 mx-2   mb-4 flex flex-col gap-2">
      {/* <div className="flex items-center gap-2 justify-between">
        <div className="text-lg font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-md">
          CRWD
        </div>
        <div className="flex items-center gap-2">
          {hasJoined && <Button variant="default">Donate</Button>}
          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <Share2 size={20} />
          </Button>

          <Button
            className={`cursor-pointer transition-colors ${
              hasJoined
                ? "bg-gray-100 text-gray-500"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={onJoin}
            variant={hasJoined ? "outline" : "default"}
          >
            {hasJoined ? (
              <>
                <Check size={16} className="mr-1" />
                Joined
              </>
            ) : (
              "Join CRWD"
            )}
          </Button>
        </div>
      </div> */}
      {/* Top Row */}
      <div className="flex items-center justify-center md:justify-start">
        <div className="flex items-center gap-3">
          {/* <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Feed the hungry" className="w-12 h-12 rounded-lg object-cover" /> */}
          <div className="flex flex-col">
            <span className="font-semibold text-2xl text-gray-700 mt-2">
              Feed the hungry
            </span>
            {/* <span className="text-xs text-gray-500">supports</span> */}
          </div>
        </div>
      </div>

      {/* Founder */}
      <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-500 mt-1">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Founder"
          className="w-14 h-14 rounded-full object-cover"
        />
        <span className=" text-sm text-gray-700">Founded by</span>
        <span className="font-semibold text-gray-700 ">@ChadFofana1</span>
        {/* <Button variant="outline">
          <Bookmark size={20} />
        </Button> */}
        <Heart
          className={`
              w-6 h-6
              ${
                isFavorite(groupId)
                  ? "stroke-red-500 fill-red-500"
                  : "stroke-gray-500 fill-transparent"
              }
              hover:stroke-red-500 hover:fill-red-500
              cursor-pointer transition-colors duration-200
            `}
          onClick={handleFavoriteClick}
        />
      </div>

      {/* Bio */}
      <div className="text-xl text-gray-700">
        families experiencing food insecurity in the greater Atlanta area. Join
        us in the cause to solve world hunger.
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 text-center text-xs text-gray-700 font-semibold divide-x divide-gray-200 rounded-xl py-4">
        <div
          onClick={() => navigate(`/members?tab=Causes`)}
          className="cursor-pointer flex-1 col-span-1 "
        >
          <div className="text-base font-bold">10</div>
          <div className="text-xs text-gray-500 w-1/2 mx-auto">Causes</div>
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
          <div className="text-xs text-gray-500 w-1/2 mx-auto">Donations</div>
        </div>
      </div>
      {/* Tags */}
      {/* <div className="flex gap-2 overflow-x-auto pb-1">
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Animal Welfare</span>
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Environment</span>
      <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">Food Insecurity</span>
    </div> */}
      {/* <ProfileInterests
        interests={["Animal Welfare", "Environment", "Food Insecurity"]}
        className="border-none"
      /> */}

      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <Link to={`/interests`} key={category.name}>
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

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          Recently Supported Nonprofits
        </p>
        <p
          onClick={() => navigate(`/members`)}
          className="text-blue-600 underline cursor-pointer"
        >
          See All
        </p>
      </div>
      {/* Orgs Avatars */}
      <div className="flex items-center justify-start md:space-x-5 mt-1 gap-3">
        {orgAvatars.map((src) => (
          <Link to={`/cause`} key={src.name}>
            <div className="flex flex-col items-center">
              <img
                src={src.image}
                alt="org"
                className="w-12 h-12 rounded-md   first:ml-0"
              />
              <p className="text-xs font-semibold  mt-1 text-gray-500">
                {src.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {/* Supporting text */}
      {/* <div className="text-xs text-gray-500 mt-1">
        Currently supporting{" "}
        <span className="font-semibold">10 Non Profits</span>: Grocery Spot,
        Food for Thought, Meals on Wheels, American Red Cross, & Pizza Hut…{" "}
        <span
          onClick={() => navigate(`/members`)}
          className="text-blue-600 underline cursor-pointer"
        >
          See All
        </span>
      </div> */}

      <SharePost
        url={window.location.origin + `/groupcrwd/${id}`}
        title={`Feed the hungry - CRWD`}
        description="Join us in supporting families experiencing food insecurity in the greater Atlanta area."
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
      {/* Donate Button */}
      {/* <button className="w-full bg-blue-600 text-white rounded-md py-4 font-semibold text-base mt-2 shadow-lg hover:bg-blue-700 transition">Donate</button> */}
    </div>
  );
};

export default GroupCrwdHeader;
