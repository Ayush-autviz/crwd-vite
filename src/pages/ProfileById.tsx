import ProfileEditCard from "@/components/profile/ProfileEditCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/services/api/auth";
import { Loader2 } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { useState } from "react";

export default function ProfileById() {
  // const { id } = useParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch profile data using React Query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: true, // Only run if id exists
  });

  console.log('Profile data:', profileQuery.data);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      console.log('Profile updated successfully:', response);
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setToastMessage("Profile updated successfully!");
      setShowToast(true);
      setLoadingField(null); // Clear loading field
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      setToastMessage(`Failed to update profile: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
      setLoadingField(null); // Clear loading field
    },
  });

  const handleSave = (field: string, value: string | FormData) => {
    // Set loading field before making the request
    setLoadingField(field);
    
    // Prepare data for API call - only send the changed field
    let updateData: any = {};
    
    switch (field) {
      case 'firstName':
        updateData.first_name = value;
        break;
      case 'lastName':
        updateData.last_name = value;
        break;
      case 'username':
        updateData.username = value;
        break;
      case 'location':
        updateData.location = value;
        break;
      case 'bio':
        updateData.bio = value;
        break;
      case 'profile_picture':
        // Handle file upload with FormData
        if (value instanceof FormData) {
          updateProfileMutation.mutate(value);
          return;
        }
        break;
      default:
        console.warn('Unknown field:', field);
        setLoadingField(null); // Clear loading field on error
        return;
    }

    updateProfileMutation.mutate(updateData);
  };

  // if (!id) {
  //   return (
  //     <div className="w-full flex flex-col items-center justify-center min-h-screen">
  //       <div className="text-center py-10">
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">
  //           Profile not found
  //         </h2>
  //         <p className="text-gray-600">Invalid profile ID.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Loading state
  if (profileQuery.isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (profileQuery.error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load profile
          </h2>
          <p className="text-gray-600 mb-4">
            {(profileQuery.error as any)?.response?.data?.message || profileQuery.error.message}
          </p>
          <button 
            onClick={() => profileQuery.refetch()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full flex flex-col items-center justify-start space-y-6 md:mb-48">
      <ProfileNavbar title="Edit Profile" titleClassName="text-2xl" />
      <div className="w-full">
        <ProfileEditCard
          avatarUrl={profileQuery.data.user.profile_picture || ''}
          firstName={profileQuery.data.user.first_name || ''}
          lastName={profileQuery.data.user.last_name || ''}
          username={profileQuery.data.user.username || ''}
          location={profileQuery.data.user.location || ''}
          bio={profileQuery.data.user.bio || ''}
          onSave={handleSave}
          loadingField={loadingField}
        />
      </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </>
  );
}