import React from "react";
import MembersTabs from "@/components/members/MembersTabs";
import { useSearchParams } from "react-router-dom";

export default function MembersPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "Members";
  return <MembersTabs tab={tab} />;
}
