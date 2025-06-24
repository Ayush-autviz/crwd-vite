import React from 'react';
import { ArrowLeft,  MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostDetailHeader: React.FC = () => (
  <header className="w-full flex items-center justify-between px-4 py-4 bg-white border-b sticky top-0 z-10 md:hidden">
    <Link to="/">
    <button className="text-gray-700">
      <ArrowLeft size={22} />
    </button>
    </Link>
    <span className="font-semibold text-base">Post</span>
    <button className="text-gray-700">
      <MoreHorizontal size={22} />
    </button>
  </header>
);

export default PostDetailHeader; 