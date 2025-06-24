import React from 'react';
import { CheckCircle, Users, Heart, Bookmark, Upload, Award, ShieldCheck, ChevronDown } from 'lucide-react';
import ProfileInterests from '../profile/ProfileInterests';
import ClaimCauseDialog from './ClaimCauseDialog';
import { Link } from 'react-router-dom';

interface CauseProfileCardProps {
  onLearnMoreClick?: () => void;
}

const CauseProfileCard: React.FC<CauseProfileCardProps> = ({ onLearnMoreClick }) => (
  <div className="bg-white px-3 py-4 mx-3 mb-2 flex flex-col space-y-4">
    {/* CRWD Verified and Follow */}
    <div className="flex items-center gap-2">
      <Award  className="text-blue-500 w-5 h-5" />
      <span className="text-xs text-gray-500">CRWD Verified</span>
      <div className="flex-grow" />
      <button className="bg-gray-100 text-gray-500 text-xs px-4 py-1 h-8 rounded-lg font-semibold"><Upload className='w-4 h-4' /></button>
      <button className="bg-gray-100 text-gray-500 text-xs px-4 py-1 h-8 rounded-lg font-semibold"><Bookmark className='w-4 h-4' /></button>
      <Link to="/donation">
      <button className="border text-blue-500 cursor-pointer text-xs px-4 py-1 h-8 rounded-lg font-semibold">Donate</button>
      </Link>
    </div>
    {/* Profile */}
    <div className="flex items-center gap-4">
      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Helping Humanity" className="w-14 h-14 rounded-lg object-cover" />
      <div className="flex flex-col mt-2">
        <span className="font-semibold text-base text-gray-900">Helping Humanity</span>
        <span className="text-xs text-gray-500">in 6 CRWDS · 162 donations</span>
      </div>
    </div>
    {/* Bio */}
    <div className="text-lg text-gray-700">
      This is a bio about Non Profit and how they give back to their community so that users can learn about how their money is supporting others…
      <div className="mt-2">
        <button
          onClick={onLearnMoreClick}
          className="text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:text-blue-800"
        >
          Learn More
        </button>
      </div>
    </div>
    {/* Tags */}
    <ProfileInterests interests={['Animal Welfare', 'Environment', 'Food Insecurity']} className='px-0 border-none' />
    {/* Verified Box */}
    <div className="bg-blue-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle size={16} className="text-blue-500" />
        <span className="text-sm font-semibold text-gray-700">Verified US Non Profit</span>
      </div>
      <div className="text-sm text-gray-700">Tax ID Number: 10125-3129</div>
      <div className="text-sm text-gray-700 mb-1">Address: 123 Main Street. USA 10010</div>
      {/* <a to="#" className="text-sm text-blue-600 underline">Claim this non-profit?</a> */}
      <ClaimCauseDialog/>
    </div>
    {/* Guarantee Note */}
   <div className='flex items-center gap-1 text-sm '>
   <div className="text-xs  bg-gray-300 rounded-full p-1"> <ShieldCheck className='w-4 h-4 ' /></div>
   Your donation is protected and guaranteed. <a to="#" className="text-blue-600 underline">Learn More</a>
   </div>
  </div>
);

export default CauseProfileCard;