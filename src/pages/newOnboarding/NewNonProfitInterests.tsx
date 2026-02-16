import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/constants/categories";
import { useMutation } from "@tanstack/react-query";
import { postCauseInterests } from "@/services/api/social";
import { toast } from "sonner";

export default function NewNonProfitInterests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Only show specific categories from the image
  const allowedCategoryNames = [
    "Animals",
    "Community",
    "Education",
    "Climate",
    "Hunger",
    "Health",
    "Housing",
    "Mental Health",
    "Disaster",
    "Justice",
    "Faith",
    "Veterans",
    "Kids",
    "Environment",
    "Wildlife",
    "LGBTQ+",
    "Poverty",
    "Women's Health",
  ];

  const mainCategories = categories
    .filter((cat) =>
      cat.id !== "" &&
      cat.name !== "All" &&
      allowedCategoryNames.includes(cat.name)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Post cause interests mutation
  const postInterestsMutation = useMutation({
    mutationFn: (interests: string[]) => postCauseInterests({ interests }),
    onSuccess: () => {
      // toast.success("Interests saved successfully!");
      // If redirectTo is present and not just '/', navigate to that page
      // Otherwise, navigate to complete-onboard
      if (redirectTo && redirectTo !== '/') {
        navigate(redirectTo);
      } else {
        navigate(`/complete-onboard?redirectTo=${encodeURIComponent(redirectTo)}`, {
          state: { selectedCategories }
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save interests");
    },
  });

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      return;
    }
    // Post the selected category IDs
    postInterestsMutation.mutate(selectedCategories);
  };

  const handleSkip = () => {
    // If came from create-crwd or groupcrwd, navigate directly to that page
    // Otherwise, navigate to complete-onboard
    if (redirectTo.includes('/create-crwd') || redirectTo.includes('/groupcrwd/')) {
      navigate(redirectTo, { state: { from: 'NewNonprofitInterests' } });
    } else {
      navigate(`/complete-onboard?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
        {/* Progress Indicator - Step 3 */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-6 sm:mb-8">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-800 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
        </div>

        {/* Heart Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600 fill-purple-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
          What causes do you care about?
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center mb-6 sm:mb-8 px-2">
          Select one or more interests to personalize your experience. We'll show you nonprofits and collectives that match.
        </p>

        {/* Category Tags - Organic Layout */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {mainCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`
                  relative px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-200
                  flex items-center justify-center whitespace-nowrap
                  ${isSelected
                    ? "text-white shadow-md transform scale-105"
                    : "hover:shadow-sm hover:scale-102"
                  }
                `}
                style={{
                  backgroundColor: category.background,
                  color: category.text,
                  opacity: isSelected ? 1 : 0.3,
                }}
              >
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Count */}
        {selectedCategories.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600 font-medium text-center">
              {selectedCategories.length} {selectedCategories.length === 1 ? "interest" : "interests"} selected
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex gap-4 w-full">
            {/* <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 py-5 rounded-full border border-gray-200 bg-white text-gray-900 font-bold hover:bg-gray-50 text-base"
            >
              Back
            </Button> */}
            <Button
              onClick={handleContinue}
              disabled={selectedCategories.length === 0 || postInterestsMutation.isPending}
              className="flex-1 py-5 rounded-lg bg-[#1600ff] hover:bg-[#1100cc] text-white font-bold flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-100"
            >
              {postInterestsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="text-gray-500 font-bold text-sm hover:text-gray-900 transition-all mt-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

