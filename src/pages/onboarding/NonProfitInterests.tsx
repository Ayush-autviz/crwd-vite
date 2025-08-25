import React, { useState } from "react";
import { Check, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const interestsData = [
  {
    id: 1,
    name: "Shriners Children",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Shriners_Hospitals_for_Children_Logo.svg/500px-Shriners_Hospitals_for_Children_Logo.svg.png",
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Change",
    image:
      "https://images.squarespace-cdn.com/content/v1/5fd7e20940f9b820fac1e013/d442cb1f-e175-4b8d-bc81-44102583a6a5/thumbnail-05.png",
    color: "#EF4444",
  },
  {
    id: 3,
    name: "The Water Trust",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQEHqcfGhnH29g/company-logo_200_200/company-logo_200_200/0/1630573980553/the_water_trust_logo?e=2147483647&v=beta&t=fjyZGioRcUDheVZH_f8dxxSvR7840DFgAp6XrGwo8hw",
    color: "#10B981",
  },
  {
    id: 4,
    name: "WWF",
    image:
      "https://i0.wp.com/acrossthegreen.com/wp-content/uploads/2021/03/75E8B176-DAFE-4956-ABC5-9F221ACB2094.png?fit=1020%2C680&ssl=1",
    color: "#F59E0B",
  },
  {
    id: 5,
    name: "Wounded Warrior Project",
    image:
      "https://flooringresources.com/sites/default/files/styles/square_large/public/2022-01/1320-pps-wounded-warrior-classic.jpg?itok=4asRq76x",
    color: "#8B5CF6",
  },
  {
    id: 6,
    name: "Girls Who Code",
    image:
      "https://media.licdn.com/dms/image/v2/C4D0BAQEHUTYYyPFEhQ/company-logo_200_200/company-logo_200_200/0/1630509785189/girlswhocode_logo?e=2147483647&v=beta&t=eqyanOv949sDS3M_EnIq_wabT-1mN3uHQXVyB_FCTBI",
    color: "#F97316",
  },
];

// Create unique IDs for each interest by duplicating the data with different IDs
const nonProfitInterests = [
  ...interestsData.map((item, index) => ({
    ...item,
    id: item.id + index * 1000,
  })),
  // ...interestsData.map((item, index) => ({
  //   ...item,
  //   id: item.id + index * 1000 + 100,
  // })),
  // ...interestsData.map((item, index) => ({
  //   ...item,
  //   id: item.id + index * 1000 + 200,
  // })),
  // ...interestsData.map((item, index) => ({
  //   ...item,
  //   id: item.id + index * 1000 + 300,
  // })),
  // ...interestsData.map((item, index) => ({
  //   ...item,
  //   id: item.id + index * 1000 + 400,
  // })),
  // ...interestsData.map((item, index) => ({
  //   ...item,
  //   id: item.id + index * 1000 + 500,
  // })),
];

const categories = [
  "Health",
  "Education",
  "Environment",
  "Arts",
  "Animals",
  "Poverty",
  "Veterans",
  "Children",
];

export default function NonProfitInterests() {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleInterestSelect = (interestId: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      return;
    }

    // Navigate to completion screen
    navigate("/complete-onboard");
  };

  const InterestCard = ({
    interest,
  }: {
    interest: (typeof nonProfitInterests)[0];
  }) => {
    const isSelected = selectedInterests.includes(interest.id);

    return (
      <button
        className={`p-2 md:p-3 w-full bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
          isSelected
            ? "border-blue-500 shadow-lg"
            : "border-gray-200 shadow-md hover:shadow-lg"
        }`}
        onClick={() => handleInterestSelect(interest.id)}
      >
        <img
          src={interest.image}
          alt={interest.name}
          className="w-4/5 h-12 md:h-16 mx-auto object-contain mb-2 md:mb-3"
        />
        <div className="p-1 md:p-2">
          <h3 className="text-xs md:text-sm font-medium text-gray-800 text-center leading-tight">
            {interest.name}
          </h3>
        </div>

        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute top-1 md:top-2 left-1 md:left-2">
            <div className="w-4 md:w-5 h-4 md:h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Check size={12} className="text-white md:w-3.5 md:h-3.5" />
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-2xl">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4 md:p-8 space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-black rounded-full"></div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Find causes that fit you
                </h1>
                <p className="text-gray-600 text-sm">
                  Choose at least 1 to start. You can add more anytime.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search causes or nonprofits"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-gray-100 border-0 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category ? "" : category
                      )
                    }
                    className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                      selectedCategory === category
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Interests Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {nonProfitInterests.map((interest, index) => (
                  <div key={index} className="relative">
                    <InterestCard interest={interest} />
                  </div>
                ))}
              </div>

              {/* Selection Summary */}
              {selectedInterests.length > 0 && (
                <div className="text-center min-h-[24px]">
                  <p className="text-sm text-gray-600">
                    You've chosen {selectedInterests.length} cause
                    {selectedInterests.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <div className="pt-2 md:pt-4">
                <button
                  className={`w-full h-10 rounded-lg font-medium transition-colors duration-200 ${
                    selectedInterests.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                  onClick={handleContinue}
                  disabled={selectedInterests.length === 0}
                >
                  Continue
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
