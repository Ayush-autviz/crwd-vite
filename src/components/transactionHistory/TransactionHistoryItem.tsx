import React from 'react';

interface TransactionHistoryItemProps {
  date: string;
  description: string;
  amount: string;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({ date, description, amount }) => (
  <div className="flex flex-col gap-0.5 py-3">
    <span className="text-xs text-gray-400 mb-1">{date}</span>
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-gray-800">{description}</span>
      <span className="text-sm text-gray-800">{amount}</span>
    </div>
  </div>
);

export default TransactionHistoryItem; 