"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/store";
import OneTimeDonation from "@/components/OneTimeDonation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function OneTimeDonationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuthStore();

  // Get preselected data from navigation state or URL params
  const preselectedItem = location.state?.preselectedItem;
  const activeTab = location.state?.activeTab || searchParams.get("tab");
  const preselectedCauses = location.state?.preselectedCauses;
  const preselectedCausesData = location.state?.preselectedCausesData;
  const preselectedCollectiveId = location.state?.preselectedCollectiveId;
  const fundraiserId = location.state?.fundraiserId;
  const initialDonationAmount = location.state?.donationAmount;

  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [checkout, setCheckout] = useState(false);

  // If not logged in, show sign-in prompt
  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to make a donation
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sign in to make a one-time donation and support your favorite causes.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to={`/onboarding?redirectTo=${encodeURIComponent(location.pathname + location.search)}`} className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </Link>
          </Button>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            Don't have an account? 
            <Link to="/claim-profile" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b ">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
        <h1 className="font-bold text-lg md:text-xl text-foreground">One-Time Donation</h1>
      </div>

      {/* One-Time Donation Component */}
      <OneTimeDonation
        setCheckout={setCheckout}
        selectedOrganizations={selectedOrganizations}
        setSelectedOrganizations={setSelectedOrganizations}
        preselectedItem={preselectedItem}
        activeTab={activeTab}
        preselectedCauses={preselectedCauses}
        preselectedCausesData={preselectedCausesData}
        preselectedCollectiveId={preselectedCollectiveId}
        fundraiserId={fundraiserId}
        initialDonationAmount={initialDonationAmount}
      />
    </div>
  );
}

