import React, { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Locate, LocateIcon, Map, MapPin, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Toast } from "../ui/toast";
import ImageModal from "../ui/ImageModal";

interface ProfileHeaderProps {
  avatarUrl: string;
  name: string;
  location: string;
  link: string;
  follow?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  name,
  location,
  link,
  follow = false,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastState, setToastState] = useState({ show: false, message: "" });

  const showToast = (message: string) => {
    setToastState({ show: true, message });
    setTimeout(() => setToastState({ show: false, message: "" }), 1500);
  };

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed ${name}` : `Following ${name}`);
  };

  return (
    <div className="pt-4 pb-2 px-4 bg-white">
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
      <div className="flex items-center gap-4 mb-3">
        <ImageModal src={avatarUrl} alt={name}>
          <Avatar className="w-14 h-14 rounded-full object-contain cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={avatarUrl} alt={name} />
          </Avatar>
        </ImageModal>
        <div className="font-bold text-lg leading-tight">My Name is {name}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {location}
          </span>
          <a
            href={link}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link}
          </a>
          <span className="text-gray-500 text-xs">Active since 2023</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
