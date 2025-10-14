import React from "react";
import { Bookmark, Heart } from "lucide-react";

interface SavedItemProps {
  avatar: string;
  title: string;
  subtitle: string;
  type?: 'nonprofit' | 'collective';
}

const SavedItem: React.FC<SavedItemProps> = ({ avatar, title, subtitle, type }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <img
      src={avatar}
      alt={title}
      className="w-10 h-10 rounded-full object-cover"
    />
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

export default SavedItem;
