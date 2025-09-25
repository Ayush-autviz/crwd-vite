"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";

export default function CreateCausePage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");

  const categories = [
    "Animal Welfare",
    "Environment",
    "Food Insecurity",
    "Education",
    "Healthcare",
    "Social Justice",
    "Homelessness",
    "Disaster Relief",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <ProfileNavbar title="Submit a Cause" />

      <div className="px-4 pt-2 pb-48 lg:max-w-[600px] gap-6 w-full">
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="You"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-semibold text-sm">Submit a Cause</span>
            </div>
            <button className="text-gray-400">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Cause Name */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              Organization Name
            </label>
            <input
              className="bg-gray-50 w-full rounded-lg h-12 text-sm border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              Description
            </label>
            <textarea
              className="bg-gray-50 w-full h-20 rounded-lg p-3 text-sm border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this organization does"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              Website (Optional)
            </label>
            <input
              className="bg-gray-50 w-full rounded-lg h-12 text-sm border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.org"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              Category
            </label>
            <select
              className="bg-gray-50 w-full rounded-lg h-12 text-sm border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-6 text-xs text-gray-500 pt-2">
            <span className="flex items-center gap-6">
              <span className="flex items-center gap-1 text-gray-400">
                <span className="text-sm">Ready to submit</span>
              </span>
            </span>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Submit Cause
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
