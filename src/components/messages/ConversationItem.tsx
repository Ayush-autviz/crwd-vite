import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "./types";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 group mt-1",
        isSelected
          ? "bg-blue-50 border-1 border-blue-600"
          : "hover:bg-gray-50 border-[1.5px] border-transparent"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={conversation.user.avatar} className="object-cover" />
          <AvatarFallback className="text-white font-semibold text-lg" style={{ backgroundColor: conversation.user.color }}>
            {conversation.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {conversation.unread && (
          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-[#2222EE] border-2 border-white rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className={cn(
            "font-bold text-[15px] truncate transition-colors text-gray-900"
          )}>
            {conversation.user.name}
          </h3>
          <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap ml-2 uppercase tracking-wider">
            {conversation.timestamp}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate leading-snug">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );
}
