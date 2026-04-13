import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Share2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/store";
import { SharePost } from "@/components/ui/SharePost";
import { useMutation } from "@tanstack/react-query";
import { createDonationBox } from "@/services/api/donation";
import { toast } from "sonner";

export default function NewOnboardSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // @ts-ignore
  const addedNonprofits = location.state?.addedNonprofits || [];
  // @ts-ignore
  const amount = location.state?.amount || 0;

  // Get user info from auth store, fallback to location state
  const userName = user?.full_name || location.state?.userName || location.state?.name || "User";
  const profileImage = user?.profile_picture || null;
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 1);

  const createDonationBoxMutation = useMutation({
    mutationFn: createDonationBox,
    onSuccess: () => {
      // Logic handled in handleFinalAction
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create donation box");
    }
  });

  const handleFinalAction = async (destination: string) => {
    if (addedNonprofits.length > 0 && amount >= 5) {
      try {
        await createDonationBoxMutation.mutateAsync({
          causes: addedNonprofits.map((n: any) => ({ cause_id: n.id })),
          monthly_amount: amount.toString()
        });
      } catch (e) {
        // Error handled by mutation
        return;
      }
    }
    navigate(destination, { state: { from: 'onboarding' } });
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl flex flex-col items-start p-4 sm:p-6 md:p-8">

        {/* Progress Indicator - Step 5 of 5 */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-8 w-full">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
        </div>

        {/* Text Sections */}
        <div className="w-full mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-1.5">
            Your profile is live.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
            The nonprofits you support show up publicly. When others see what you give to, it moves them to do the same.
          </p>
        </div>
        {/* Profile Card Overlay Section */}
        <div className="w-full bg-[#f7f7f2] rounded-xl p-5 mb-8 flex flex-col items-center border border-gray-200  relative overflow-hidden">
          {/* Top Profile */}
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mb-3">
            <AvatarImage src={profileImage || undefined} className="object-cover" />
            <AvatarFallback style={{ backgroundColor: user?.color }} className="bg-blue-100 text-white text-xl sm:text-2xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 text-center">
            {userName === "User" ? "Conrad McMurray" : userName}
          </h2>

          <div className="w-full h-px bg-gray-200 mb-4"></div>

          {/* Supports Section */}
          <div className="w-full">
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              YOUR DONATION BOX
            </p>
            <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2">
              {addedNonprofits.length > 0 ? (
                addedNonprofits.map((nonprofit: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0 min-w-[70px] sm:min-w-[80px]">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
                      <AvatarImage src={nonprofit.image} className="object-cover" />
                      <AvatarFallback className="bg-blue-100 text-[#1600ff] font-bold text-lg">{nonprofit.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs sm:text-sm font-bold text-gray-700 text-center leading-tight line-clamp-2 max-w-[70px] sm:max-w-[80px]">
                      {nonprofit.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-medium text-gray-400 italic py-4">
                  No nonprofits selected yet.
                </p>
              )}
            </div>
          </div>
        </div>


        {/* Invite Link Card */}
        <button
          onClick={handleShare}
          className="w-full bg-[#f7f7f2] border border-gray-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 mb-5 transition-all hover:bg-gray-100 active:scale-[0.99] group text-left"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#1600ff] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100 transition-transform group-hover:scale-105">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-extrabold text-gray-900">Invite others</h4>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Text, email, DM — whatever works</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* <p className="text-sm sm:text-base text-gray-500 font-medium text-center w-full mb-8">
          You can always invite people later from your profile.
        </p> */}

        {/* Footer Buttons */}
        <div className="w-full space-y-3">
          <Button
            onClick={() => handleFinalAction("/donation")}
            disabled={createDonationBoxMutation.isPending}
            className="w-full h-12 sm:h-13 bg-[#2222EE] hover:bg-[#1100cc] text-sm sm:text-base font-bold rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {createDonationBoxMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Go to my Donation Box
          </Button>

          {/* <button
            onClick={() => handleFinalAction("/profile")}
            disabled={createDonationBoxMutation.isPending}
            className="w-full text-center text-gray-400 font-bold text-xs sm:text-sm hover:text-gray-900"
          >
            Skip for now
          </button> */}
        </div>

      </div>

      <SharePost
        url={`${window.location.origin}/u/${user?.username || ''}`}
        title="Join me on CRWD"
        description={`I'm supporting ${addedNonprofits.length} nonprofits on CRWD. Join me!`}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
