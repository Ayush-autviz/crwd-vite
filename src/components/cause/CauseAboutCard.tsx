
"use client"
import React, { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from 'react-router-dom';

const CauseAboutCard: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const shortDescription = "This is a bio about Non Profit and how they give back to their community so that users can learn about how their money is supporting others.";

  const fullDescription = `This is a bio about Non Profit and how they give back to their community
      so that users can learn about how their money is supporting others. Here's
      more information about our non-profit. This is a long description so that
      you can learn about all the details of our organization. We love what we
      do and we hope you do too. Please reach out if you have any questions.`;

  return (
  <div className="bg-white  p-5 mx-3 mb-2 flex flex-col gap-3">
    <div className="flex items-center gap-3 ">
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="Helping humanity"
        className="w-12 h-12 rounded-lg object-cover"
      />
      <span className="font-semibold text-base text-gray-900">
        Helping humanity
      </span>
    </div>
    <div className="text-lg text-gray-700">
      {fullDescription}
      {/* <div className="mt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:text-blue-800"
        >
          {expanded ? (
            <>
              Show Less
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              Learn More
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div> */}
    </div>
    <div className="text-sm flex gap-4 items-start  text-gray-600 ">
      <span className="font-semibold  gap-1 text-lg col-span-1">
        <MapPin />
      </span>

      <div className="col-span-11 flex flex-col gap-6 -mt-1 ">
        <div className="text-sm flex flex-col gap-1  text-gray-600">
          <span className="font-semibold text-lg">Address</span>
          <span className="text-sm font-semibold">
            123 Main Street. USA 10010
          </span>
        </div>

        <div className="text-sm flex flex-col gap-1  text-gray-600">
          <span className="font-semibold">MAIN FOCUS</span>{" "}
          <Link to="/search?q=Animal%20Welfare">
            <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">Animal Welfare</span>
          </Link>
        </div>
        <div className="text-sm flex flex-col gap-1  text-gray-600">
          <span className="font-semibold">ESTABLISHED</span>{" "}
          <span className=" font-semibold">2012</span>
        </div>
        <div className="text-sm flex flex-col gap-1  text-gray-600">
          <span className="font-semibold">TAX ID</span>{" "}
          <span className=" font-semibold">10125-3129</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Helping Humanity is a 501(c)(3) public charity, EIN 13-1788491.
        </div>
      </div>
    </div>
  </div>
  );
};

export default CauseAboutCard;
