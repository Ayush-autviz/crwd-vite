import { useEffect, useLayoutEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation, ChatMessage } from "./types";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";

interface ChatViewProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (images?: File[]) => void;
  className?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function ChatView({
  conversation,
  messages,
  inputValue,
  onInputChange,
  onSend,
  className,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  isLoading
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const prevLastMessageId = useRef<string | null>(null);
  const prevScrollHeight = useRef<number>(0);

  // Reset tracking state when switching conversations
  useEffect(() => {
    isInitialLoad.current = true;
    prevLastMessageId.current = null;
    prevScrollHeight.current = 0;
  }, [conversation?.id]);

  // Handle scroll adjustments seamlessly
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;

    const currentLastMessage = messages[messages.length - 1];

    if (isInitialLoad.current) {
      // 1. Initial Load: go straight to bottom
      container.scrollTop = container.scrollHeight;
      prevLastMessageId.current = currentLastMessage?.id || null;
      prevScrollHeight.current = container.scrollHeight;

      const timer = setTimeout(() => {
        isInitialLoad.current = false;
      }, 250);
      return () => clearTimeout(timer);
    } else {
      // 2. Subsequent updates: check if a new message was appended to the bottom
      if (prevLastMessageId.current && currentLastMessage?.id !== prevLastMessageId.current) {
        // New message appended at bottom
        if (currentLastMessage?.senderId === "me" || container.scrollHeight - container.scrollTop - container.clientHeight <= 400) {
          container.scrollTop = container.scrollHeight;
        }
      } else if (prevScrollHeight.current > 0 && container.scrollHeight > prevScrollHeight.current) {
        // Older messages prepended at top: restore scroll position perfectly
        if (container.scrollTop <= 200) {
          container.scrollTop = container.scrollHeight - prevScrollHeight.current + container.scrollTop;
        }
      }

      prevLastMessageId.current = currentLastMessage?.id || null;
      prevScrollHeight.current = container.scrollHeight;
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isInitialLoad.current) return;
    const target = e.currentTarget;
    // Trigger load more when scrolled within 150px of the top
    if (target.scrollTop <= 150 && hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  };

  if (!conversation && !isLoading) {
    return (
      <div className={cn("flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center", className)}>
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-20" />
          <div className="relative bg-blue-50 p-10 rounded-full border-4 border-white shadow-inner">
            <Send className="h-14 w-14 text-[#2222EE] -rotate-12" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Select a Chat</h3>
        <p className="text-gray-400 text-base max-w-sm ">
          Choose a conversation from the left to display the messages and start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-white overflow-hidden font-inter", className)}>
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 no-scrollbar"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col max-w-[70%] mr-auto items-start animate-pulse w-full">
              <div className="h-12 w-48 bg-gray-100 rounded-2xl" />
              <div className="h-3 w-12 bg-gray-100 rounded mt-2" />
            </div>
            <div className="flex flex-col max-w-[70%] ml-auto items-end animate-pulse w-full">
              <div className="h-12 w-64 bg-gray-100 rounded-2xl" />
              <div className="h-3 w-12 bg-gray-100 rounded mt-2" />
            </div>
            <div className="flex flex-col max-w-[70%] mr-auto items-start animate-pulse w-full">
              <div className="h-16 w-56 bg-gray-100 rounded-2xl" />
              <div className="h-3 w-12 bg-gray-100 rounded mt-2" />
            </div>
          </div>
        ) : (
          <>
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#1600ff]" />
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </>
        )}
      </div>

      {/* Chat Input Area */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
      />
    </div>
  );
}
