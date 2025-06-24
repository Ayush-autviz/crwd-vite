"use client"

import { useNavigate } from "react-router-dom";

import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

// Mock data for CRWDs
const mockCrwds = [
  {
    id: 1,
    name: "Feed the Hungry",
    description: "Solving world hunger a...",
    avatar: "F"
  }
];

const YourCrwdsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <ProfileNavbar title="Your CRWDs" showMobileMenu={false} />
      <div className="flex items-center h-12 md:hidden px-4 border-b bg-[#F6F7FB]">
        <button className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className='w-full flex items-center justify-center'>
          <img src="/logo.png" alt="logo" width={20} height={20} />
          <span className="font-medium text-sm">Your CRWDs</span>
        </div>
      </div>
      {/* List */}
      <div className="flex-1 px-2 pt-4">
        {mockCrwds.map((crwd) => (
          <div
            key={crwd.id}
            className="flex items-center bg-white  px-4 py-3 mb-2 "
          >
            <div onClick={() => navigate(`/groupcrwd`)} className="cursor-pointer w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3">
              {crwd.avatar}
            </div>
            <div onClick={() => navigate(`/groupcrwd`)} className="cursor-pointer flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">{crwd.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[140px]">{crwd.description}</div>
            </div>
            <Link to={`/your-crwds/${crwd.id}`}>
              <button
                className="ml-2 text-xs font-medium  hover:underline"
              // onClick={() => navigate(`/your-crwds/${crwd.id}`)}
              >
                Manage
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourCrwdsPage;
