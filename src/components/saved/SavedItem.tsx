import React from 'react';
import { Bookmark } from 'lucide-react';

interface SavedItemProps {
  avatar: string;
  title: string;
  subtitle: string;
}

const SavedItem: React.FC<SavedItemProps> = ({ avatar, title, subtitle }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <img src={avatar} alt={title} className="w-10 h-10 rounded-full object-cover" />
    <div className="flex flex-col flex-1 min-w-0">
      <span className="font-semibold text-sm text-gray-900 truncate">{title}</span>
      <span className="text-xs text-gray-500 truncate">{subtitle}</span>
    </div>
    <Bookmark 
      size={18} 
      fill="currentColor" 
      className="text-blue-500 flex-shrink-0 bookmark-icon hover:text-blue-600 transition-colors" 
    />
  </div>
);

export default SavedItem; 