import React from 'react';
import {
  Plus,
  Users,
  Bookmark,
  Search,
  Archive,
  Bell,
  Shuffle,
  Info,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

export const menuItems = [
  { icon: <Users size={20} />, label: 'Your CRWDs', href: '/your-crwds' },
  { icon: <Bookmark size={20} />, label: 'Saved', href: '/saved' },
  { icon: <Search size={20} />, label: 'Explore', href: '/search' },
  { icon: <Archive size={20} />, label: 'Donation box', href: '/donation' },
  { icon: <Bell size={20} />, label: 'Notifications', href: '/notifications' },
  { icon: <Shuffle size={20} />, label: 'Transaction history', href: '/transaction-history' },
  { icon: <Info size={20} />, label: 'About', href: '/settings/about' },
  { icon: <HelpCircle size={20} />, label: 'Help', href: '/settings/help' },
  { icon: <Settings size={20} />, label: "Settings", href: '/settings' }
];

interface NavigationItemsProps {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  showCreateButton?: boolean;
  showNewPostButton?: boolean;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  className,
  linkClassName,
  iconClassName,
  showCreateButton = true,
  showNewPostButton = false,
}) => {
  return (
    <div className={cn("flex flex-col  py-2", className)}>
      {showCreateButton && (
        <Link
          to="/create-crwd"
          className={cn(
            "flex items-center gap-4 px-6 py-3 text-sm font-medium hover:bg-muted/50 transition-colors",
            linkClassName
          )}
        >
          <Plus size={18} className={cn("text-primary", iconClassName)} />
          <span>Create a CRWD</span>
        </Link>
      )}
      {showNewPostButton && (
        <Link
          to="/create-post"
          className={cn(
            " hidden md:flex items-center gap-4 px-6 py-3 text-sm font-medium hover:bg-muted/50 transition-colors",
            linkClassName
          )}
        >
          <Plus size={18} className={cn("text-primary", iconClassName)} />
          <span>New Post</span>
        </Link>
      )}


      {menuItems.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          className={cn(
            "flex items-center gap-4 px-6 py-3 text-sm font-medium hover:bg-muted/50 transition-colors",
            linkClassName
          )}
        >
          <span className={cn("text-primary", iconClassName)}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default NavigationItems; 