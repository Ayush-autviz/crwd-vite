"use client";
import DonationBox from "@/components/Donationbox";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/store";
import { Link, useSearchParams, useLocation } from "react-router-dom";

export default function DonationPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const tab = searchParams.get("tab");
  console.log(tab, "tab");

  // Get preselected item and active tab from navigation state
  const preselectedItem = location.state?.preselectedItem;
  const activeTab = location.state?.activeTab;
  const fromPaymentResult = location.state?.fromPaymentResult;
  const preselectedCauses = location.state?.preselectedCauses;
  const preselectedCausesData = location.state?.preselectedCausesData;
  
  console.log('Preselected item:', preselectedItem);
  console.log('Active tab:', activeTab);

  const { user: currentUser } = useAuthStore();

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
            Sign in to view your profile, manage your causes, and connect with your community.
          </p>
          
          {/* CTA Button */}
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Link to="/onboarding" className="flex items-center gap-2">
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
    <div>
      <DonationBox 
        tab={tab || "setup"} 
        preselectedItem={preselectedItem}
        activeTab={activeTab}
        fromPaymentResult={fromPaymentResult}
        preselectedCauses={preselectedCauses}
        preselectedCausesData={preselectedCausesData}
      />
      {/* <div className="hidden md:block">
        <Footer />
      </div> */}
    </div>
  );
}
