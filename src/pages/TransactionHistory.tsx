"use client";

import React from "react";
import TransactionHistoryHeader from "@/components/transactionHistory/TransactionHistoryHeader";
import TransactionHistoryList from "@/components/transactionHistory/TransactionHistoryList";
import TransactionHistoryFooter from "@/components/transactionHistory/TransactionHistoryFooter";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";

const transactions = [
  {
    date: "May 7th",
    description: "1-time Donation to Habitat for Humanity",
    amount: "$5",
  },
  { date: "May 1st", description: "Donation Box", amount: "$25" },
  { date: "April 1st", description: "Donation Box", amount: "$25" },
  { date: "March 1st", description: "Donation Box", amount: "$25" },
];

const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
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
      <TransactionHistoryList transactions={transactions} />
      <TransactionHistoryFooter transactions={transactions} />
    </div>
  );
};

export default TransactionHistoryPage;
