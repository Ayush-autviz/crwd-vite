import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Locate, LocateIcon, Map, MapPin, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
  avatarUrl: string;
  name: string;
  location: string;
  link: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ avatarUrl, name, location, link }) => (
  <div className="pt-4 pb-2 px-4 bg-white">
    {/* Top right buttons */}
    <div className="flex justify-end gap-3 ">
      <Button className="h-8 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 shadow-none hover:bg-gray-50 transition-none"><Upload className='w-2 h-2'/></Button>
      <Link to={`/profile/${name}`} className="h-8 px-4 flex items-center justify-center rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 border bg-blue-500 text-white shadow-none hover:bg-blue-600 hover:text-white transition-none">Edit</Link>
    </div>
    {/* Avatar and info */}
    <div className="flex items-center gap-4 mb-3">
      <Avatar className="w-14 h-14 rounded-lg object-contain">
        <AvatarImage src={avatarUrl} alt={name} />
      </Avatar>
      <div className="font-bold text-lg leading-tight">My Name is {name}</div>
    </div>
    <div className="flex-1">
        
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span className='flex items-center gap-1'><MapPin className='w-4 h-4'/>{location}</span>
          <a to={link} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{link}</a>
        </div>
      </div>
  </div>
);

export default ProfileHeader; 