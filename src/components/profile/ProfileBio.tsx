import React from 'react';

interface ProfileBioProps {
  bio: string;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => (
  <div className="pb-2 mx-auto text-base md:text-md text-gray-600 leading-snug">
    {bio}
  </div>
);

export default ProfileBio; 