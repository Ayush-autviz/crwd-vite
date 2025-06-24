import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from "lucide-react";

interface SettingsGroupProps {
  heading: string;
  items: { label: string; href?: string; icon?: React.ReactNode }[];
  description?: string;
  icon?: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({ heading, items, description, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{heading}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="divide-y divide-gray-100">
      {items.map((item, idx) =>
        item.href ? (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {item.icon && <div className="text-gray-400 group-hover:text-primary transition-colors">{item.icon}</div>}
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        ) : (
          <div
            key={item.label}
            className="flex items-center px-6 py-4 text-sm font-medium text-gray-800 bg-white select-none"
          >
            <div className="flex items-center gap-3">
              {item.icon && <div className="text-gray-400">{item.icon}</div>}
              <span>{item.label}</span>
            </div>
          </div>
        )
      )}
    </div>
  </div>
);

export default SettingsGroup; 