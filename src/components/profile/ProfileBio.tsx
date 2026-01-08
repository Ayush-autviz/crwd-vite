import React from 'react';

interface ProfileBioProps {
  bio: string;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => (
  <div className=" pb-2 mx-auto text-sm md:text-base text-gray-800 leading-snug">
    {bio}
  </div>
);

export default ProfileBio; 