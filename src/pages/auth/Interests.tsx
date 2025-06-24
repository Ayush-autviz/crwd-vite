"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ChevronRight } from "lucide-react";

// Define categories and their interests
const CATEGORIES = [
  {
    label: "Technology & Science",
    interests: [
      "Technology", "Science", "Programming", "AI", "Gadgets", "Space", "Engineering"
    ]
  },
  {
    label: "Arts & Entertainment",
    interests: [
      "Music", "Movies", "Books", "Art", "Photography", "Theater", "TV Shows"
    ]
  },
  {
    label: "Lifestyle & Wellness",
    interests: [
      "Travel", "Food", "Fashion", "Fitness", "Health", "DIY", "Home Decor"
    ]
  },
  {
    label: "Sports & Outdoors",
    interests: [
      "Sports", "Hiking", "Cycling", "Running", "Camping", "Fishing", "Yoga"
    ]
  },
  {
    label: "Society & Learning",
    interests: [
      "News", "Finance", "Education", "History", "Politics", "Philosophy", "Languages"
    ]
  }
];

const InterestsPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    // Save interests and navigate to home
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <img src="/logo3.png" width={60} height={60} alt="CRWD Logo" className="mx-auto drop-shadow-sm" />
            <h1 className="text-2xl font-semibold text-gray-900">What interests you?</h1>
            <p className="text-gray-600 text-sm">
              Select topics you'd like to see in your feed. You can always change these later.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {CATEGORIES.map((category) => (
            <div key={category.label} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.label}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {category.interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selected.includes(interest)
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
            </div>
            <Button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsPage;
