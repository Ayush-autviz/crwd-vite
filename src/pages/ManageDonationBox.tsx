"use client";
import { useQuery } from "@tanstack/react-query";
import { getDonationBox } from "@/services/api/donation";
import { useAuthStore } from "@/stores/store";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ManageDonationBox from "@/components/ManageDonationBox";
import ProfileNavbar from "@/components/profile/ProfileNavbar";

export default function ManageDonationBoxPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  // Fetch donation box data
  const { data: donationBox, isLoading } = useQuery({
    queryKey: ['donationBox', currentUser?.id],
    queryFn: () => getDonationBox(),
    enabled: !!currentUser?.id,
  });

  if (!currentUser?.id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sign in to manage your donation box
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to continue.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <ProfileNavbar title="Manage Donation Box" showBackButton={true} showDesktopBackButton={true} />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!donationBox || !donationBox.id) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <ProfileNavbar title="Manage Donation Box" showBackButton={true}/>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No donation box found.</p>
            <button
              onClick={() => navigate("/donation")}
              className="text-blue-600 hover:underline"
            >
              Create a donation box
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare causes from donation box data
  // Extract causes from box_causes (primary source)
  const boxCauses = donationBox.box_causes || [];
  const causes = boxCauses.map((boxCause: any) => boxCause.cause).filter((cause: any) => cause != null);

  // Also get manual_causes for fallback (backward compatibility)
  const manualCauses = donationBox.manual_causes || [];

  // Convert to Organization objects - use box_causes as primary, fallback to manual_causes
  const causesAsObjects = [
    // Primary: causes from box_causes
    ...causes.map((cause: any) => ({
      id: `cause-${cause.id}`,
      name: cause.name,
      imageUrl: cause.image || cause.logo || '',
      color: '#4F46E5',
      description: cause.mission || cause.description || '',
      type: 'cause' as const,
    })),
    // Fallback: manual_causes if not already in box_causes (for backward compatibility)
    ...manualCauses
      .filter((manualCause: any) => !causes.some((c: any) => c.id === manualCause.id))
      .map((cause: any) => ({
        id: `cause-${cause.id}`,
        name: cause.name,
        imageUrl: cause.logo || '',
        color: '#4F46E5',
        description: cause.mission || cause.description || '',
        type: 'cause' as const,
      })),
  ];

  const amount = donationBox.monthly_amount || 7;
  const isActive = donationBox.is_active ?? true;

  const handleBack = () => {
    navigate("/donation");
  };

  const handleCancelSuccess = () => {
    navigate("/donation");
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <ProfileNavbar title="Manage Donation Box" showBackButton={true} showDesktopBackButton={true}/>
      <ManageDonationBox
        amount={amount}
        causes={causesAsObjects}
        onBack={handleBack}
        isActive={isActive}
        onCancelSuccess={handleCancelSuccess}
        nextChargeDate={donationBox.next_charge_date}
      />
    </div>
  );
}

