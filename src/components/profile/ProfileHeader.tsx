import React, { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Locate, LocateIcon, Map, MapPin, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Toast } from "../ui/toast";
import ImageModal from "../ui/ImageModal";

// Avatar colors for consistent fallback styling (same as NewCreateCollective.tsx)
const avatarColors = [
  '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3',
  '#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#FF5722',
  '#673AB7', '#009688', '#FFEB3B', '#795548', '#607D8B',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

interface ProfileHeaderProps {
  avatarUrl: string;
  name: string;
  location: string;
  link: string;
  follow?: boolean;
  activeSince: string;
  color?: string;
  founder?: boolean;
  onFounderClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  location,
  link,
  follow = false,
  activeSince,
  color,
  founder = true,
  onFounderClick,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: "" });

  // Use color from API if available, otherwise get consistent color for avatar fallback based on name
  const avatarBgColor = color || getConsistentColor(name || link || 'U', avatarColors);

  const showToast = (message: string) => {
    setToastState({ show: true, message });
    setTimeout(() => setToastState({ show: false, message: "" }), 1500);
  };

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed ${name}` : `Following ${name}`);
  };

  return (
    <div className="pt-3 md:pt-4  px-3 md:px-4 bg-white">
      <Toast
        show={toastState.show}
        message={toastState.message}
        onHide={() => setToastState({ show: false, message: "" })}
      />
      {/* Top right buttons */}
      {/* <div className="flex justify-end gap-3 ">
        <Button className="h-8 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 shadow-none hover:bg-gray-50 transition-none">
          <Upload className="w-2 h-2" />
        </Button>
        {follow ? (
          <Button
            onClick={handleFollowClick}
            className={`h-8 rounded-lg text-sm font-semibold transition-colors ${
              isFollowing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        ) : (
          <Link
            to={`/profile/${name}`}
            className="h-8 px-4 flex items-center justify-center rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 border bg-blue-500 text-white shadow-none hover:bg-blue-600 hover:text-white transition-none"
          >
            Edit
          </Link>
        )}
      </div> */}
      {/* Avatar and info */}
      <div className="flex flex-col items-center gap-3 md:gap-4 mb-2.5 md:mb-3">
        <ImageModal src={avatarUrl} alt={name}>
          <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-full object-contain cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback
              style={{ backgroundColor: avatarBgColor }}
              className="text-white text-2xl md:text-4xl font-medium"
            >
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </ImageModal>
        <div className="font-bold text-sm sm:text-base md:text-lg leading-tight">{name}</div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* <div className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1"> */}
        {founder && (
          <div
            className={`bg-pink-100 rounded-full py-1 px-2 mb-2 ${onFounderClick ? 'cursor-pointer hover:bg-pink-200 transition-colors' : ''}`}
            onClick={onFounderClick}
          >
            <p className="text-pink-500 font-medium text-xs md:text-sm">Founder</p>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-0.5 md:gap-1">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">{location}</span>
          </div>
        )}
        {/* </div> */}
      </div>
    </div>
  );
};

export default ProfileHeader;
