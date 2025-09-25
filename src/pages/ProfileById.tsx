import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProfileEditCard from "@/components/profile/ProfileEditCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { toast } from "sonner";
import Footer from "@/components/Footer";

// Sample profile data - in a real app this would come from an API
const getProfileData = (id: string) => {
  const profiles: Record<string, any> = {
    "1": {
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "My Name is Mya",
      username: "myamakes_moves",
      location: "Atlanta, GA",
      bio: "This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream.",
    },
    "2": {
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "Chad Fofana",
      username: "chadfofana1",
      location: "New York, NY",
      bio: "Community organizer passionate about social justice and helping those in need.",
    },
    mynameismya: {
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "My Name is Mya",
      username: "myamakes_moves",
      location: "Atlanta, GA",
      bio: "This is a bio about Mya and how she likes to help others and give back to her community. She also loves ice cream.",
    },
  };

  return (
    profiles[id] || {
      avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      name: `User ${id}`,
      username: `user_${id}`,
      location: "Unknown Location",
      bio: "This user hasn't added a bio yet.",
    }
  );
};

export default function ProfileById() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(getProfileData(id || "1"));

  const handleSave = (data: {
    name: string;
    username: string;
    location: string;
    bio: string;
    avatarUrl?: string;
  }) => {
    // Update the profile data
    setProfileData((prev) => ({
      ...prev,
      ...data,
    }));

    // Show success message
    toast.success("Profile updated successfully!");

    // Here you would typically make an API call to save the data
    console.log("Saving profile data:", data);
  };

  if (!id) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile not found
          </h2>
          <p className="text-gray-600">Invalid profile ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start space-y-6 min-h-screen">
      <ProfileNavbar title="Edit Profile" titleClassName="text-2xl" />
      <div className="w-full">
        <ProfileEditCard
          avatarUrl={profileData.avatarUrl}
          name={profileData.name}
          username={profileData.username}
          location={profileData.location}
          bio={profileData.bio}
          onSave={handleSave}
        />
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
