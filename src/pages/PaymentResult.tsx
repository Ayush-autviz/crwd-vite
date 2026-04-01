"use client";
import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { XCircle, Home, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";


export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type");

  const isSuccess = type === "success";

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!type) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isSuccess ? 'bg-[#129D6E]' : 'bg-[#E11D48]'} flex flex-col`}>
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-8">
        <div className={`w-full ${isSuccess ? 'max-w-sm' : 'max-w-md'}`}>
          {isSuccess ? (
            <div className="flex flex-col items-center text-center text-white animate-in fade-in zoom-in duration-700">
              {/* Heart Icon in Squircle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 sm:mb-12 shadow-inner hover:scale-105 transition-transform">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight tracking-tight px-4">
                Your giving just<br />got easier.
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-white/90 mb-10 px-6 max-w-sm leading-relaxed font-medium">
                Your donation is pooled with others on CRWD and disbursed to your nonprofits every quarter.
              </p>

              {/* Divider */}
              <div className="w-full max-w-xs h-[1px] bg-white/20 mb-2"></div>

              {/* Secondary Info */}
              <div className="space-y-5 mb-10 p-4 text-white">
                <p className="text-sm sm:text-base text-white/60 font-medium mb-2">
                  One receipt. Sent to your email each month.
                </p>
                <p className="text-sm sm:text-base text-white/60 font-medium">
                  Make changes anytime in your Donation Box.
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => navigate("/", { replace: true })}
                className="w-full bg-white hover:bg-gray-100 text-[#129D6E] py-6 sm:py-7 text-lg font-bold rounded-2xl shadow-lg border-none transition-all active:scale-[0.98]"
              >
                Go to my feed
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center text-white animate-in fade-in zoom-in duration-700">
              {/* X Icon in Squircle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-8 sm:mb-12 shadow-inner hover:scale-105 transition-transform">
                <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight tracking-tight px-4">
                Payment Failed
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-white/90 mb-10 px-6 max-w-sm leading-relaxed font-medium">
                We encountered an issue processing your payment. This could be due to:
              </p>

              {/* Divider */}
              <div className="w-full max-w-xs h-[1px] bg-white/20 mb-8"></div>

              {/* Failure Reasons list */}
              <div className="space-y-4 mb-14 text-white/90 text-sm sm:text-base font-medium">
                <p>• Insufficient funds or card expired</p>
                <p>• Incorrect payment information</p>
                <p>• Transaction declined by your bank</p>
                <p>• Connection issues with payment provider</p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => navigate("/", { replace: true })}
                className="w-full bg-white hover:bg-gray-100 text-[#E11D48] py-6 sm:py-7 text-lg font-bold rounded-2xl shadow-lg border-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5 stroke-[2.5px]" />
                <span>Return to Home</span>
              </Button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

