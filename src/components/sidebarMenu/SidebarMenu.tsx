import React from 'react';
import SidebarMenuProfile from './SidebarMenuProfile';
import SidebarMenuItem from './SidebarMenuItem';
import { Link } from 'react-router-dom';

const menuItems = [
  { icon: '➕', label: 'Create a CRWD', href: '#' },
  { icon: '🧑‍🤝‍🧑', label: 'Your CRWDs', href: '#' },
  { icon: '🔖', label: 'Saved', href: '#' },
  { icon: '🔍', label: 'Explore', href: '#' },
  { icon: '🗃️', label: 'Donation box', href: '#' },
  { icon: '🔔', label: 'Notifications', href: '#' },
  { icon: '🔀', label: 'Transaction history', href: '#' },
  { icon: 'ℹ️', label: 'About', href: '#' },
  { icon: '❓', label: 'Help', href: '#' },
];

const SidebarMenu: React.FC = () => (
  <div className="w-full min-h-screen bg-white flex flex-col">
    <SidebarMenuProfile />
    <div className="flex flex-col gap-1 mt-2">
      <Link to="/create-crwd">
        <span>➕ Create a CRWD</span>
      </Link>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.label} {...item} />
      ))}
    </div>
    <div className="flex-1" />
    <div className="px-6 py-4 text-xs text-blue-500">Privacy Policy</div>
  </div>
);

export default SidebarMenu; 