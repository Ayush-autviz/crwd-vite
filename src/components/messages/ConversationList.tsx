import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Conversation } from "./types";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  className,
  isLoading
}: ConversationListProps) {
  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Mobile Search Bar (only shown on list view) */}
      <div className="p-4 md:hidden">
        <div className="relative border border-gray-200 rounded-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search conversations..."
            className="pl-12 bg-gray-50 border-none h-11 rounded-2xl text-base placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 mt-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl border-[1.5px] border-transparent mt-1 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                  <div className="h-2.5 bg-gray-100 rounded-md w-10 ml-2" />
                </div>
                <div className="h-3.5 bg-gray-100 rounded-md w-3/4" />
              </div>
            </div>
          ))
        ) : (
          <>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onSelect={onSelect}
              />
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No conversations found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
