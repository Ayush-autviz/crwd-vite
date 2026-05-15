import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/store";
import { useChatStore } from "@/stores/chatStore";
import { useQueryClient } from "@tanstack/react-query";

interface NewMessagePayload {
  type: "new_message";
  data: {
    id: number;
    content: string;
    sender: any;
    created_at: string;
  };
  conversation: any;
}

interface MessagesReadPayload {
  type: "messages_read";
  reader_id: number;
  conversation_id: number;
}

export function useNotificationSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const markAsRead = useCallback((conversationId: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "mark_read",
          conversation_id: conversationId,
        })
      );
    } else {
      console.warn(`[WS-Send] Cannot mark_read: Socket not open. State: ${socketRef.current?.readyState}`);
    }
  }, []);

  useEffect(() => {
    if (!token?.access_token || !user?.id) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // Use VITE_SOCKET_URL if available, otherwise fallback to localhost
    const baseUrl = import.meta.env.VITE_SOCKET_URL;
    const protocol = "wss:";
    const wsUrl = `${protocol}//${baseUrl}ws/notifications/?token=${token.access_token}`;

    const connect = () => {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("[WS-Open] Notification WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);


          if (payload.type === "new_message") {
            const { conversation, data: messageData } = payload as NewMessagePayload;


            const activeConversationId = useChatStore.getState().activeConversationId;
            const isCurrentlyViewing = activeConversationId === conversation.id.toString();

            if (isCurrentlyViewing) {

              markAsRead(conversation.id);
            }

            // 1. Update the conversations list in React Query cache (sidebar)
            queryClient.setQueriesData({ queryKey: ["conversations"] }, (oldData: any) => {
              if (!oldData || !oldData.results) return oldData;

              const results = [...oldData.results];
              const index = results.findIndex((c: any) => c.id === conversation.id);

              if (index !== -1) {
                // Merge old conversation data with new one to preserve participants if they are missing
                results[index] = {
                  ...results[index],
                  ...conversation,
                  // If we are currently viewing it, ensure unread_count is 0
                  unread_count: isCurrentlyViewing ? 0 : conversation.unread_count,
                  // Ensure we don't overwrite participants with undefined
                  participants: conversation.participants || results[index].participants,
                };
                // Move to top
                const [moved] = results.splice(index, 1);
                results.unshift(moved);
              } else {
                results.unshift({
                  ...conversation,
                  unread_count: isCurrentlyViewing ? 0 : conversation.unread_count,
                });
              }

              return {
                ...oldData,
                results,
              };
            });

            // 2. Update the message history if it exists in cache

            queryClient.setQueryData(["messages", conversation.id.toString()], (oldData: any) => {
              if (!oldData || !oldData.pages) return oldData;

              // Prepend to first page's results (assuming page 1 has newest messages)
              const firstPage = oldData.pages[0];

              // Check for duplicates
              const exists = firstPage.results?.some((m: any) => m.id === messageData.id);
              if (exists) {
                return oldData;
              }

              const updatedFirstPage = {
                ...firstPage,
                results: [messageData, ...(firstPage.results || [])],
                count: (firstPage.count || 0) + 1,
              };

              return {
                ...oldData,
                pages: [updatedFirstPage, ...oldData.pages.slice(1)],
              };
            });
          } else if (payload.type === "messages_read") {
            const { conversation_id, reader_id } = payload as MessagesReadPayload;

            // 1. Update unread count for the specific conversation (sidebar)
            queryClient.setQueriesData({ queryKey: ["conversations"] }, (oldData: any) => {
              if (!oldData || !oldData.results) return oldData;
              const results = oldData.results.map((c: any) => {
                if (c.id === conversation_id) {
                  return { ...c, unread_count: 0 };
                }
                return c;
              });

              return {
                ...oldData,
                results,
              };
            });

            // 2. Update messages history cache to show "blue ticks" (is_read: true)
            queryClient.setQueryData(["messages", conversation_id.toString()], (oldData: any) => {
              if (!oldData || !oldData.pages) {
                return oldData;
              }

              let updatedCount = 0;
              const updatedPages = oldData.pages.map((page: any) => ({
                ...page,
                results: page.results?.map((msg: any) => {
                  // Ensure IDs are compared as the same type (number)
                  const msgSenderId = Number(msg.sender?.id || msg.sender_id);
                  const readerId = Number(reader_id);

                  // If the person who read the messages is NOT the one who sent this message,
                  // then this message is now read.
                  if (msgSenderId !== readerId && !msg.is_read) {
                    updatedCount++;
                    return { ...msg, is_read: true };
                  }
                  return msg;
                }),
              }));

              return {
                ...oldData,
                pages: updatedPages,
              };
            });
          }
        } catch (err) {
          console.error("[WS-Error] Failed to parse message:", err);
        }
      };

      socket.onclose = (event) => {
        console.log("Notification WebSocket disconnected", event.reason);
        // Reconnect after 3 seconds
        if (token?.access_token) {
          setTimeout(connect, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("Notification WebSocket error:", err);
        socket.close();
      };

      socketRef.current = socket;
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token?.access_token, user?.id, queryClient]);

  return { markAsRead };
}
