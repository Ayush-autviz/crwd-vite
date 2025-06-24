import { cn } from '@/lib/utils';
import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileInterestsProps {
  interests: string[];
  title?: string;
  className?: string;
}

const ProfileInterests: React.FC<ProfileInterestsProps> = ({ interests, title, className }) => (
  <div className={cn("px-4 pt-2 pb-4  border-b border-gray-200 ", className)}>
   {title && <div className="font-semibold text-sm mb-2">{title}</div>}
    <div className="w-full flex gap-2 overflow-x-auto scrollbar-none" >
      {interests.map((interest, idx) => (
        <Link
          key={idx}
          to={`/search?q=${encodeURIComponent(interest)}`}
        >
          <span className="w-fit bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap break-keep cursor-pointer hover:bg-gray-200 transition-colors">
            {interest}
          </span>
        </Link>
      ))}
    </div>

  </div>
);

export default ProfileInterests;