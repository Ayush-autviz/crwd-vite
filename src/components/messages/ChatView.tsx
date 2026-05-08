import { Send } from "lucide-react";
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
}

export function ChatView({
  conversation,
  messages,
  inputValue,
  onInputChange,
  onSend,
  className
}: ChatViewProps) {
  if (!conversation) {
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 no-scrollbar">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
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
