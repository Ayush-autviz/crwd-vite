import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Heart, Search, Check, Loader2, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCausesBySearch, getCategories } from "@/services/api/crwd";

export default function NewAddNonprofits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCauses, setSelectedCauses] = useState<any[]>([]);

  // Fetch causes based on search or category
  const { data: causesData, isLoading: isLoadingCauses } = useQuery({
    queryKey: ['causes-search', searchQuery, selectedCategory],
    queryFn: () => getCausesBySearch(searchQuery, selectedCategory || "", 1),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    enabled: true,
  });

  const displayCauses = causesData?.results || [];
  const categories = categoriesData?.data || [];

  const toggleSelection = (cause: any) => {
    const id = cause.id.toString();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
      setSelectedCauses(prev => prev.filter(c => c.id.toString() !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
      setSelectedCauses(prev => [...prev, cause]);
    }
  };

  const handleNext = () => {
    navigate(`/donation-amount?redirectTo=${encodeURIComponent(redirectTo)}`, {
      state: {
        ...(location.state as any),
        selectedCauses: selectedIds,
        addedNonprofits: selectedCauses
      }
    });
  };

  const handleSkip = () => {
    navigate(`/donation-amount?redirectTo=${encodeURIComponent(redirectTo)}`, {
      state: { ...(location.state as any) }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4  bg-white overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl flex flex-col items-start h-[90vh] sm:h-[800px] md:border border-gray-100 md:shadow-sm overflow-hidden relative">

        {/* Top Header Section */}
        <div className="w-full p-4 sm:p-6  pb-4 shrink-0">
          {/* Progress Indicator - Step 3 of 5 */}
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-6  w-full">
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-200 rounded-full"></div>
            <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-200 rounded-full"></div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight ">
            Add the nonprofits you care about.
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-4 font-medium">
            Search for ones you already support, or discover new ones.
          </p>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search nonprofits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedCategory) setSelectedCategory(null);
              }}
              className="w-full h-12 rounded-lg bg-[#f7f7f2] bo pl-12 pr-4 text-gray-900 border-none focus:ring-2 focus:ring-[#1600ff]/20 placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Not sure where to start? <span
                onClick={() => setShowCategories(!showCategories)}
                className="text-[#1600ff] font-bold cursor-pointer hover:underline"
              >
                Browse nonprofits
              </span>
            </p>

            {/* Categories List */}
            {showCategories && (
              <div className="flex overflow-x-auto gap-2 mb-2 scrollbar-hide py-2 shrink-0">
                {isLoadingCategories ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1600ff]" />
                ) : (
                  categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.id === 1 || cat.name?.toLowerCase() === 'all') {
                          setSelectedCategory("");
                        } else {
                          setSelectedCategory(cat.id.toString());
                        }
                        setSearchQuery("");
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${selectedCategory === cat.id.toString() || (selectedCategory === "" && (cat.id === 1 || cat.name?.toLowerCase() === 'all'))
                        ? ` shadow-md shadow-blue-100`
                        : " opacity-60 hover:bg-gray-200"
                        }`}
                      style={{ backgroundColor: cat.background_color, color: cat.text_color || cat.color || 'inherit' }}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-red-50 text-red-600 flex items-center gap-1 shrink-0"
                  >
                    Clear <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Nonprofit List */}
        <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6  pb-32 scrollbar-hide">
          <div className="space-y-1">
            {isLoadingCauses ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1600ff]" />
              </div>
            ) : displayCauses.length > 0 ? (
              displayCauses.map((item: any) => {
                const isSelected = selectedIds.includes(item.id.toString());
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item)}
                    className="flex items-center gap-3 py-2 cursor-pointer border-b border-gray-50 last:border-none group"
                  >
                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl">
                      <AvatarImage src={item.image} alt={item.name} />
                      <AvatarFallback className="rounded-xl bg-blue-100 text-[#1600ff] font-bold text-xl uppercase">
                        {item.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate font-medium">{item.description || item.bio || item.about_us || "Disaster relief and emergency assistance"}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                      ? "bg-[#1600ff] border-[#1600ff]"
                      : "border-gray-200 group-hover:border-gray-300"
                      }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 font-medium">
                No nonprofits found. Try another search.
              </div>
            )}
          </div>
        </div>

        {/* Sticky/Bottom Footer Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4  shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10 rounded-t-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1600ff] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tighter">Your Donation Box</h4>
              <p className="text-xs sm:text-sm text-gray-500 font-bold">{selectedIds.length} nonprofits selected</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 mb-4 px-1 scrollbar-hide pb-2">
            {selectedCauses.map((cause) => (
              <div key={`selected-${cause.id}`} className="w-[60px] h-[60px] rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50/50 shrink-0">
                <Avatar className="w-full h-full rounded-lg">
                  <AvatarImage src={cause.image} alt={cause.name} />
                  <AvatarFallback className="rounded-lg">
                    <img src={`https://ui-avatars.com/api/?name=${cause.name}&background=1600ff&color=fff`} alt="" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
            {[...Array(Math.max(0, 5 - selectedCauses.length))].map((_, i) => (
              <div key={`empty-${i}`} className="w-[60px] h-[60px] rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50/50 shrink-0">
              </div>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedIds.length === 0}
            className="w-full h-12 bg-[#2222EE] hover:bg-[#1100cc] text-white font-bold rounded-lg text-base transition-all active:scale-[0.98] mb-1 disabled:opacity-50"
          >
            Next
          </Button>

          {/* <button
            onClick={handleSkip}
            className="w-full text-center text-gray-500 font-bold text-sm hover:text-gray-900 transition-colors"
          >
            Skip for now
          </button> */}
        </div>

      </div>
    </div>
  );
}
