import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Star, Search, ArrowRight, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/constants/categories";

export default function NewCompleteOnboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Get selected categories from previous step (if passed via location state)
  const selectedCategories = (location.state?.selectedCategories as string[]) || [];
  
  // Get the first selected category name for display
  const firstSelectedCategory = selectedCategories.length > 0
    ? categories.find((cat) => cat.id === selectedCategories[0])
    : null;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    // TODO: Handle option selection (no API integration as per requirements)
    console.log("Selected option:", option);
  };

  const handleEditCategories = () => {
    // Navigate back to categories selection
    navigate("/non-profit-interests", { 
      state: { selectedCategories } 
    });
  };

  const handleSkip = () => {
    // TODO: Handle skip action
    // Navigate to next step or home
    // navigate("/new-home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-xl p-6 md:p-8 shadow-lg">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-12 bg-gray-900 rounded-full"></div>
        </div>

        {/* Heart Icon with Gradient */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
          Set Up Your Donation Box
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 text-center mb-4">
          Choose nonprofits to support. Your donation gets split evenly among them. You can change these anytime!
        </p>

        {/* Category Tag */}
        {firstSelectedCategory && (
          <div className="flex justify-center mb-8">
            <span
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: firstSelectedCategory.text }}
            >
              {firstSelectedCategory.name}
            </span>
          </div>
        )}

        {/* Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Surprise Me Card */}
          <button
            onClick={() => handleOptionSelect("surprise")}
            className={`
              bg-white border-2 rounded-xl p-6 text-center transition-all duration-200
              ${selectedOption === "surprise" 
                ? "border-indigo-500 shadow-lg transform scale-105" 
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }
            `}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative">
                <Star className="w-8 h-8 text-white fill-white" />
                <Plus className="w-4 h-4 text-white absolute" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Surprise Me</h3>
            <p className="text-sm text-gray-600">
              We'll pick 5 amazing nonprofits for you
            </p>
          </button>

          {/* Browse All Card */}
          <button
            onClick={() => handleOptionSelect("browse")}
            className={`
              bg-white border-2 rounded-xl p-6 text-center transition-all duration-200
              ${selectedOption === "browse" 
                ? "border-indigo-500 shadow-lg transform scale-105" 
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }
            `}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center relative">
                <FileText className="w-8 h-8 text-white/30 absolute" />
                <Search className="w-6 h-6 text-white relative z-10" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Browse All</h3>
            <p className="text-sm text-gray-600">
              Explore all available nonprofits
            </p>
          </button>

          {/* Search Card */}
          <button
            onClick={() => handleOptionSelect("search")}
            className={`
              bg-white border-2 rounded-xl p-6 text-center transition-all duration-200
              ${selectedOption === "search" 
                ? "border-indigo-500 shadow-lg transform scale-105" 
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }
            `}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Search</h3>
            <p className="text-sm text-gray-600">
              Find specific nonprofits
            </p>
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          {/* Edit Categories and Skip Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleEditCategories}
              variant="outline"
              className="flex-1 h-12 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Edit Categories
            </Button>
            <Button
              onClick={handleSkip}
              className="flex-1 h-12 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2"
            >
              Skip for Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

