import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/constants/categories";

export default function NewNonProfitInterests() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter out "All" category and get the main categories
  const mainCategories = categories.filter((cat) => cat.id !== "" && cat.name !== "All");

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleContinue = () => {
    // TODO: Handle continue action (no API integration as per requirements)
    console.log("Selected categories:", selectedCategories);
    // Navigate to next step
    navigate("/complete-onboard", { 
      state: { selectedCategories } 
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSkip = () => {
    // TODO: Handle skip action
    navigate("/complete-onboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 md:p-8 shadow-lg">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
        </div>

        {/* Heart Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
          What causes do you care about?
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-gray-600 text-center mb-8">
          Select one or more categories to personalize your experience. We'll show you nonprofits and collectives that match your interests.
        </p>

        {/* Category Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
          {mainCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`
                  relative px-4 py-3 rounded-full text-sm font-medium transition-all duration-200
                  flex items-center justify-center gap-2
                  ${isSelected 
                    ? "text-white shadow-md transform scale-105" 
                    : "hover:shadow-sm"
                  }
                `}
                style={{
                  backgroundColor: isSelected ? category.text : category.background,
                  color: isSelected ? "white" : category.text,
                }}
              >
                {isSelected && (
                  <Check className="w-4 h-4" />
                )}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Count */}
        <div className="mb-6">
          <p className="text-sm text-indigo-600 font-medium">
            {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          {/* Back and Continue Buttons */}
          <div className="flex gap-3">
            {/* <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 h-12 border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Back
            </Button> */}
            <Button
              onClick={handleContinue}
              disabled={selectedCategories.length === 0}
              className="flex-1 h-12 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

