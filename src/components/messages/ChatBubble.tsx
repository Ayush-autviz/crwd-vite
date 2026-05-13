import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { ChatMessage } from "./types";
import { SharedCard } from "./SharedCard";
import VideoPlayer from "../ui/VideoPlayer";

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
        <div className="flex flex-col gap-2 ">
          {message.text && (
            <div
              className={cn(
                "px-4 py-3 rounded-lg text-base shadow-sm font-medium",
                isMe ? "bg-[#2222EE] text-white" : "bg-gray-100 text-gray-900"
              )}
            >
              {message.text}
            </div>
          )}
          <SharedCard cardData={message.cardData} isMe={isMe} />
        </div>
      ) : (

        <div
          className={cn(
            "rounded-lg overflow-hidden flex flex-col",
            (message.text && !message.text.startsWith('http'))
              ? (isMe ? "bg-[#2222EE] text-white shadow-sm" : "bg-gray-100 text-gray-900 shadow-sm")
              : "bg-transparent text-gray-900"
          )}
        >
          {message.mediaUrl && (
            <div className="w-full">
              {message.type === "video" || message.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
                <VideoPlayer
                  src={message.mediaUrl}
                  disableFullscreen
                  className="w-full h-auto max-h-80 rounded-lg"
                />
              ) : (
                <img
                  src={message.mediaUrl}
                  alt="Shared"
                  className="w-full h-auto max-h-80 object-cover rounded-lg"
                />
              )}
            </div>
          )}
          {message.text && !message.text.startsWith('http') && (
            <div className="px-4 py-2 text-base">
              {message.text}
            </div>
          )}
        </div>
      )}


      <div className={cn(
        "flex items-center gap-1 mt-1.5 px-1.5",
        isMe ? "justify-end" : "justify-start"
      )}>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {message.timestamp}
        </span>
        {isMe && (
          <CheckCheck
            className={cn(
              "w-4 h-4 transition-colors",
              message.isRead ? "text-[#2222EE]" : "text-gray-400"
            )}
          />
        )}
      </div>
    </div>
  );
}
