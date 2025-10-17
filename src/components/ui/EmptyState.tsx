import React from 'react';
import { Button } from './button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  collectiveData?: any;
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  collectiveData,
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        {description}
      </p>
      {(actionText && collectiveData) && (
        <div>
          {/* {actionLink ? ( */}
            <Link to="/create-post" state={{ collectiveData: collectiveData }}>
              <Button className="bg-primary hover:bg-primary/90">
              {actionText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmptyState; 