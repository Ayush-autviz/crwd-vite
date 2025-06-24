"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Plus, Minus, Bell, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Link } from "react-router-dom";

const recents = [
  { name: "St. Judes", image: "/grocery.jpg" },
  { name: "Community first", image: "/maz.jpg" },
  { name: "Make a Wish", image: "/mclaren.jpg" },
  { name: "Planned", image: "/por.jpg" },
  { name: "Made with love", image: "/tesla.jpg" },
];
const suggested = [
  { name: "Win together", image: "/adidas.jpg" },
  { name: "Hope for all", image: "/starbucks.jpg" },
];

export default function CreateCRWDPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(5);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <ProfileNavbar title="Create a CRWD" />

      <div className="px-4 pt-2 pb-48 lg:max-w-[600px] gap-6 w-full">
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="You" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-semibold text-sm">Create a CRWD</span>
            </div>
            <button className="text-gray-400"><MoreHorizontal size={18} /></button>
          </div>

          {/* CRWD Name */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">Name your CRWD</label>
            <input
              className="bg-gray-50 w-full rounded-lg h-12 text-sm border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">Describe your CRWD</label>
            <textarea
              className="bg-gray-50 w-full h-20 rounded-lg p-3 text-sm border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is the purpose of your CRWD"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          {/* Suggested Amount */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">Suggested Amount</label>
            <div className="bg-gray-50 rounded-lg flex items-center justify-between px-4 py-3 border border-gray-200">
              <span className="text-sm text-gray-600">Minimum $5</span>
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1">
                <Button
                  variant="ghost"
                  className="text-blue-600 p-0 h-6 w-6 hover:bg-blue-100"
                  onClick={() => setAmount(a => Math.max(5, a - 1))}
                >
                  <Minus size={14} />
                </Button>
                <span className="text-lg text-blue-600 font-semibold min-w-[40px] text-center">${amount}</span>
                <Button
                  variant="ghost"
                  className="text-blue-600 p-0 h-6 w-6 hover:bg-blue-100"
                  onClick={() => setAmount(a => a + 1)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Causes Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">Choose causes</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="font-semibold text-xs text-blue-600 mb-2">SELECT FROM YOUR RECENTS</div>
              {recents.map(cause => (
                <div key={cause.name} className="flex items-center gap-3 py-1.5">
                  <img src={cause.image} alt={cause.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="flex-1 text-sm text-gray-700">{cause.name}</span>
                  <input
                    type="radio"
                    name="cause"
                    checked={selectedCause === cause.name}
                    onChange={() => setSelectedCause(cause.name)}
                    className="accent-blue-600 w-4 h-4"
                  />
                </div>
              ))}
              <div className="font-semibold text-xs text-blue-600 mt-3 mb-2">MORE SUGGESTED</div>
              {suggested.map(cause => (
                <div key={cause.name} className="flex items-center gap-3 py-1.5">
                  <img src={cause.image} alt={cause.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="flex-1 text-sm text-gray-700">{cause.name}</span>
                  <input
                    type="radio"
                    name="cause"
                    checked={selectedCause === cause.name}
                    onChange={() => setSelectedCause(cause.name)}
                    className="accent-blue-600 w-4 h-4"
                  />
                </div>
              ))}
              <div className="flex justify-end mt-2">
                <Link to="/search" className="text-xs text-blue-600 flex items-center hover:underline">
                  Discover more <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-6 text-xs text-gray-500 pt-2">
            <span className='flex items-center gap-6'>
              <span className="flex items-center gap-1 text-gray-400">
                <span className="text-sm">Ready to launch</span>
              </span>
            </span>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Create CRWD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
