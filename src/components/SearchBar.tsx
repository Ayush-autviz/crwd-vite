import React from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 md:py-3">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent border-none w-full focus:outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
};

export default SearchBar;
