'use client'
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import Image from "next/image"; - replaced with regular img tags
import { useState } from "react";

const crwds = [
  { id: "1", name: "Feed the Hungry", avatar: "/mclaren.jpg", subtitle: "Food Insecurity" },
  { id: "2", name: "Animal Rescue", avatar: "/animal.jpg", subtitle: "Animal Welfare" },
  { id: "3", name: "Green Earth", avatar: "/earth.jpg", subtitle: "Environment" },
];



export function CrwdDropdown({ onSelect }: { onSelect?: (id: string) => void }) {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select a CRWD to post to</label>
      <Select
        //   open
        value={selected}
        onValueChange={(val: string) => {
          setSelected(val);
          onSelect?.(val);
        }}
      >
        <SelectTrigger className="w-1/2 rounded-lg border px-4 py-2 text-left shadow-none border-none bg-gray-100">
          <SelectValue placeholder="Choose a CRWD" />
        </SelectTrigger>
        <SelectContent>
          {crwds.map(crwd => (
            <SelectItem key={crwd.id} value={crwd.id}>
              <div className="flex items-center gap-3">
                <img src={crwd.avatar} alt={crwd.name} width={25} height={25} className="rounded w-10 h-10" />
                <div>
                  <div className="font-medium text-xs">{crwd.name}</div>
                  <div className="text-xs text-gray-400">{crwd.subtitle}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 
