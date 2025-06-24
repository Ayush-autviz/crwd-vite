import React from 'react';
import { FileText } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionHistoryFooterProps {
  transactions: Transaction[];
}

const TransactionHistoryFooter: React.FC<TransactionHistoryFooterProps> = ({ transactions }) => {
  // Calculate total (strip $ and sum)
  const total = transactions.reduce((sum, t) => sum + Number(t.amount.replace(/[^\d.]/g, '')), 0);
  return (
    <footer className="w-full flex items-center justify-between px-6 py-4 text-xs text-gray-700 fixed bottom-0 left-0 bg-white border-t md:hidden">
      <div className="flex items-center gap-2">
        <FileText size={16} />
        <span>Tax Docs</span>
      </div>
      <span className="font-medium">Total given: ${total}</span>
    </footer>
  );
};

export default TransactionHistoryFooter; 