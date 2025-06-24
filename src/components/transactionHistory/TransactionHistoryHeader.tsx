import React from 'react';
import { ArrowLeft, Shuffle } from 'lucide-react';

const TransactionHistoryHeader: React.FC = () => (
  <>
  <header className="w-full flex items-center justify-between px-4 h-16 bg-gray-50 border-b sticky top-0 z-10 md:hidden">
    <button className="text-gray-700">
      <ArrowLeft size={22} />
    </button>
    <div className="flex items-center gap-2 text-gray-700 font-medium">
      <Shuffle size={18} />
      <span>Transaction history</span>
    </div>
    <div className="w-6" /> {/* Spacer for symmetry */}
  </header>
  <header className="w-full bg-card border-b hidden px-4 h-16 md:flex items-center justify-between sticky top-0">
    <h1 className="text-xl font-bold">Transaction history</h1>
    <div className="flex items-center gap-2 text-gray-700 font-medium">
      <Shuffle size={18} />
      <span>Transaction history</span>
    </div>
    </header>
    </>
);

export default TransactionHistoryHeader; 