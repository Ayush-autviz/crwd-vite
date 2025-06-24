import React from 'react';
import TransactionHistoryItem from './TransactionHistoryItem';
import type { Transaction } from '@/lib/types';

interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const TransactionHistoryList: React.FC<TransactionHistoryListProps> = ({ transactions }) => (
  <div className="px-16 pt-4 flex flex-col gap-2">
    {transactions.map((t, i) => (
      <TransactionHistoryItem key={i} {...t} />
    ))}
  </div>
);

export default TransactionHistoryList; 