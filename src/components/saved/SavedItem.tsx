import React from "react";
import { Bookmark, Heart } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "../ui/avatar";
import { getNonprofitColor } from "@/lib/getNonprofitColor";

interface SavedItemProps {
  avatar: string;
  title: string;
  subtitle: string;
  type?: 'nonprofit' | 'collective';
  causeId?: number;
  id?: number;
}

const SavedItem: React.FC<SavedItemProps> = ({ avatar, title, subtitle, type, causeId, id }) => {
  // For nonprofits, use dynamic colors based on causeId or id
  // For collectives, keep green colors
  const getFallbackStyle = () => {
    if (type === 'collective') {
      return { className: 'bg-green-100 text-green-600 font-semibold' };
    }
    // For nonprofits, use dynamic colors
    const nonprofitId = causeId || id;
    if (nonprofitId) {
      const colors = getNonprofitColor(nonprofitId);
      return { 
        style: { 
          backgroundColor: colors.bgColor,
          color: colors.textColor 
        },
        className: 'font-semibold'
      };
    }
    // Fallback to blue if no ID available
    return { className: 'bg-blue-100 text-blue-600 font-semibold' };
  };

  const fallbackProps = getFallbackStyle();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* <img
        src={avatar}
        alt={title}
        className="w-10 h-10 rounded-full object-cover"
      /> */}
      <Avatar className="w-10 h-10 rounded-full object-cover">
        <AvatarImage src={avatar} />
        <AvatarFallback {...fallbackProps}>
          {title.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-gray-900 truncate">
          {title}
        </span>
      
      </div>
      <span className="text-xs text-gray-500 max-w-[90%]">{subtitle}</span>
    </div>
    <Heart
      size={18}
      fill="currentColor"
      className="text-red-500 flex-shrink-0 bookmark-icon hover:text-red-600 transition-colors"
    />
  </div>
  );
};

export default SavedItem;
