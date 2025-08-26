import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const nonprofitLogos = [
  { name: "WWF", logo: "/ngo/aspca.jpg" },
  // { name: "Médecins Sans Frontières", logo: "/ngo/redCross.png" },
  { name: "Feeding America", logo: "/ngo/CRI.jpg" },
  { name: "Save the Children", logo: "/ngo/catAllies.jpeg" },
  { name: "Paws", logo: "/ngo/paws.jpeg" },
  { name: "Girl Code", logo: "/ngo/girlCode.png" },
];

export default function OnBoard() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // toast.success("Google login successful!")
    } catch (error) {
      // toast.error("Google login failed")
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Navigate to next step
    navigate("/claim-profile");
  };

  const handleLogin = () => {
    // Navigate to Login
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-4 space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1 bg-black rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome to CRWD
                </h1>
                <p className="text-gray-600 font-semibold text-sm">
                  Give to everything you care about, at once.
                </p>
              </div>

              {/* Nonprofit logos section */}
              <div className="space-y-4">
                <h2 className="text-sm  text-gray-700 text-center">
                  Discover nonprofits like these on CRWD
                </h2>

                <div className="overflow-hidden">
                  <div className="flex animate-scroll">
                    {/* First set */}
                    {nonprofitLogos.map((org, index) => (
                      <div
                        key={index}
                        className="text-center flex-shrink-0 mx-3"
                      >
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                        />
                        <p className="text-xs text-gray-500 font-medium w-12">
                          {org.name}
                        </p>
                      </div>
                    ))}
                    {/* Duplicate set */}
                    {nonprofitLogos.map((org, index) => (
                      <div
                        key={`dup-${index}`}
                        className="text-center flex-shrink-0 mx-3"
                      >
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                        />
                        <p className="text-xs text-gray-500 font-medium w-12">
                          {org.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-10 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Get Started button */}
              <Button
                type="button"
                onClick={handleGetStarted}
                className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
              >
                Get Started
              </Button>

              {/* Login link */}
              <div className="text-center">
                <button
                  className="text-sm font-semibold hover:text-gray-800 transition-colors"
                  onClick={handleLogin}
                >
                  Log in
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
