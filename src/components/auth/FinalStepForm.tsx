import React from 'react';
import { ArrowLeft } from 'lucide-react';

const FinalStepForm: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-white">
    {/* Header */}
    <div className="w-full flex items-center px-4 py-3 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
      <button className="text-gray-700">
        <ArrowLeft size={22} />
      </button>
    </div>
    {/* Form */}
    <div className="flex-1 flex flex-col justify-start items-center pt-8">
      <div className="w-full max-w-md px-6 flex flex-col gap-6">
        <div className="text-base font-medium mb-2">You're in! One last step:</div>
        <form className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
          <input type="password" placeholder="Password" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
          <input type="password" placeholder="Confirm Password" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-base mt-2 shadow-lg hover:bg-blue-700 transition">Save</button>
        </form>
      </div>
    </div>
  </div>
);

export default FinalStepForm; 