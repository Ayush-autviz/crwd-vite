import React from "react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface Community {
  id: string;
  name: string;
  members: number;
  description: string;
  image: string;
}

const SuggestedCommunities = () => {
  const communities: Community[] = [
    {
      id: "1",
      name: "Grocery Spot",
      members: 453,
      description: "Community kitchen every Saturday",
      image: "/view.png",
    },
    {
      id: "2",
      name: "Food for Thought",
      members: 15,
      description: "Solving world hunger. One meal at a time.",
      image: "/view.png",
    },
  ];

  return (
    <div className="bg-white p-4 md:p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-base md:text-lg font-medium text-gray-800">
          Suggested CRWDs
        </h2>
        <Link to="/create-crwd">
          <Button variant="link">Create a CRWD</Button>
        </Link>
      </div>

      <div className="space-y-3 md:space-y-4">
        {communities.map((community) => (
          <div
            key={community.id}
            className="flex p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-200 overflow-hidden mr-3 md:mr-4 flex-shrink-0">
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="min-w-0 mr-2">
                  <h3 className="font-medium text-sm truncate">
                    {community.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {community.members} Members
                  </p>
                </div>
                <button className="bg-blue-500 text-white text-xs font-medium px-3 md:px-4 py-1 rounded-md flex-shrink-0">
                  Join
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate">
                {community.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedCommunities;
