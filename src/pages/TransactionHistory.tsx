"use client";

import React from "react";
import TransactionHistoryList from "@/components/transactionHistory/TransactionHistoryList";
import TransactionHistoryFooter from "@/components/transactionHistory/TransactionHistoryFooter";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDonationHistory } from "@/services/api/donation";
import type { Transaction } from "@/lib/types";

const TransactionHistoryPage: React.FC = () => {
  // const navigate = useNavigate();

  // Fetch transaction history from API
  const { data: donationHistoryData, isLoading, error } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
  });

  // Format date helper function
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid date
      
      // Format as "Month Day" (e.g., "May 7th", "April 1st")
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric' 
      };
      const formatted = date.toLocaleDateString('en-US', options);
      // Add ordinal suffix (1st, 2nd, 3rd, etc.)
      const day = date.getDate();
      const suffix = day % 10 === 1 && day % 100 !== 11 ? 'st' :
                     day % 10 === 2 && day % 100 !== 12 ? 'nd' :
                     day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th';
      return formatted.replace(/\d+/, `${day}${suffix}`);
    } catch {
      return dateString;
    }
  };

  // Create description from transaction data
  const createDescription = (transaction: any): string => {
    const { donation_type, cause_count, collective_count, causes, collectives } = transaction;
    
    if (donation_type === 'recurring') {
      // For recurring donations, show the donation box summary with names
      const parts: string[] = [];
      
      // Add nonprofits info
      if (cause_count > 0) {
        if (causes && causes.length > 0 && causes.length <= 2) {
          // Show names if 1-2 nonprofits
          const names = causes.map((c: any) => c.name).join(', ');
          parts.push(names);
        } else {
          // Show count if more than 2
          parts.push(`${cause_count} nonprofit${cause_count !== 1 ? 's' : ''}`);
        }
      }
      
      // Add collectives info
      if (collective_count > 0) {
        if (collectives && collectives.length > 0 && collectives.length <= 2) {
          // Show names if 1-2 collectives
          const names = collectives.map((c: any) => c.name).join(', ');
          parts.push(names);
        } else {
          // Show count if more than 2
          parts.push(`${collective_count} collective${collective_count !== 1 ? 's' : ''}`);
        }
      }
      
      if (parts.length > 0) {
        return `Donation Box - ${parts.join(', ')}`;
      } else {
        return 'Donation Box';
      }
    } else {
      // For one-time donations, list the causes/collectives
      const items: string[] = [];
      
      if (causes && causes.length > 0) {
        if (causes.length === 1) {
          items.push(causes[0].name);
        } else if (causes.length <= 3) {
          // Show names if 2-3 causes
          items.push(causes.map((c: any) => c.name).join(', '));
        } else {
          // Show count if more than 3
          items.push(`${causes.length} nonprofits`);
        }
      }
      
      if (collectives && collectives.length > 0) {
        if (collectives.length === 1) {
          items.push(collectives[0].name);
        } else if (collectives.length <= 3) {
          // Show names if 2-3 collectives
          items.push(collectives.map((c: any) => c.name).join(', '));
        } else {
          // Show count if more than 3
          items.push(`${collectives.length} collectives`);
        }
      }
      
      if (items.length > 0) {
        return `1-time Donation to ${items.join(', ')}`;
      } else {
        return '1-time Donation';
      }
    }
  };

  // Transform API response to Transaction format
  const transactions: Transaction[] = React.useMemo(() => {
    if (!donationHistoryData) return [];

    // Access the results array from the API response
    const historyData = donationHistoryData?.results || [];

    return historyData.map((transaction: any) => {
      const formattedDate = formatDate(transaction.charged_at);
      const description = createDescription(transaction);
      const amount = `$${parseFloat(transaction.gross_amount || '0').toFixed(2)}`;
      
      return {
        date: formattedDate,
        description,
        amount,
      };
    });
  }, [donationHistoryData]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* <TransactionHistoryHeader /> */}
      <ProfileNavbar
        title="Transaction History"
        showMobileMenu={true}
        showDesktopMenu={true}
      />

      {/* <div className="my-6 mx-16">
        <BackButton variant="outlined" />
      </div> */}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-600">Loading transactions...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-sm text-red-600 mb-4">
            Failed to load transaction history. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-sm text-gray-600">No transactions found.</p>
        </div>
      ) : (
        <>
          <TransactionHistoryList transactions={transactions} />
          <TransactionHistoryFooter transactions={transactions} />
        </>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
