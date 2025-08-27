"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import type { Member } from "@/lib/types";

interface MembersListProps {
  members: Member[];
}

const MembersList: React.FC<MembersListProps> = ({ members }) => {
  const [search, setSearch] = useState("");
  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <div className="relative mb-4 mt-1 px-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full mt-2 p-2 pl-12 rounded-lg bg-[#F4F4F8] text-foreground"
        />
        <Search className="absolute mt-1 left-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <ScrollArea className="h-[70vh] no-scrollbar px-6">
        {filtered.map((member, index) => (
          <div key={index} className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`/placeholder.svg?height=40&width=40`}
                  alt={member.name}
                />
                <AvatarFallback>
                  {member.name.split(" ")[0][0] +
                    (member.name.split(" ")[1] || "")[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{member.username}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className={`border-0 text-sm mr-2 cursor-pointer hover:text-blue-500 ${
                member.connected
                  ? "bg-[#4367FF] text-white"
                  : "bg-[#F0F2FB] text-[#4367FF]"
              }`}
              size="sm"
            >
              {member.connected ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </ScrollArea>
    </>
  );
};

export default MembersList;
