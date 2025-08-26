import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";

export default function CompleteOnboard() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Show confetti after a short delay
    const timer = setTimeout(() => setShowConfetti(true), 300);

    // Handle window resize for responsive confetti
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleGoToDonationBox = () => {
    navigate("/donation");
  };

  const handleBrowseCrwd = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Confetti Overlay */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={["#EF4444", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"]}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 md:p-8 min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-8  text-center">
              {/* CRWD Logo with Confetti Burst */}
              <div className="relative">
                <div className="relative z-20">
                  <img
                    src="/logo3.png"
                    alt="CRWD Logo"
                    className="w-32 h-32 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to CRWD !
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Start giving now, or explore causes and CRWDs first.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleGoToDonationBox}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-700 text-white font-medium text-base rounded-lg transition-colors duration-200"
                >
                  Go to Donation Box
                </Button>

                <Button
                  variant="outline"
                  onClick={handleBrowseCrwd}
                  className="w-full h-12 border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium text-base rounded-lg transition-colors duration-200"
                >
                  Browse CRWD
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
