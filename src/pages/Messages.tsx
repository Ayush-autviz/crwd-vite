import { useState } from "react";
import { Search, ChevronLeft, MoreHorizontal } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

// Component imports
import { Conversation, ChatMessage } from "@/components/messages/types";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatView } from "@/components/messages/ChatView";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "sarah-johnson",
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      color: "#FF6B6B",
    },
    lastMessage: "Shared a profile",
    timestamp: "1m",
    unread: true,
  },
  {
    id: "michael-chen",
    user: {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?u=michael",
      color: "#4D96FF",
    },
    lastMessage: "That's awesome! 🥳",
    timestamp: "2h",
  },
  {
    id: "emily-rodriguez",
    user: {
      name: "Emily Rodriguez",
      avatar: "https://i.pravatar.cc/150?u=emily",
      color: "#6BCB77",
    },
    lastMessage: "When is the next event?",
    timestamp: "1d",
  },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "sarah-johnson": [
    {
      id: "m1",
      senderId: "me",
      text: "Hey! I saw you're interested in environmental causes. Would you like to join our Climate Action collective?",
      timestamp: "11:23 AM",
    },
    {
      id: "m2",
      senderId: "other",
      text: "That sounds great! I'd love to join the collective",
      timestamp: "11:38 AM",
    },
    {
      id: "m3",
      senderId: "me",
      text: "Perfect! I'll send you the details.",
      timestamp: "11:43 AM",
    },
    {
      id: "m4",
      senderId: "other",
      text: "Sounds good, looking forward to it!",
      timestamp: "11:48 AM",
    },
    {
      id: "m5",
      senderId: "me",
      text: "",
      timestamp: "11:51 AM",
      type: "card",
      cardData: {
        title: "Climate Action Collective",
        description: "Join us this Saturday for our beach cleanup event! We've collected over 500 lbs of trash...",
        image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=800",
        icon: "🌍",
      },
    },
  ],
};

export default function Messages() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  const selectedId = id || null;

  const filteredConversations = MOCK_CONVERSATIONS.filter((msg) =>
    msg.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId);
  const currentMessages = selectedId ? MOCK_MESSAGES[selectedId] || [] : [];

  const handleBack = () => {
    navigate("/messages");
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  const handleSend = (images?: File[]) => {
    if (!inputValue.trim() && (!images || images.length === 0)) return;
    console.log("Sending message:", inputValue, "with images:", images);
    setInputValue("");
  };


  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-inter">
      {/* Mobile Header (List View) */}
      <div className={cn("md:hidden", selectedId && "hidden")}>
        <ProfileNavbar
          title="Messages"
          showMobileMenu={true}
          showDesktopMenu={true}
          showBackButton={true}
          showDesktopBackButton={true}
        />
      </div>

      {/* Mobile Header (Chat View) */}
      {selectedId && selectedConversation && (
        <div className="md:hidden flex items-center gap-3 px-4 h-16 border-b bg-white sticky top-0 z-10">
          <button onClick={handleBack} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.user.avatar} className="object-cover" />
            <AvatarFallback style={{ backgroundColor: selectedConversation.user.color }}>
              {selectedConversation.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-bold text-lg text-gray-900 flex-1 truncate">
            {selectedConversation.user.name}
          </h2>
          {/* <button className="p-1">
            <MoreHorizontal className="h-6 w-6 text-gray-400" />
          </button> */}
        </div>
      )}

      {/* Desktop Header & Search Area */}
      <div className="hidden md:block">
        <ProfileNavbar
          title="Messages"
          showMobileMenu={true}
          showDesktopMenu={true}
          showBackButton={true}
          showDesktopBackButton={true}
          onBackClick={selectedId ? () => navigate("/messages") : () => navigate("/")}
        />



        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search conversations..."
              className="pl-12 bg-gray-50 border-none h-11 rounded-2xl text-base placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversation List Pane */}
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          className={cn(
            "w-full md:w-[400px] border-r",
            selectedId ? "hidden md:flex" : "flex"
          )}
        />

        {/* Chat Pane */}
        <ChatView
          conversation={selectedConversation || null}
          messages={currentMessages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          className={cn(
            "flex-1",
            !selectedId ? "hidden md:flex" : "flex"
          )}
        />
      </div>
    </div>
  );
}
