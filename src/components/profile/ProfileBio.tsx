import React from 'react';

interface ProfileBioProps {
  bio: string;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => (
  <div className="px-4 pb-2 text-base text-gray-800 leading-snug">
    {bio}
  </div>
);

export default ProfileBio; 