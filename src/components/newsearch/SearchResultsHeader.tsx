import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

interface SearchResultsHeaderProps {
  searchQuery: string;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchResultsHeader({
  searchQuery,
  onClearSearch,
  onSearchChange,
  onSearch,
}: SearchResultsHeaderProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch();
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b px-3 md:px-6 py-3 md:py-4">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 md:pl-11 pr-9 md:pr-11 py-2.5 md:py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 text-sm xs:text-base md:text-lg"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute right-2.5 md:right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}




