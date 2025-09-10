import React from 'react';
import MobileMenuProfile from './MobileMenuProfile';
import MobileMenuItem from './MobileMenuItem';
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
  Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: <Plus size={20} />, label: 'Create a CRWD', href: '#' },
  { icon: <Users size={20} />, label: 'Your CRWDs', href: '#' },
  { icon: <Heart size={20} />, label: 'Saved', href: '#' },
  { icon: <Search size={20} />, label: 'Explore', href: '#' },
  { icon: <Archive size={20} />, label: 'Donation box', href: '#' },
  { icon: <Bell size={20} />, label: 'Notifications', href: '#' },
  { icon: <Shuffle size={20} />, label: 'Transaction history', href: '#' },
  { icon: <Info size={20} />, label: 'About', href: '#' },
  { icon: <HelpCircle size={20} />, label: 'Help', href: '#' },
];

const MobileMenu: React.FC = () => (
  <div className="w-full min-h-screen bg-white flex flex-col">
    <MobileMenuProfile />
    <div className="flex flex-col gap-1 mt-2">
      <Link to="/create-crwd">
        <span>Create a CRWD</span>
      </Link>
      {menuItems.map((item) => (
        <MobileMenuItem key={item.label} {...item} />
      ))}
    </div>
    <div className="flex-1" />
    <div className="px-6 py-4 text-xs text-blue-500">Privacy Policy</div>
  </div>
);

export default MobileMenu; 