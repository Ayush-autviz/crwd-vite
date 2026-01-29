import React from 'react';

interface ProfileBioProps {
  bio: string;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => (
  <div className=" pb-2 mx-auto text-base md:text-lg text-gray-800 leading-snug text-center">
    {bio}
  </div>
);

export default ProfileBio; 