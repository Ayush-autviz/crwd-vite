"use client";
import DonationBox from "@/components/Donationbox";
import React from "react";
import { useSearchParams } from "react-router-dom";

export default function DonationPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  console.log(tab, "tab");

  return (
    <div>
      <DonationBox tab={tab || "setup"} />
    </div>
  );
}
