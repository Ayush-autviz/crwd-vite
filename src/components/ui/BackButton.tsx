"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Custom text to display next to the arrow. Defaults to "Back" */
  text?: string;
  /** Custom onClick handler. If not provided, uses navigate(-1) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show only the icon without text */
  iconOnly?: boolean;
  /** Custom icon size */
  iconSize?: number;
  /** Variant styling */
  variant?: 'default' | 'minimal' | 'outlined';
}

const BackButton: React.FC<BackButtonProps> = ({
  text = "",
  onClick,
  className,
  iconOnly = false,
  iconSize = 20,
  variant = 'default'
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  const baseStyles = "inline-flex w-10 h-11 items-center w-fit rounded-full   gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ";

  const variantStyles = {
    default: "px-3 py-2 hover:bg-gray-100 text-gray-700 hover:text-gray-900",
    minimal: "p-2 hover:bg-gray-50 text-gray-600 hover:text-gray-800",
    outlined: "p-2  bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 shadow-sm rounded-3xl transition-colors"
  };

  return (
    <button
      onClick={handleClick}
      className={cn(baseStyles, variantStyles[variant], className)}
      aria-label={iconOnly ? text : undefined}
      type="button"
    >
      <ArrowLeft
        size={iconSize}
        className="flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      {/* {!iconOnly && (
        <span className="font-medium text-sm">{text}</span>
      )} */}
    </button>
  );
};

export default BackButton;
