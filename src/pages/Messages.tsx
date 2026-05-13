import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, ChevronLeft } from "lucide-react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/store";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations, searchConversations, getMessages, sendChatMessage, ConversationResponse, MessageResponse } from "@/services/api/chat";

// Component imports
import { Conversation, ChatMessage } from "@/components/messages/types";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatView } from "@/components/messages/ChatView";

export default function Messages() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const selectedId = id || null;
  const isNewConversation = selectedId?.startsWith("new-") || false;

  // Fetch conversations
  const { data: conversationData, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["conversations", searchQuery],
    queryFn: () => searchQuery ? searchConversations(searchQuery) : getConversations(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  // Fetch message history with pagination
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["messages", selectedId],
    queryFn: ({ pageParam = 1 }) => getMessages(selectedId!, pageParam),
    enabled: !!selectedId && !isNewConversation,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const match = lastPage.next.match(/[?&]page=(\d+)/);
        return match ? parseInt(match[1], 10) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const baseConversations: Conversation[] = (conversationData?.results || []).map((conv: ConversationResponse) => {
    // Find the participant that is NOT the current user
    const otherUser = conv.participants.find(p => p.id !== user?.id) || conv.participants[0];

    let lastMsgText = conv.last_message?.content || "";
    const entityType = conv.last_message?.entity_type;

    if (entityType === "image") {
      lastMsgText = "Sent an image";
    } else if (entityType === "video") {
      lastMsgText = "Sent a video";
    } else if (entityType === "post") {
      lastMsgText = "Shared a post";
    } else if (lastMsgText.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
      lastMsgText = "Sent an image";
    } else if (lastMsgText.match(/\.(mp4|mov|webm)($|\?)/i)) {
      lastMsgText = "Sent a video";
    } else if (lastMsgText.startsWith("http://") || lastMsgText.startsWith("https://")) {
      lastMsgText = "Sent a link";
    }

    return {
      id: conv.id.toString(),
      user: {
        name: otherUser.full_name,
        avatar: otherUser.profile_picture,
        color: otherUser.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
      },
      lastMessage: lastMsgText,
      timestamp: conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleDateString() : "",
      unread: conv.unread_count > 0,
    };
  });

  const conversations = useMemo(() => {
    const list = [...baseConversations];
    const newUserState = location.state?.newUser;

    if (isNewConversation && newUserState) {
      // Avoid duplication if fetched server list already includes this user thread
      const exists = list.some(c => c.id === selectedId);
      if (!exists) {
        list.unshift({
          id: selectedId!,
          user: {
            name: newUserState.name,
            avatar: newUserState.avatar,
            color: "#2222EE",
          },
          lastMessage: "Start a new conversation",
          timestamp: "",
          unread: false,
        });
      }
    }
    return list;
  }, [baseConversations, isNewConversation, selectedId, location.state?.newUser]);

  // Flatten all messages from pages
  const allMessages = useMemo(() => {
    if (!historyData?.pages) return [];
    return historyData.pages.flatMap(page => page.results || []);
  }, [historyData?.pages]);

  // Sync state with fetched history
  useEffect(() => {
    if (historyData?.pages && !isNewConversation) {
      const mappedMessages: ChatMessage[] = allMessages.map((msg: MessageResponse) => ({
        id: msg.id.toString(),
        senderId: msg.sender.id === user?.id ? "me" : "other",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: (msg.entity_type === "post" || msg.entity_type === "cause" || msg.entity_type === "collective" || msg.entity_type === "profile") ? "card" : (msg.entity_type === "video" ? "video" : (msg.entity_type === "image" ? "image" : "text")),
        mediaUrl:
          msg.entity_type === "image" || msg.entity_type === "video"
            ? msg.entity_data?.url || msg.content
            : undefined,
        cardData:
          msg.entity_type === "post" || msg.entity_type === "cause" || msg.entity_type === "collective" || msg.entity_type === "profile"
            ? {
              type: msg.entity_type,
              id: msg.entity_id || msg.entity_data?.id,
              title:
                msg.entity_type === "profile" ? (msg.entity_data?.full_name || `${msg.entity_data?.first_name || ''} ${msg.entity_data?.last_name || ''}`.trim() || msg.entity_data?.username || "Shared Profile") :
                msg.entity_type === "post" ? (msg.entity_data?.user?.full_name || msg.entity_data?.user?.username || "Shared Post") :
                (msg.entity_data?.collective?.name ||
                msg.entity_data?.fundraiser?.name ||
                msg.entity_data?.name ||
                (msg.entity_type === "cause"
                  ? "Shared Nonprofit"
                  : msg.entity_type === "collective"
                    ? "Shared Group"
                    : "Shared Post")),
              description:
                msg.entity_type === "profile" ? (msg.entity_data?.bio || "") :
                msg.entity_data?.content ||
                msg.entity_data?.mission ||
                msg.entity_data?.description ||
                "",
              image:
                msg.entity_type === "profile" ? (msg.entity_data?.profile_picture || msg.entity_data?.avatar || "") :
                msg.entity_data?.media ||
                msg.entity_data?.image ||
                msg.entity_data?.logo ||
                msg.entity_data?.avatar ||
                "",
              icon: "🔗",
              avatar: msg.entity_type === "post" ? msg.entity_data?.user?.profile_picture : undefined,
              likesCount: msg.entity_data?.likes_count || 0,
              commentsCount: msg.entity_data?.comments_count || 0,
              color: msg.entity_data?.color || msg.entity_data?.collective?.color || undefined,
              sortName: msg.entity_data?.sort_name || msg.entity_data?.collective?.sort_name || undefined,
              username: msg.entity_data?.username,
            }
            : undefined,
        isRead: msg.is_read,
      })).reverse();

      setMessages(mappedMessages);
    } else if (!selectedId || isNewConversation) {
      setMessages([]);
    }
  }, [
    historyData?.pages,
    allMessages,
    selectedId,
    isNewConversation,
    user?.id,
  ]);

  useEffect(() => {
    setMessages([]);
  }, [selectedId]);

  // Invalidate queries fresh whenever a conversation route is opened
  useEffect(() => {
    if (selectedId && !isNewConversation) {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [selectedId, isNewConversation, queryClient]);


  const handleNewMessage = useCallback((data: MessageResponse & { conversation?: { id: number | string } }) => {
    // Ignore messages from other chats
    if (data.conversation?.id?.toString() !== selectedId) return;

    const newMessage: ChatMessage = {
      id: data.id.toString(),
      senderId: data.sender.id === user?.id ? "me" : "other",
      text: data.content,
      timestamp: new Date(data.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: (data.entity_type === "post" || data.entity_type === "nonprofit" || data.entity_type === "collective" || data.entity_type === "profile") ? "card" : (data.entity_type === "video" ? "video" : (data.entity_type === "image" ? "image" : "text")),
      mediaUrl:
        data.entity_type === "image" || data.entity_type === "video"
          ? data.entity_data?.url || data.content
          : undefined,
      cardData:
        data.entity_type === "post" || data.entity_type === "nonprofit" || data.entity_type === "collective" || data.entity_type === "profile"
          ? {
            type: data.entity_type,
            id: data.entity_id || data.entity_data?.id,
            title:
              data.entity_type === "profile" ? (data.entity_data?.full_name || `${data.entity_data?.first_name || ''} ${data.entity_data?.last_name || ''}`.trim() || data.entity_data?.username || "Shared Profile") :
              data.entity_type === "post" ? (data.entity_data?.user?.full_name || data.entity_data?.user?.username || "Shared Post") :
              (data.entity_data?.collective?.name ||
              data.entity_data?.fundraiser?.name ||
              data.entity_data?.name ||
              (data.entity_type === "nonprofit"
                ? "Shared Nonprofit"
                : data.entity_type === "collective"
                  ? "Shared Group"
                  : "Shared Post")),
            description:
              data.entity_type === "profile" ? (data.entity_data?.bio || "") :
              data.entity_data?.content ||
              data.entity_data?.mission ||
              data.entity_data?.description ||
              "",
            image:
              data.entity_type === "profile" ? (data.entity_data?.profile_picture || data.entity_data?.avatar || "") :
              data.entity_data?.media ||
              data.entity_data?.image ||
              data.entity_data?.logo ||
              data.entity_data?.avatar ||
              "",
            icon: "🔗",
            avatar: data.entity_type === "post" ? data.entity_data?.user?.profile_picture : undefined,
            likesCount: data.entity_data?.likes_count || 0,
            commentsCount: data.entity_data?.comments_count || 0,
            color: data.entity_data?.color || data.entity_data?.collective?.color || undefined,
            sortName: data.entity_data?.sort_name || data.entity_data?.collective?.sort_name || undefined,
            username: data.entity_data?.username,
          }
          : undefined,
      isRead: data.is_read || false,
    };

    setMessages(prev => {
      // prevent duplicates
      const exists = prev.some(m => m.id === newMessage.id);
      if (exists) return prev;

      return [...prev, newMessage];
    });
  }, [selectedId, user?.id]);

  useChatSocket(selectedId, handleNewMessage);

  const selectedConversation = conversations.find(c => c.id === selectedId);


  const handleBack = () => {
    navigate("/messages");
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };


  const handleSend = async (images?: File[]) => {
    if (!inputValue.trim() && (!images || images.length === 0)) return;

    try {
      const actualConvId = isNewConversation ? "" : (selectedId || "");
      const recipientId = isNewConversation ? selectedId?.replace("new-", "") : "";

      if (images && images.length > 0) {
        // Handle image uploads
        for (const file of images) {
          const formData = new FormData();
          if (actualConvId) formData.append("conversation_id", actualConvId);
          if (recipientId) formData.append("recipient_id", recipientId);
          formData.append("content", inputValue.trim() || "");
          formData.append("file", file);
          formData.append("entity_type", file.type.startsWith("video/") ? "video" : "image");

          await sendChatMessage(formData);
        }
      } else if (inputValue.trim()) {
        // Handle plain text
        const formData = new FormData();
        if (actualConvId) formData.append("conversation_id", actualConvId);
        if (recipientId) formData.append("recipient_id", recipientId);
        formData.append("content", inputValue.trim());

        await sendChatMessage(formData);
      }

      setInputValue("");
      if (isNewConversation) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
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
          onBackClick={() => navigate("/")}
        />
      </div>

      {/* Mobile Header (Chat View) */}
      {selectedId && (selectedConversation ? (
        <div className="md:hidden flex items-center gap-3 px-4 h-16 border-b bg-white sticky top-0 z-10">
          <button onClick={handleBack} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedConversation.user.avatar} className="object-cover" />
            <AvatarFallback className="text-white font-semibold text-lg" style={{ backgroundColor: selectedConversation.user.color }}>
              {selectedConversation.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-bold text-lg text-gray-900 flex-1 truncate">
            {selectedConversation.user.name}
          </h2>
        </div>
      ) : isConversationsLoading ? (
        <div className="md:hidden flex items-center gap-3 px-4 h-16 border-b bg-white sticky top-0 z-10 animate-pulse">
          <button onClick={handleBack} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-gray-400" />
          </button>
          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      ) : null)}

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
              className="pl-12 bg-gray-50 border-none h-11 rounded-xl text-base placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversation List Pane */}
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isConversationsLoading}
          className={cn(
            "w-full md:w-[400px] border-r",
            selectedId ? "hidden md:flex" : "flex"
          )}
        />

        {/* Chat Pane */}
        <ChatView
          conversation={selectedConversation || null}
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          isLoading={(!isNewConversation && isHistoryLoading) || isConversationsLoading}
          className={cn(
            "flex-1",
            !selectedId ? "hidden md:flex" : "flex"
          )}
        />
      </div>
    </div>
  );
}
