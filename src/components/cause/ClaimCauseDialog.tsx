"use client"
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
// import Image from 'next/image'; - replaced with regular img tags

interface ClaimCauseDialogProps {
  causeName?: string;
  causeImage?: string;
}

const ClaimCauseDialog: React.FC<ClaimCauseDialogProps> = ({
  causeName = "Helping Humanity",
  causeImage = "https://randomuser.me/api/portraits/men/32.jpg"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm cursor-pointer text-blue-600 underline">Claim this non-profit?</button>
      </DialogTrigger>
      <DialogContent className="px-0 pb-6 w-full max-w-full h-screen flex flex-col justify-start items-center rounded-none md:rounded-2xl md:max-w-md md:h-auto">
        <div className="w-full px-0 pt-0 pb-0">
          <div className="w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full h-10 md:h-0 px-8 md:hidden"
            >
              <ArrowLeft />
            </button>
            <div className="text-lg font-semibold mb-4 px-8 pt-4">Claim your cause</div>
            <div className="flex items-center gap-3 px-8 pt-4">
              <img src={causeImage} alt={causeName} className="w-12 h-12 rounded-lg object-cover" />
              <span className="font-semibold text-lg text-gray-900">{causeName}</span>
            </div>
            <form className="flex flex-col gap-4 px-8 pt-6">
              <input type="text" placeholder="Your name" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
              <input type="text" placeholder="Your relation to this cause" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
              <input type="text" placeholder="Your contact info" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400" />
              <textarea placeholder="Explanation" rows={3} className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none placeholder-gray-400 resize-none" />
              <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-base mt-2 shadow-lg hover:bg-blue-700 transition">Submit for review</button>
            </form>
            <div className="text-xs text-gray-400 px-8 pt-6">
              Thank you! Your application will be reviewed and our team will follow up shortly with next steps. In the meantime, review some of the perks of self-managed cause profiles <a to="#" className="text-blue-600 underline">here</a>.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimCauseDialog;