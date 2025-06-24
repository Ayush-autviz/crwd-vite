import React from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ icon, label, href }) => {
  const content = (
    <div className="flex items-center gap-3 px-6 py-3 text-gray-800 text-sm font-medium">
      <span className="text-lg w-6 flex justify-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
  return href ? (
    <Link to={href} className="block hover:bg-gray-50 transition">{content}</Link>
  ) : (
    <button className="w-full text-left hover:bg-gray-50 transition">{content}</button>
  );
};

export default MobileMenuItem; 