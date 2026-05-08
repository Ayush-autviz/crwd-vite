import { cn } from "@/lib/utils";
import { ChatMessage } from "./types";
import { SharedCard } from "./SharedCard";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isMe = message.senderId === "me";

  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] md:max-w-[70%]",
        isMe ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {message.type === "card" && message.cardData ? (
        <SharedCard cardData={message.cardData} />
      ) : (
        <div
          className={cn(
            "px-4 py-3 rounded-lg text-base shadow-sm font-medium",
            isMe ? "bg-[#2222EE] text-white" : "bg-gray-100 text-gray-900"
          )}
        >
          {message.text}
        </div>
      )}
      <span className={cn(
        "text-xs font-medium text-gray-400 mt-2 px-2 uppercase tracking-wider",
        isMe ? "text-right" : "text-left"
      )}>
        {message.timestamp}
      </span>
    </div>
  );
}
