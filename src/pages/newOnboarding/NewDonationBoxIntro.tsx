import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewDonationBoxIntro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleContinue = () => {
    navigate(`/add-nonprofits?redirectTo=${encodeURIComponent(redirectTo)}`, {
      state: { ...location.state }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-8 bg-white overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start max-h-screen overflow-y-auto scrollbar-hide">
        {/* Progress Indicator - Step 2 of 5 */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-10 w-full">
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-[#1600ff] rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
          <div className="h-1 w-8 sm:w-10 md:w-12 bg-gray-300 rounded-full"></div>
        </div>

        {/* Icon */}
        <div className="mb-4 sm:mb-6">
          <div className="w-14 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#1600ff] rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white fill-white" />
          </div>
        </div>

        {/* Content */}
        <div className="w-full text-left mb-6 sm:mb-8">
          <p className="text-[#1600ff] font-semibold text-lg md:text-lg mb-1">
            Meet your Donation Box.
          </p>
          <h1 className="text-3xl sm:text-3xl md:text-3xl font-semibold text-gray-900 leading-tight mb-4 tracking-tight">
            One amount. Split across every nonprofit you support.
          </h1>
          <div className="space-y-3 sm:space-y-4 text-base sm:text-lg md:text-lg text-gray-600 font-medium">
            <p>Give to every nonprofit you care about. Add new ones when something moves you. Your amount never changes.</p>
            <p className="font-semibold text-gray-900">It just reaches further.</p>
          </div>
        </div>

        {/* Donation Box Preview Card */}
        <div className="w-full bg-[#f9f9f5] rounded-3xl p-5 sm:p-6 md:p-8 mb-8 sm:mb-10 relative">
          <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4 sm:mb-6">
            YOUR DONATION BOX
          </p>

          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4 flex-1">
              {/* Badge 1 */}
              <div className="flex flex-col items-center gap-2">
                {/* <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[#e6f7e9] rounded-xl flex items-center justify-center min-w-[60px] sm:min-w-[80px]">
                  <span className="text-[#3da65a] font-bold text-[10px] sm:text-xs">ASPCA</span>
                </div> */}
                <img src="/ngo/aspca.jpg" alt="" className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-lg" />
                <div className="bg-white px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[#1600ff] font-bold text-[9px] sm:text-[10px] text-center block">33%</span>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex flex-col items-center gap-2">
                <img src="/ngo/CRI.jpg" alt="" className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-lg" />
                <div className="bg-white px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[#1600ff] font-bold text-[9px] sm:text-[10px] text-center block">33%</span>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="flex flex-col items-center gap-2">
                <img src="/ngo/girlCode.png" alt="" className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-lg" />
                <div className="bg-white px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[#1600ff] font-bold text-[9px] sm:text-[10px] text-center block">33%</span>
                </div>
              </div>

              {/* Add Badge */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-lg font-light">+</span>
                </div>
                {/* <div className="h-[18px] w-1"></div> Spacer */}
                <div className="bg-white px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[#1600ff] font-bold text-[9px] sm:text-[10px] text-center block">33%</span>
                </div>
              </div>
            </div>

            {/* Price */}
            {/* <div className="pb-6 sm:pb-8">
              <p className="text-gray-900 font-black text-sm sm:text-base md:text-lg whitespace-nowrap">
                $30/mo
              </p>
            </div> */}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleContinue}
          className="w-full py-5 sm:py-6 rounded-lg bg-[#2222EE] hover:bg-[#1100cc] text-white text-base sm:text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
