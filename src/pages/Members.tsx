import React from "react";
import MembersTabs from "@/components/members/MembersTabs";
import { useLocation, useSearchParams } from "react-router-dom";

export default function MembersPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const collectiveData = location.state?.collectiveData;
  const tab = searchParams.get("tab") || "Members";
  return <MembersTabs tab={tab} collectiveData={collectiveData} />;
}
